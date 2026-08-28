import type { Pagination, CardBuyback, CollectionItem } from './types';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/lib/axios';

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

export function useCollection() {
  return useQuery({
    queryKey: ['catalog', 'collection'],
    queryFn: getCollection,
  });
}
