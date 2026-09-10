import type { PullTicket, PackRarityOdds } from 'src/api/types';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { calmIntensity, getPullIntensity } from 'src/utils/rarity-intensity';

import { haptic } from 'src/lib/haptics';
import { usePullTicket, useCommitPull } from 'src/api/pull.api';
import { PICK_CARD_COUNT, usePullFlowStore } from 'src/store/pull-flow-store';
import {
  payoff,
  whoosh,
  flipSnap,
  unlockSfx,
  pickThunk,
  charge as chargeSfx,
} from 'src/lib/pull-sfx';

// ----------------------------------------------------------------------
// The pull lifecycle: commit, then reveal, and the timeline that walks the
// store from `shuffle` to `reveal`.
//
// A pull is charged against a drand round that has not been published yet, so
// the card genuinely does not exist for the first few seconds — not even
// server-side. That wait is not a loading spinner bolted on: the commit fires
// at `shuffle`, so the beacon lands underneath the deal *and* however long the
// user takes to choose a card. `charge` already refused to advance until both
// the result and its decoded art were in hand, so the beacon simply became a
// third thing that gate waits for.
// ----------------------------------------------------------------------

const TIMING = {
  full: { shuffle: 1300, converge: 750, chargeBase: 900, flip: 650 },
  reduced: { shuffle: 400, converge: 260, chargeBase: 380, flip: 260 },
};

/**
 * Ceiling on waiting for the art to decode. A slow CDN must not stall the reveal.
 *
 * Short on purpose. The flip lands on a *sleeve*, not the art, so the decode
 * keeps running under cover for the whole turn and for however long the user
 * takes to grab the sleeve — a second or more of free headroom that this gate
 * does not need to buy again. Waiting longer here bought nothing and was paid
 * for in the one place it is felt, with the customer stuck on `charge`.
 */
const DECODE_TIMEOUT_MS = 600;

export type PendingAttempt = {
  key: string;
  /** Set once the commit succeeded, so a retry can poll rather than re-charge. */
  ticketId?: string;
  /**
   * The seed this attempt was committed with. Carried so a retry re-sends the
   * same one: the idempotency key already makes the server replay the original
   * ticket, but sending a different seed on the wire would make the request
   * look like a different commitment to anyone reading the traffic.
   */
  clientSeed?: string;
};

export type UsePullSequenceArgs = {
  packId?: string;
  rarityOdds?: PackRarityOdds[];
  reduceMotion: boolean;
  skipPick: boolean;
  /**
   * The player's own entropy, mixed into the commitment preimage.
   *
   * Optional: the server generates one when this is empty, which is what
   * happened for every pull before this was exposed. Supplying it is what turns
   * commit-reveal into provably fair — the outcome then depends on an input we
   * demonstrably did not choose.
   */
  clientSeed?: string;
  /** Called once per new attempt, before the request goes out, to snapshot state for reconciliation. */
  onAttemptStart?: () => void;
};

export function usePullSequence({
  packId,
  rarityOdds,
  reduceMotion,
  skipPick,
  clientSeed,
  onAttemptStart,
}: UsePullSequenceArgs) {
  const phase = usePullFlowStore((state) => state.phase);
  const result = usePullFlowStore((state) => state.result);
  const imageReady = usePullFlowStore((state) => state.imageReady);

  const commitMutation = useCommitPull(packId);
  const mutateRef = useRef(commitMutation.mutate);
  mutateRef.current = commitMutation.mutate;

  // The committed ticket. Polling it is only an accelerator — the server
  // resolves pulls in the background too, so closing the tab still awards the
  // card.
  const [ticketId, setTicketId] = useState<string | null>(null);
  const ticketQuery = usePullTicket(ticketId ?? undefined, Boolean(ticketId));

  const [pending, setPending] = useState<PendingAttempt | null>(null);
  // Flipped once the charge window has elapsed; the flip itself still waits on
  // the result and its decoded art, so these two conditions meet whenever they meet.
  const [chargeElapsed, setChargeElapsed] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  // Navigating away mid-pull must not leave timers running against an unmounted tree.
  useEffect(() => () => clearTimers(), [clearTimers]);

  const timing = reduceMotion ? TIMING.reduced : TIMING.full;

  const intensity = useMemo(() => {
    const base = getPullIntensity(result?.rarity, rarityOdds);
    return reduceMotion ? calmIntensity(base) : base;
  }, [rarityOdds, reduceMotion, result?.rarity]);

  // `enterCharge` is scheduled during `converge`, before the result may have
  // landed. Reading the tier through a ref means a legendary that resolves late
  // still gets its long charge, instead of the standard one captured at pick time.
  const intensityRef = useRef(intensity);
  intensityRef.current = intensity;

  // ------------------------------------------------------------------
  // Reveal — the beacon has landed
  // ------------------------------------------------------------------
  useEffect(() => {
    const ticket = ticketQuery.data;
    if (!ticket || ticket.status === 'pending') return;

    if (ticket.status === 'refunded' || !ticket.card) {
      // The pack could not honour the pull and the money is already back. Drop
      // out of the theatre rather than flipping a card that does not exist.
      clearTimers();
      usePullFlowStore.getState().reset();
      setTicketId(null);
      setPending({ key: crypto.randomUUID(), ticketId: ticket.ticket_id });
      return;
    }

    usePullFlowStore.getState().setResult({
      ticket_id: ticket.ticket_id,
      pack_id: ticket.pack_id,
      card_id: ticket.card.card_id,
      card_name: ticket.card.card_name,
      set_name: ticket.card.set_name,
      kind: ticket.card.kind,
      rarity: ticket.card.rarity_code,
      image_url: ticket.card.image_url,
      thumb_url: ticket.card.thumb_url,
      psa_cert_number: ticket.card.psa_cert_number,
      psa_grade: ticket.card.psa_grade,
      price_satang: ticket.price_satang,
      new_balance_satang: ticket.new_balance_satang,
    });
    setTicketId(null);
  }, [clearTimers, ticketQuery.data]);

  // ------------------------------------------------------------------
  // Art preload — the flip gate
  // ------------------------------------------------------------------
  useEffect(() => {
    const src = result?.thumb_url || result?.image_url;
    if (!result) return undefined;
    if (!src) {
      usePullFlowStore.getState().setImageReady(true);
      return undefined;
    }

    let cancelled = false;
    const done = () => {
      if (!cancelled) usePullFlowStore.getState().setImageReady(true);
    };

    const img = new Image();
    img.src = src;
    // decode() rejects on a broken image; either way the reveal must proceed.
    img.decode().then(done, done);
    const timeout = setTimeout(done, DECODE_TIMEOUT_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [result]);

  // ------------------------------------------------------------------
  // Phase transitions
  // ------------------------------------------------------------------

  const enterCharge = useCallback(() => {
    clearTimers();
    setChargeElapsed(false);
    usePullFlowStore.getState().setPhase('charge');

    const live = intensityRef.current;
    const duration = timing.chargeBase + live.chargeBonusMs;
    chargeSfx(duration, live.tier);
    later(() => setChargeElapsed(true), duration);
  }, [clearTimers, later, timing.chargeBase]);

  const pick = useCallback(
    (index: number) => {
      // Tapping a card mid-deal counts: the grid is already on screen and making
      // an eager user wait for the stagger to finish would be pure friction.
      const current = usePullFlowStore.getState().phase;
      if (current !== 'choosing' && current !== 'shuffle') return;
      clearTimers();

      pickThunk();
      whoosh(timing.converge);
      haptic('pick');

      const store = usePullFlowStore.getState();
      store.setPickedIndex(index);
      store.setPhase('converge');

      later(enterCharge, timing.converge);
    },
    [clearTimers, enterCharge, later, timing.converge]
  );

  const pickRef = useRef(pick);
  pickRef.current = pick;

  const enterChoosing = useCallback(() => {
    clearTimers();
    usePullFlowStore.getState().setPhase('choosing');
    // The regulars' path: the ritual still plays, it just plays itself.
    if (skipPick) {
      later(() => pickRef.current(Math.floor(Math.random() * PICK_CARD_COUNT)), 120);
    }
  }, [clearTimers, later, skipPick]);

  // Charge holds until BOTH the window has elapsed and the card is ready to show.
  useEffect(() => {
    if (phase !== 'charge' || !chargeElapsed || !result || !imageReady) return;
    // Read the live phase too, not just the closure: StrictMode re-invokes this
    // effect with a stale `phase`, and the flip must fire exactly once. The
    // reveal timer is deliberately NOT cleaned up on dep change — this effect
    // re-runs the moment it sets the phase, and tearing the timer down there
    // would strand the pull on a flipped card. Unmount clears it via `timers`.
    if (usePullFlowStore.getState().phase !== 'charge') return;

    usePullFlowStore.getState().setPhase('flip');
    flipSnap();
    haptic('flip');

    // The turn lands on a sleeve, not the art. `peel` then waits on the user for
    // as long as they want — it is the only phase with no timer at all.
    later(() => usePullFlowStore.getState().setPhase('peel'), timing.flip);
  }, [chargeElapsed, imageReady, later, phase, result, timing.flip]);

  /** The sleeve has cleared the card — this is the payoff instant. */
  const completePeel = useCallback(() => {
    if (usePullFlowStore.getState().phase !== 'peel') return;
    usePullFlowStore.getState().setPhase('reveal');
    payoff(intensityRef.current.tier);
    haptic(intensityRef.current.tier);
  }, []);

  // ------------------------------------------------------------------
  // Entry points
  // ------------------------------------------------------------------

  // Read through a ref: `executePull` is memoised on timing only, and rebuilding
  // it whenever the player types into the seed box would restart the timeline.
  const seedRef = useRef(clientSeed);
  seedRef.current = clientSeed;

  const executePull = useCallback(
    (key: string, seedOverride?: string) => {
      const seed = seedOverride ?? seedRef.current;
      clearTimers();
      setChargeElapsed(false);
      unlockSfx();
      haptic('tap');

      usePullFlowStore.getState().startPull();
      later(enterChoosing, timing.shuffle);

      mutateRef.current(
        { idempotencyKey: key, clientSeed: seed || undefined },
        {
          onSuccess: (ticket: PullTicket) => {
            // The charge has happened and the commitment is durable, but the
            // card is not decided yet. Start polling; the phase timeline runs
            // independently and `charge` waits for whatever arrives.
            if (ticket.status === 'pending') {
              setTicketId(ticket.ticket_id);
              return;
            }
            // A replayed idempotency key can come back already resolved.
            setTicketId(ticket.ticket_id);
          },
          onError: () => {
            clearTimers();
            usePullFlowStore.getState().reset();
            setPending({ key, clientSeed: seed });
          },
        }
      );
    },
    [clearTimers, enterChoosing, later, timing.shuffle]
  );

  /** A brand-new attempt: fresh Idempotency-Key. */
  const start = useCallback(() => {
    onAttemptStart?.();
    executePull(crypto.randomUUID());
  }, [executePull, onAttemptStart]);

  /** Retry of an interrupted attempt: the SAME key, so the wallet is never charged twice (FR15/FR19). */
  const retry = useCallback(() => {
    if (!pending) return;

    // If the commit already went through, the pull exists and is being resolved
    // server-side — re-poll it rather than sending anything that could look
    // like a second attempt.
    if (pending.ticketId) {
      setPending(null);
      setTicketId(pending.ticketId);
      return;
    }

    setPending(null);
    // Same key AND same seed: a retry must be byte-identical to the attempt it
    // resumes, or it is a different commitment wearing the same key.
    executePull(pending.key, pending.clientSeed);
  }, [executePull, pending]);

  /** Tap-to-fast-forward. Never skips the flip or the peel — those are the payoff, not the wait. */
  const skip = useCallback(() => {
    const state = usePullFlowStore.getState();
    switch (state.phase) {
      case 'shuffle':
        enterChoosing();
        break;
      case 'choosing':
        pickRef.current(Math.floor(Math.random() * PICK_CARD_COUNT));
        break;
      case 'converge':
        enterCharge();
        break;
      case 'charge':
        setChargeElapsed(true);
        break;
      // 'peel' is deliberately absent: the sleeve itself is the affordance
      // (drag it, or tap it), so a stray backdrop tap must not uncover the card.
      default:
        break;
    }
  }, [enterCharge, enterChoosing]);

  return {
    start,
    retry,
    pick,
    completePeel,
    skip,
    pending,
    setPending,
    intensity,
    isMutating: commitMutation.isPending,
    /** True while the committed beacon round has not been published yet. */
    awaitingBeacon: ticketQuery.data?.status === 'pending',
    revealAt: ticketQuery.data?.commitment.reveal_at,
  };
}
