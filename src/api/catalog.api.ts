import type { Pagination, CardBuyback, CollectionItem } from './types';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/lib/axios';

import { useAuthContext } from 'src/auth/hooks/use-auth-context';

// ----------------------------------------------------------------------

export async function getCardBuyback(cardId: string): Promise<CardBuyback> {
  const { data } = await axiosInstance.get<CardBuyback>(`/api/v1/catalog/cards/${cardId}/buyback`);
  return data;
}

export async function getCollection(): Promise<CollectionItem[]> {
  const { data } = await axiosInstance.get<Pagination<CollectionItem>>(
    '/api/v1/catalog/collection'
  );
  return data.data ?? [];
}

// ----------------------------------------------------------------------

export function useCardBuyback(cardId: string) {
  return useQuery({
    queryKey: ['catalog', 'cards', cardId, 'buyback'],
    queryFn: () => getCardBuyback(cardId),
    enabled: Boolean(cardId),
  });
}

/** Gated on the session for the same reason as `useWalletBalance`. */
export function useCollection() {
  const { authenticated } = useAuthContext();

  return useQuery({
    queryKey: ['catalog', 'collection'],
    queryFn: getCollection,
    enabled: authenticated,
  });
}
