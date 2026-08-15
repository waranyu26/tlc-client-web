import type { PullResult, BuybackResult } from 'src/api/types';

import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router';
import { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/axios';
import { usePack } from 'src/api/pack.api';
import enPull from 'src/i18n/locales/en/pull.json';
import thPull from 'src/i18n/locales/th/pull.json';
import { registerNamespace } from 'src/i18n/register';
import { useWalletBalance } from 'src/api/wallet.api';
import { useBuybackMutation } from 'src/api/buyback.api';
import { usePullPrefsStore } from 'src/store/pull-prefs-store';
import { useCollection, useCardBuyback } from 'src/api/catalog.api';
import { isStagePhase, usePullFlowStore } from 'src/store/pull-flow-store';

import {
  PullIdleView,
  CardRevealView,
  PullChooseView,
  PullStageShell,
  PullPendingView,
  usePullSequence,
  PullSuspenseView,
  BuybackSuccessView,
} from 'src/sections/pull';

// ----------------------------------------------------------------------

registerNamespace('pull', enPull, thPull);

type AttemptSnapshot = {
  preBalanceSatang: number;
  preCollectionIds: Set<string>;
};

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
  const collectionQuery = useCollection();
  const buybackMutation = useBuybackMutation();

  // Buyback preview for the revealed card. `result` is stored the moment the API
  // responds — well before the reveal is on screen — so this has time to resolve.
  const cardBuybackQuery = useCardBuyback(result?.card_id ?? '');

  const attemptSnapshotRef = useRef<AttemptSnapshot | null>(null);

  const [buybackResult, setBuybackResult] = useState<BuybackResult | null>(null);
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconcileMessage, setReconcileMessage] = useState<string | null>(null);
  const [reconcileTone, setReconcileTone] = useState<'neutral' | 'success' | 'error'>('neutral');

  /** Snapshot balance + collection so an interrupted attempt can be reconciled later. */
  const handleAttemptStart = useCallback(() => {
    attemptSnapshotRef.current = {
      preBalanceSatang: walletQuery.data?.balance_satang ?? 0,
      preCollectionIds: new Set((collectionQuery.data ?? []).map((item) => item.instance_id)),
    };
    setBuybackResult(null);
    setReconcileMessage(null);
  }, [collectionQuery.data, walletQuery.data]);

  const { start, retry, pick, skip, completePeel, pending, setPending, intensity, isMutating } =
    usePullSequence({
      packId,
      rarityOdds: packQuery.data?.rarity_odds,
      reduceMotion,
      skipPick,
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
      { card_instance_id: result.instance_id },
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

  const handleCheckStatus = useCallback(async () => {
    if (!pending) return;
    setIsReconciling(true);
    setReconcileMessage(null);

    try {
      const [balanceRes, collectionRes] = await Promise.all([
        walletQuery.refetch(),
        collectionQuery.refetch(),
      ]);

      const snapshot = attemptSnapshotRef.current;
      const price = packQuery.data?.price_satang;
      const newBalance = balanceRes.data?.balance_satang;
      const newCollection = collectionRes.data ?? [];
      const newItem = snapshot
        ? newCollection.find((item) => !snapshot.preCollectionIds.has(item.instance_id))
        : undefined;

      if (
        snapshot &&
        price !== undefined &&
        newBalance !== undefined &&
        newItem &&
        newBalance === snapshot.preBalanceSatang - price
      ) {
        // Confirmed success server-side even though the client never saw the
        // response. cards_remaining is unknown here — the pack query refetches
        // it — so report what the pack last told us.
        const reconciled: PullResult = {
          instance_id: newItem.instance_id,
          pack_id: packId ?? '',
          card_id: newItem.card_id,
          card_name: newItem.name,
          set_name: newItem.set_name,
          rarity: newItem.rarity,
          image_url: newItem.image_url,
          thumb_url: newItem.thumb_url,
          price_satang: price,
          new_balance_satang: newBalance,
          cards_remaining: packQuery.data?.cards_remaining ?? 0,
        };
        setPending(null);
        setReconcileTone('success');
        setReconcileMessage(t('pending.resolvedSuccess'));
        // No theatre for a recovered pull — the suspense already happened, badly.
        revealImmediately(reconciled);
      } else if (snapshot && newBalance === snapshot.preBalanceSatang && !newItem) {
        setReconcileTone('neutral');
        setReconcileMessage(t('pending.notCharged'));
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
  }, [
    collectionQuery,
    packId,
    packQuery.data,
    pending,
    revealImmediately,
    setPending,
    t,
    walletQuery,
  ]);

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

    return (
      <PullStageShell
        reduceMotion={reduceMotion}
        shake={phase === 'flip' ? intensity.shakeAmplitude : 0}
        onSkip={skippable ? skip : undefined}
        skipLabel={skippable ? t('stage.skip') : undefined}
        announcement={t(`stage.${phase}`)}
        caption={showSuspense ? t(`stage.${phase}`) : undefined}
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
        buybackPreviewSatang={
          cardBuybackQuery.data?.buyback_price_satang ??
          packQuery.data?.cards.find((card) => card.card_id === result.card_id)
            ?.buyback_price_satang
        }
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
      priceSatang={priceSatang}
      canAfford={canAfford}
      disabled={isMutating}
      onPull={handlePull}
    />
  );
}
