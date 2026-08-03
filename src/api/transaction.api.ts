import type { Pagination, Transaction } from './types';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/lib/axios';

// ----------------------------------------------------------------------

export type TransactionListParams = {
  type?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export async function getTransactions(
  params?: TransactionListParams
): Promise<Pagination<Transaction>> {
  const { data } = await axiosInstance.get<Pagination<Transaction>>('/api/v1/transactions', {
    params,
  });
  return data;
}

// ----------------------------------------------------------------------

export function useTransactions(params?: TransactionListParams) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => getTransactions(params),
  });
}
