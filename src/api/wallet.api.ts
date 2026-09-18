import type { Balance, TopupStatus, TopupRequest, TopupResponse } from './types';

import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

import axiosInstance from 'src/lib/axios';
import { queryClient } from 'src/lib/query-client';

// ----------------------------------------------------------------------

/**
 * How often a top-up in flight is re-checked.
 *
 * The customer is either looking at a QR code or has just come back from their
 * banking app, so this is the latency they feel between paying and seeing it.
 * The server answers from its own ledger and only consults Stripe while the
 * row is still pending, so the poll stops costing anything the moment it
 * settles.
 */
const TOPUP_POLL_MS = 2000;

// ----------------------------------------------------------------------

export async function getWalletBalance(): Promise<Balance> {
  const { data } = await axiosInstance.get<Balance>('/api/v1/wallet/balance');
  return data;
}

export async function topupWallet(body: TopupRequest): Promise<TopupResponse> {
  const { data } = await axiosInstance.post<TopupResponse>('/api/v1/wallet/topup', body);
  return data;
}

export async function getTopupStatus(intentId: string): Promise<TopupStatus> {
  const { data } = await axiosInstance.get<TopupStatus>(`/api/v1/wallet/topups/${intentId}`);
  return data;
}

/**
 * Abandons a top-up: cancels it at Stripe and settles its ledger row.
 *
 * Called when the customer closes the payment sheet, which is the moment that
 * used to leave a top-up pending for ever. Safe to call on a payment that
 * actually went through — the server credits that instead of voiding it.
 */
export async function voidTopup(intentId: string): Promise<TopupStatus> {
  const { data } = await axiosInstance.post<TopupStatus>(`/api/v1/wallet/topups/${intentId}/void`);
  return data;
}

// ----------------------------------------------------------------------

export function useWalletBalance() {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: getWalletBalance,
  });
}

export function useTopupMutation() {
  return useMutation({
    mutationFn: topupWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

/**
 * Polls one top-up until the server says it settled, and pulls the rest of the
 * app forward when it does.
 *
 * Polling stops the instant the status leaves `pending`. Like a pull ticket,
 * this is only an accelerator: the webhook credits the wallet and a background
 * reconciler settles whatever the browser never reported, so closing the tab
 * cannot lose a payment — it only means nobody is watching.
 */
export function useTopupStatus(intentId: string | undefined, enabled = true) {
  const query = useQuery({
    queryKey: ['wallet', 'topups', intentId],
    queryFn: () => getTopupStatus(intentId!),
    enabled: !!intentId && enabled,
    refetchInterval: (q) => (q.state.data?.status === 'pending' ? TOPUP_POLL_MS : false),
  });

  const status = query.data?.status;
  const balanceSatang = query.data?.balance_satang;

  useEffect(() => {
    if (status === 'pending' || status === undefined) return;

    if (status === 'completed' && balanceSatang !== undefined) {
      // Seed the balance from this very reply before revalidating, so the
      // number on screen changes in the same frame the payment is confirmed.
      // Waiting for a refetch is what made the old flow need a manual reload.
      queryClient.setQueryData(['wallet', 'balance'], { balance_satang: balanceSatang });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    }

    // A settled top-up changes its own ledger row either way — credited, or
    // marked as never paid — so the history is stale in both cases.
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  }, [status, balanceSatang]);

  return query;
}

export function useVoidTopupMutation() {
  return useMutation({
    mutationFn: voidTopup,
    onSuccess: (settled) => {
      queryClient.setQueryData(['wallet', 'topups', settled.payment_intent_id], settled);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // A void can discover that the payment actually succeeded, in which case
      // the wallet just changed.
      if (settled.status === 'completed') {
        queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
        queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      }
    },
  });
}
