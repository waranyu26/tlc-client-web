import type { PullResult, PackRarityOdds } from 'src/api/types';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { calmIntensity, getPullIntensity } from 'src/utils/rarity-intensity';

import { haptic } from 'src/lib/haptics';
import { usePullMutation } from 'src/api/pack.api';
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
// The pull lifecycle: one mutation, one idempotency key, and the timeline that
// walks the store from `shuffle` to `reveal`.
//
// The API call fires at the very start, so the round trip runs underneath the
// deal *and* however long the user takes to choose. By the time the card is
// charging, the result and its decoded art are almost always already in hand —
// which is why `charge` is the only phase that can stretch, and the flip never
// shows a blank face.
// ----------------------------------------------------------------------

const TIMING = {
  full: { shuffle: 1300, converge: 750, chargeBase: 900, flip: 650 },
  reduced: { shuffle: 400, converge: 260, chargeBase: 380, flip: 260 },
};

/** Ceiling on waiting for the art to decode. A slow CDN must not stall the reveal. */
const DECODE_TIMEOUT_MS = 2000;

export type PendingAttempt = { key: string };

export type UsePullSequenceArgs = {
  packId?: string;
  rarityOdds?: PackRarityOdds[];
  reduceMotion: boolean;
  skipPick: boolean;
  /** Called once per new attempt, before the request goes out, to snapshot state for reconciliation. */
  onAttemptStart?: () => void;
};

export function usePullSequence({
  packId,
  rarityOdds,
  reduceMotion,
  skipPick,
  onAttemptStart,
}: UsePullSequenceArgs) {
  const phase = usePullFlowStore((state) => state.phase);
  const result = usePullFlowStore((state) => state.result);
  const imageReady = usePullFlowStore((state) => state.imageReady);

  const pullMutation = usePullMutation(packId);
  const mutateRef = useRef(pullMutation.mutate);
  mutateRef.current = pullMutation.mutate;

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

  const executePull = useCallback(
    (key: string) => {
      clearTimers();
      setChargeElapsed(false);
      unlockSfx();
      haptic('tap');

      usePullFlowStore.getState().startPull();
      later(enterChoosing, timing.shuffle);

      mutateRef.current(key, {
        onSuccess: (data: PullResult) => {
          // Stored the instant it lands — the phase timeline is independent, and
          // the head start is what makes the buyback quote and art ready on time.
          usePullFlowStore.getState().setResult(data);
        },
        onError: () => {
          clearTimers();
          usePullFlowStore.getState().reset();
          setPending({ key });
        },
      });
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
    setPending(null);
    executePull(pending.key);
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
    isMutating: pullMutation.isPending,
  };
}
