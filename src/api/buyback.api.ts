import type { BuybackResult } from './types';

import { useMutation } from '@tanstack/react-query';

import axiosInstance from 'src/lib/axios';
import { queryClient } from 'src/lib/query-client';

// ----------------------------------------------------------------------

export type BuybackRequest = {
  card_instance_id: string;
};

export async function buybackCard(body: BuybackRequest): Promise<BuybackResult> {
  const { data } = await axiosInstance.post<BuybackResult>('/api/v1/buyback', body);
  return data;
}

// ----------------------------------------------------------------------

export function useBuybackMutation() {
  return useMutation({
    mutationFn: buybackCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['catalog', 'collection'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
