import type { Card, Pagination, RarityTier, CardBuyback, CollectionItem } from './types';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/lib/axios';

// ----------------------------------------------------------------------

export type CardListParams = {
  set_name?: string;
  rarity?: string;
  page?: number;
  pageSize?: number;
};

export async function getCards(params?: CardListParams): Promise<Pagination<Card>> {
  const { data } = await axiosInstance.get<Pagination<Card>>('/api/v1/catalog/cards', { params });
  return data;
}

export async function getRarities(): Promise<RarityTier[]> {
  const { data } = await axiosInstance.get<RarityTier[]>('/api/v1/catalog/rarities');
  return data;
}

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

export function useCards(params?: CardListParams) {
  return useQuery({
    queryKey: ['catalog', 'cards', params],
    queryFn: () => getCards(params),
  });
}

export function useRarities() {
  return useQuery({
    queryKey: ['catalog', 'rarities'],
    queryFn: getRarities,
  });
}

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
