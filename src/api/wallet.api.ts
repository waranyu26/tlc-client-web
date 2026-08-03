import type { Balance, TopupRequest, TopupResponse } from './types';

import { useQuery, useMutation } from '@tanstack/react-query';

import axiosInstance from 'src/lib/axios';
import { queryClient } from 'src/lib/query-client';

// ----------------------------------------------------------------------

export async function getWalletBalance(): Promise<Balance> {
  const { data } = await axiosInstance.get<Balance>('/api/v1/wallet/balance');
  return data;
}

export async function topupWallet(body: TopupRequest): Promise<TopupResponse> {
  const { data } = await axiosInstance.post<TopupResponse>('/api/v1/wallet/topup', body);
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
