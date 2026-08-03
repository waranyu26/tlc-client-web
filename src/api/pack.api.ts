import type { Pagination, PackDetail, PullResult, PackListItem } from './types';

import { useQuery, useMutation } from '@tanstack/react-query';

import axiosInstance from 'src/lib/axios';
import { queryClient } from 'src/lib/query-client';

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
 * A pull is always scoped to a pack — it charges that pack's price and claims
 * one of its remaining cards. Retries must reuse the same idempotency key so a
 * dropped connection can't double-charge (FR19).
 */
export async function pullFromPack(packId: string, idempotencyKey?: string): Promise<PullResult> {
  const { data } = await axiosInstance.post<PullResult>(
    `/api/v1/packs/${packId}/pull`,
    undefined,
    idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined
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

export function usePullMutation(packId: string | undefined) {
  return useMutation({
    mutationFn: (idempotencyKey?: string) => pullFromPack(packId!, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['catalog', 'collection'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // The pull changed what's left in the box, so its odds moved too.
      queryClient.invalidateQueries({ queryKey: ['packs'] });
    },
  });
}
