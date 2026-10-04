import type { Balance, StoreCard, Pagination, StorePurchase } from './types';

import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';

import { queryClient } from 'src/lib/query-client';
import axiosInstance, { ApiError } from 'src/lib/axios';

import { markFeatureDisabled, isFeatureDisabledError } from './features.api';

// ----------------------------------------------------------------------

/** Status codes the store's buy endpoint answers with, beyond FEATURE_DISABLED. */
export const STORE_ERROR = {
  /** Wallet is short (shared with every other money action). */
  insufficientBalance: '310201',
  /** The card is gone, or was never listed. */
  notFound: '480201',
  soldOut: '480202',
  /** The listed price moved since the customer looked; the reply carries the new one. */
  priceChanged: '480203',
  /** An unverified account may browse but not spend. */
  emailNotVerified: '200209',
} as const;

export type StoreSort = 'price_asc' | 'price_desc' | 'newest';

export type StoreListParams = {
  page?: number;
  pageSize?: number;
  set_name?: string;
  search?: string;
  sort?: StoreSort;
};

type BuyCardArgs = {
  card: StoreCard;
  /**
   * One key per buy *attempt*. A retry of the same attempt must reuse it so a
   * dropped connection replays the purchase instead of charging twice; a new
   * attempt (after the price moved, say) needs a fresh one.
   */
  idempotencyKey: string;
};

const STORE_KEY = ['store', 'cards'] as const;

// ----------------------------------------------------------------------

/**
 * Runs a store request, and on FEATURE_DISABLED records that the store is off
 * so the nav and the page follow without waiting for the next features poll.
 */
async function guardStore<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (isFeatureDisabledError(error)) markFeatureDisabled('store');
    throw error;
  }
}

export async function getStoreCards(params?: StoreListParams): Promise<Pagination<StoreCard>> {
  const { data } = await guardStore(
    axiosInstance.get<Pagination<StoreCard>>('/api/v1/store/cards', { params })
  );
  return data;
}

export async function getStoreCard(cardId: string): Promise<StoreCard> {
  const { data } = await guardStore(axiosInstance.get<StoreCard>(`/api/v1/store/cards/${cardId}`));
  return data;
}

/**
 * Buys one card at the price the customer saw.
 *
 * The price travels with the request so the service can refuse to charge a
 * different amount from the one on screen — it answers PRICE_CHANGED instead,
 * and the customer confirms again.
 */
export async function buyStoreCard(
  cardId: string,
  priceSatang: number,
  idempotencyKey: string
): Promise<StorePurchase> {
  const { data } = await guardStore(
    axiosInstance.post<StorePurchase>(
      `/api/v1/store/cards/${cardId}/buy`,
      { price_satang: priceSatang },
      { headers: { 'Idempotency-Key': idempotencyKey } }
    )
  );
  return data;
}

// ----------------------------------------------------------------------

/** A switched-off store answers every request the same way; retrying it is noise. */
const retryUnlessDisabled = (failureCount: number, error: unknown) =>
  !isFeatureDisabledError(error) && failureCount < 1;

export function useStoreCards(params?: StoreListParams) {
  return useQuery({
    queryKey: [...STORE_KEY, 'list', params],
    queryFn: () => getStoreCards(params),
    // Keep the current page on screen while the next one loads, so paging and
    // typing in the search box do not flash the grid back to skeletons.
    placeholderData: keepPreviousData,
    retry: retryUnlessDisabled,
  });
}

/**
 * One listing, seeded from the grid card the customer tapped.
 *
 * Seeding shows the dialog immediately; the default stale time of zero for
 * seeded data makes it re-read on open, so the price on the button is the
 * current one rather than whatever the grid last fetched.
 */
export function useStoreCard(card: StoreCard) {
  return useQuery({
    queryKey: [...STORE_KEY, 'detail', card.id],
    queryFn: () => getStoreCard(card.id),
    initialData: card,
    staleTime: 0,
    retry: retryUnlessDisabled,
  });
}

export function useBuyCard() {
  return useMutation({
    mutationFn: ({ card, idempotencyKey }: BuyCardArgs) =>
      buyStoreCard(card.id, card.price_satang, idempotencyKey),
    onSuccess: (purchase) => {
      // The reply carries the balance after the charge; show it now rather
      // than after a refetch.
      queryClient.setQueryData<Balance>(['wallet', 'balance'], {
        balance_satang: purchase.balance_satang,
      });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // The card is now in the vault, and off the shelf.
      queryClient.invalidateQueries({ queryKey: ['catalog', 'collection'] });
      queryClient.invalidateQueries({ queryKey: STORE_KEY });
    },
    onError: (error, { card }) => {
      if (!(error instanceof ApiError)) return;

      if (error.code === STORE_ERROR.priceChanged) {
        const current = (error.data as { current_price_satang?: number } | undefined)
          ?.current_price_satang;
        if (typeof current === 'number') {
          queryClient.setQueryData<StoreCard>([...STORE_KEY, 'detail', card.id], {
            ...card,
            price_satang: current,
          });
        }
      }

      if (error.code === STORE_ERROR.priceChanged || error.code === STORE_ERROR.soldOut) {
        queryClient.invalidateQueries({ queryKey: STORE_KEY });
      }
    },
  });
}
