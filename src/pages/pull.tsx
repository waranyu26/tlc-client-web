import type { ReactNode } from 'react';
import type { BuybackResult } from 'src/api/types';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/axios';
import { getPull } from 'src/api/pull.api';
import { usePack } from 'src/api/pack.api';
import enPull from 'src/i18n/locales/en/pull.json';
import thPull from 'src/i18n/locales/th/pull.json';
import { useCardBuyback } from 'src/api/catalog.api';
import { registerNamespace } from 'src/i18n/register';
import { useWalletBalance } from 'src/api/wallet.api';
import { useBuybackMutation } from 'src/api/buyback.api';
import { usePullPrefsStore } from 'src/store/pull-prefs-store';
import { isStagePhase, usePullFlowStore } from 'src/store/pull-flow-store';

import {
  PullIdleView,
  PullCountdown,
  CardRevealView,
  PullChooseView,
  PullStageShell,
  PullPendingView,
  usePullSequence,
  randomClientSeed,
  PullSuspenseView,
  BuybackSuccessView,
} from 'src/sections/pull';

// ----------------------------------------------------------------------

registerNamespace('pull', enPull, thPull);

export default function PullPage() {
  const { t } = useTranslation('pull');
  const navigate = useNavigate();
  // Every pull belongs to a pack: the price and the odds are the pack's, so
  // there is no pull screen without one.
  const { id: packId } = useParams<{ id: string }>();

  const phase = usePullFlowStore((state) => state.phase);
  const result = usePullFlowStore((state) => state.result);
  const pickedIndex = usePullFlowStore((state) => state.pickedIndex);
  const setPhase = usePullFlowStore((state) => state.setPhase);
  const revealImmediately = usePullFlowStore((state) => state.revealImmediately);
  const reset = usePullFlowStore((state) => state.reset);

  // A user who has asked the OS for less motion has asked for it here too.
  const reduceMotion = Boolean(useReducedMotion());
  const skipPick = usePullPrefsStore((state) => state.skipPick);

  const packQuery = usePack(packId);
  const walletQuery = useWalletBalance();
  const buybackMutation = useBuybackMutation();

  // Buyback preview for the revealed card. `result` is stored the moment the API
  // responds — well before the reveal is on screen — so this has time to resolve.
  const cardBuybackQuery = useCardBuyback(result?.card_id ?? '');

  const [buybackResult, setBuybackResult] = useState<BuybackResult | null>(null);
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconcileMessage, setReconcileMessage] = useState<string | null>(null);
  const [reconcileTone, setReconcileTone] = useState<'neutral' | 'success' | 'error'>('neutral');

  // Seeded once per page, then re-rolled after each attempt so two pulls never
  // share a client seed by accident — an identical seed is not unsafe (the
  // beacon still differs) but it makes two receipts look copy-pasted.
  const [clientSeed, setClientSeed] = useState(randomClientSeed);

  const handleAttemptStart = useCallback(() => {
    setBuybackResult(null);
    setReconcileMessage(null);
  }, []);

  const {
    start,
    retry,
    pick,
    skip,
    completePeel,
    pending,
    setPending,
    intensity,
    isMutating,
    countdownWindow,
  } = usePullSequence({
      packId,
      rarityOdds: packQuery.data?.rarity_odds,
      reduceMotion,
      skipPick,
      clientSeed,
      onAttemptStart: handleAttemptStart,
    });

  const priceSatang = packQuery.data?.price_satang;
  const balanceSatang = walletQuery.data?.balance_satang;
  const canAfford =
    priceSatang === undefined || balanceSatang === undefined || balanceSatang >= priceSatang;

  const handlePull = useCallback(() => {
    if (!canAfford) {
      navigate(paths.wallet);
      return;
    }
    start();
  }, [canAfford, navigate, start]);

  const handlePullAgain = useCallback(
    (balanceAfterSatang: number) => {
      if (priceSatang !== undefined && balanceAfterSatang < priceSatang) {
        navigate(paths.wallet);
        return;
      }
      // Fresh seed for a fresh commitment. Reusing the last one is not unsafe —
      // the beacon differs — but two receipts carrying the same seed read like
      // a copy-paste, which is the opposite of what a receipt is for.
      setClientSeed(randomClientSeed());
      start();
    },
    [navigate, priceSatang, start]
  );

  const handleAddToVault = useCallback(() => {
    reset();
  }, [reset]);

  const handleSellInstantly = useCallback(() => {
    if (!result) return;
    buybackMutation.mutate(
      { card_id: result.card_id },
      {
        onSuccess: (data) => {
          setBuybackResult(data);
          setPhase('buyback');
        },
      }
    );
  }, [buybackMutation, result, setPhase]);

  const handleBuybackDone = useCallback(() => {
    setBuybackResult(null);
    reset();
  }, [reset]);

  /**
   * Ask the server what happened to an interrupted pull.
   *
   * This used to mean diffing the wallet balance and collection against a
   * snapshot taken before the attempt, and inferring. It does not any more: a
   * committed pull has a ticket id, and the ticket says plainly whether it is
   * still waiting on its beacon, resolved, or refunded.
   */
  const handleCheckStatus = useCallback(async () => {
    if (!pending) return;
    setIsReconciling(true);
    setReconcileMessage(null);

    try {
      if (!pending.ticketId) {
        // The commit never landed, so nothing was charged and the key is unused.
        setReconcileTone('neutral');
        setReconcileMessage(t('pending.notCharged'));
        return;
      }

      const ticket = await getPull(pending.ticketId);

      if (ticket.status === 'resolved' && ticket.card) {
        setPending(null);
        setReconcileTone('success');
        setReconcileMessage(t('pending.resolvedSuccess'));
        // No theatre for a recovered pull — the suspense already happened, badly.
        revealImmediately({
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
      } else if (ticket.status === 'refunded') {
        setPending(null);
        setReconcileTone('neutral');
        setReconcileMessage(
          t('pending.refunded', {
            defaultValue: 'That pull could not be filled, so you were refunded.',
          })
        );
        walletQuery.refetch();
      } else {
        setReconcileTone('neutral');
        setReconcileMessage(t('pending.stillChecking'));
      }
    } catch {
      setReconcileTone('error');
      setReconcileMessage(t('errors.pullFailed'));
    } finally {
      setIsReconciling(false);
    }
  }, [pending, revealImmediately, setPending, t, walletQuery]);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  if (pending) {
    return (
      <PullPendingView
        isChecking={isReconciling}
        onCheckStatus={handleCheckStatus}
        onRetry={retry}
        message={reconcileMessage}
        messageTone={reconcileTone}
      />
    );
  }

  if (phase === 'buyback' && buybackResult) {
    return (
      <BuybackSuccessView
        buyback={buybackResult}
        cardName={result?.card_name}
        canPullAgain={
          priceSatang === undefined ? true : buybackResult.balance_satang >= priceSatang
        }
        onPullAgain={() => handlePullAgain(buybackResult.balance_satang)}
        onDone={handleBuybackDone}
      />
    );
  }

  if (isStagePhase(phase)) {
    const showChoose = phase === 'shuffle' || phase === 'choosing' || phase === 'converge';
    const showSuspense =
      phase === 'converge' || phase === 'charge' || phase === 'flip' || phase === 'peel';
    // The two phases where the user is holding the wheel: a stray backdrop tap
    // must not pick a card for them, nor uncover the one they're savouring.
    const skippable = phase !== 'choosing' && phase !== 'peel';

    // `charge` is a live wait on a beacon that has not published yet, so it
    // counts itself down rather than repeating a line of copy. The announcement
    // stays prose: the digits are decoration, the phase is the information.
    let caption: ReactNode;
    if (phase === 'charge' && countdownWindow) {
      caption = (
        <PullCountdown
          startAt={countdownWindow.startAt}
          endAt={countdownWindow.endAt}
          reduceMotion={reduceMotion}
        />
      );
    } else if (showSuspense) {
      caption = t(`stage.${phase}`);
    }

    return (
      <PullStageShell
        reduceMotion={reduceMotion}
        shake={phase === 'flip' ? intensity.shakeAmplitude : 0}
        onSkip={skippable ? skip : undefined}
        skipLabel={skippable ? t('stage.skip') : undefined}
        announcement={t(`stage.${phase}`)}
        caption={caption}
      >
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: '100%',
          }}
        >
          {showChoose ? (
            <Box
              sx={{
                gridArea: '1 / 1',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                opacity: phase === 'converge' ? 0 : 1,
                pointerEvents: phase === 'converge' ? 'none' : 'auto',
                transition: 'opacity 480ms ease',
              }}
            >
              <PullChooseView onPick={pick} pickedIndex={pickedIndex} reduceMotion={reduceMotion} />
            </Box>
          ) : null}

          {showSuspense ? (
            <Box sx={{ gridArea: '1 / 1', zIndex: 2 }}>
              <PullSuspenseView
                phase={phase}
                intensity={intensity}
                result={result}
                pickedIndex={pickedIndex}
                onPeelComplete={completePeel}
                reduceMotion={reduceMotion}
              />
            </Box>
          ) : null}
        </Box>
      </PullStageShell>
    );
  }

  if (phase === 'reveal' && result) {
    return (
      <CardRevealView
        result={result}
        intensity={intensity}
        reduceMotion={reduceMotion}
        // The pack page no longer ships a card list, so there is no local
        // fallback price: the per-card quote is the only source.
        buybackPreviewSatang={cardBuybackQuery.data?.buyback_price_satang}
        isSelling={buybackMutation.isPending}
        onSellInstantly={handleSellInstantly}
        onAddToVault={handleAddToVault}
        canPullAgain={priceSatang === undefined ? true : result.new_balance_satang >= priceSatang}
        onPullAgain={() => handlePullAgain(result.new_balance_satang)}
        pullPriceSatang={priceSatang}
      />
    );
  }

  // Idle
  if (packQuery.isPending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <CircularProgress size={22} sx={{ color: '#E7CE92' }} />
      </Box>
    );
  }

  if (packQuery.isError) {
    const message =
      packQuery.error instanceof ApiError ? packQuery.error.message : t('errors.pullFailed');
    return (
      <Box sx={{ padding: '40px 20px', textAlign: 'center', color: '#C9605B', fontSize: '13px' }}>
        {message}
      </Box>
    );
  }

  return (
    <PullIdleView
      rarityOdds={packQuery.data?.rarity_odds}
      priceSatang={priceSatang}
      canAfford={canAfford}
      disabled={isMutating}
      clientSeed={clientSeed}
      onClientSeedChange={setClientSeed}
      onPull={handlePull}
    />
  );
}
