import type { Pagination, PackDetail, PackListItem, PackRarityManifest } from './types';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/lib/axios';

// ----------------------------------------------------------------------

export type PackListParams = {
  page?: number;
  pageSize?: number;
};

export async function getPacks(params?: PackListParams): Promise<Pagination<PackListItem>> {
  const { data } = await axiosInstance.get<Pagination<PackListItem>>('/api/v1/packs', { params });
  return data;
}

export async function getPack(packId: string): Promise<PackDetail> {
  const { data } = await axiosInstance.get<PackDetail>(`/api/v1/packs/${packId}`);
  return data;
}

/**
 * The cards behind one rarity tile.
 *
 * This is the full manifest — everything the rarity was stocked with, pulled
 * ones included — with no availability marking, so a buyer can see what the
 * pool contains without working out what is left in it.
 */
export async function getPackRarityCards(
  packId: string,
  rarityCode: string
): Promise<PackRarityManifest> {
  const { data } = await axiosInstance.get<PackRarityManifest>(
    `/api/v1/packs/${packId}/rarities/${rarityCode}/cards`
  );
  return data;
}

// ----------------------------------------------------------------------

export function usePacks(params?: PackListParams) {
  return useQuery({
    queryKey: ['packs', params],
    queryFn: () => getPacks(params),
  });
}

export function usePack(packId: string | undefined) {
  return useQuery({
    queryKey: ['packs', 'detail', packId],
    queryFn: () => getPack(packId!),
    enabled: !!packId,
  });
}

/**
 * A rarity's manifest is fixed for the life of the pack — pulling does not
 * change it, because pulled cards stay listed. So it can be cached hard.
 */
export function usePackRarityCards(packId: string | undefined, rarityCode: string | undefined) {
  return useQuery({
    queryKey: ['packs', 'rarity', packId, rarityCode],
    queryFn: () => getPackRarityCards(packId!, rarityCode!),
    enabled: !!packId && !!rarityCode,
    staleTime: 5 * 60 * 1000,
  });
}
