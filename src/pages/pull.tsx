import type { PullResult, BuybackResult } from 'src/api/types';

import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/axios';
import enPull from 'src/i18n/locales/en/pull.json';
import thPull from 'src/i18n/locales/th/pull.json';
import { registerNamespace } from 'src/i18n/register';
import { useWalletBalance } from 'src/api/wallet.api';
import { useBuybackMutation } from 'src/api/buyback.api';
import { usePack, usePullMutation } from 'src/api/pack.api';
import { usePullFlowStore } from 'src/store/pull-flow-store';
import { useCollection, useCardBuyback } from 'src/api/catalog.api';

import {
  PullIdleView,
  CardRevealView,
  PullPendingView,
  BuybackSuccessView,
  PullAnimationOverlay,
} from 'src/sections/pull';

// ----------------------------------------------------------------------

registerNamespace('pull', enPull, thPull);

// Fixed animation timeline (DESIGN.md "Pull flow timing"): 'pulling' plays for
// PULLING_MS, then 'glowing' for GLOWING_MS more, before the reveal is allowed
// to show — even if the API responds sooner. If the API is slower, 'glowing'
// simply holds until the response lands.
const PULLING_MS = 2600;
const GLOWING_MS = 1600;

type PendingAttempt = {
  key: string;
};

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

  const { overlay, stage, result, setOverlay, startPull, setResult, reset } = usePullFlowStore();

  const packQuery = usePack(packId);
  const walletQuery = useWalletBalance();
  const collectionQuery = useCollection();
  const pullMutation = usePullMutation(packId);
  const buybackMutation = useBuybackMutation();

  // Buyback preview for the currently revealed card (shown on the "Sell Instantly" CTA).
  const cardBuybackQuery = useCardBuyback(result?.card_id ?? '');

  const pullStartRef = useRef(0);
  const glowTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const attemptSnapshotRef = useRef<AttemptSnapshot | null>(null);

  const [pending, setPending] = useState<PendingAttempt | null>(null);
  const [buybackResult, setBuybackResult] = useState<BuybackResult | null>(null);
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconcileMessage, setReconcileMessage] = useState<string | null>(null);
  const [reconcileTone, setReconcileTone] = useState<'neutral' | 'success' | 'error'>('neutral');

  const clearTimers = useCallback(() => {
    clearTimeout(glowTimerRef.current);
    clearTimeout(revealTimerRef.current);
  }, []);

  /** Fires the pull mutation with a fixed Idempotency-Key and drives the animation timeline. */
  const executePull = useCallback(
    (key: string) => {
      clearTimers();
      setReconcileMessage(null);
      pullStartRef.current = Date.now();
      startPull(); // -> overlay 'pulling', stage 'pulling', result null

      glowTimerRef.current = setTimeout(() => {
        usePullFlowStore.setState({ stage: 'glowing' });
      }, PULLING_MS);

      pullMutation.mutate(key, {
        onSuccess: (data: PullResult) => {
          const elapsed = Date.now() - pullStartRef.current;
          const remaining = Math.max(0, PULLING_MS + GLOWING_MS - elapsed);
          revealTimerRef.current = setTimeout(() => {
            setPending(null);
            setResult(data); // -> overlay 'reveal', stage 'reveal'
          }, remaining);
        },
        onError: () => {
          clearTimeout(glowTimerRef.current);
          setPending({ key });
        },
      });
    },
    [clearTimers, pullMutation, setResult, startPull]
  );

  /** New attempt: fresh Idempotency-Key + a balance/collection snapshot for reconciliation. */
  const startNewPull = useCallback(() => {
    const key = crypto.randomUUID();
    attemptSnapshotRef.current = {
      preBalanceSatang: walletQuery.data?.balance_satang ?? 0,
      preCollectionIds: new Set((collectionQuery.data ?? []).map((item) => item.instance_id)),
    };
    setBuybackResult(null);
    executePull(key);
  }, [collectionQuery.data, executePull, walletQuery.data]);

  /** Retry of an interrupted attempt: SAME Idempotency-Key (FR15/FR19 — never double-charge). */
  const retryPull = useCallback(() => {
    if (!pending) return;
    executePull(pending.key);
  }, [executePull, pending]);

  const priceSatang = packQuery.data?.price_satang;
  const balanceSatang = walletQuery.data?.balance_satang;
  const canAfford =
    priceSatang === undefined || balanceSatang === undefined || balanceSatang >= priceSatang;

  const handlePull = useCallback(() => {
    if (!canAfford) {
      navigate(paths.wallet);
      return;
    }
    startNewPull();
  }, [canAfford, navigate, startNewPull]);

  const handlePullAgain = useCallback(
    (balanceAfterSatang: number) => {
      if (priceSatang !== undefined && balanceAfterSatang < priceSatang) {
        navigate(paths.wallet);
        return;
      }
      startNewPull();
    },
    [navigate, priceSatang, startNewPull]
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
          setOverlay('buyback');
        },
      }
    );
  }, [buybackMutation, result, setOverlay]);

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
          price_satang: price,
          new_balance_satang: newBalance,
          cards_remaining: packQuery.data?.cards_remaining ?? 0,
        };
        setPending(null);
        setReconcileTone('success');
        setReconcileMessage(t('pending.resolvedSuccess'));
        setResult(reconciled);
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
  }, [collectionQuery, packId, packQuery.data, pending, setResult, t, walletQuery]);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  if (pending) {
    return (
      <PullPendingView
        isChecking={isReconciling}
        onCheckStatus={handleCheckStatus}
        onRetry={retryPull}
        message={reconcileMessage}
        messageTone={reconcileTone}
      />
    );
  }

  if (overlay === 'buyback' && buybackResult) {
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

  if (overlay === 'pulling') {
    return <PullAnimationOverlay stage={stage} />;
  }

  if (overlay === 'reveal' && result) {
    return (
      <CardRevealView
        result={result}
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
      priceSatang={priceSatang}
      canAfford={canAfford}
      disabled={pullMutation.isPending}
      onPull={handlePull}
    />
  );
}
