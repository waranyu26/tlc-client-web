import type { PullProof, DrandInfo, PullTicket } from './types';

import { useQuery, useMutation } from '@tanstack/react-query';

import axiosInstance from 'src/lib/axios';
import { queryClient } from 'src/lib/query-client';

// ----------------------------------------------------------------------

/**
 * Commits a pull: charges the pack price and returns a pending ticket bound to
 * a drand round that has not been published yet.
 *
 * Nothing is decided here. The card is not known — and cannot be known by
 * anyone, us included — until that round publishes a few seconds later, which
 * is exactly what makes the result provably unrigged.
 *
 * The idempotency key is required, and a retry must reuse the same one so a
 * dropped connection cannot double-charge (FR19).
 */
export async function commitPull(
  packId: string,
  idempotencyKey: string,
  clientSeed?: string
): Promise<PullTicket> {
  const headers: Record<string, string> = { 'Idempotency-Key': idempotencyKey };
  if (clientSeed) {
    headers['X-Client-Seed'] = clientSeed;
  }

  const { data } = await axiosInstance.post<PullTicket>(
    `/api/v1/packs/${packId}/pull`,
    undefined,
    { headers }
  );
  return data;
}

export async function getPull(ticketId: string): Promise<PullTicket> {
  const { data } = await axiosInstance.get<PullTicket>(`/api/v1/pulls/${ticketId}`);
  return data;
}

/** Public and unauthenticated, so a receipt can be shared with anyone. */
export async function getPullProof(ticketId: string): Promise<PullProof> {
  const { data } = await axiosInstance.get<PullProof>(`/api/v1/pulls/${ticketId}/proof`);
  return data;
}

export async function getDrandInfo(): Promise<DrandInfo> {
  const { data } = await axiosInstance.get<DrandInfo>('/api/v1/drand/info');
  return data;
}

// ----------------------------------------------------------------------

/** How often to ask whether the beacon has landed. Rounds are 3s apart. */
const REVEAL_POLL_MS = 1000;

export function useCommitPull(packId: string | undefined) {
  return useMutation({
    mutationFn: ({ idempotencyKey, clientSeed }: { idempotencyKey: string; clientSeed?: string }) =>
      commitPull(packId!, idempotencyKey, clientSeed),
    onSuccess: () => {
      // The charge has already happened, so the wallet is stale immediately —
      // the card has not been decided yet, so nothing else has moved.
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

/**
 * Polls a committed pull until its beacon publishes and it resolves.
 *
 * Polling stops the moment the ticket leaves `pending`. It is only an
 * accelerator: the server resolves pulls in the background too, so closing the
 * tab still awards the card.
 */
export function usePullTicket(ticketId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['pulls', ticketId],
    queryFn: () => getPull(ticketId!),
    enabled: !!ticketId && enabled,
    refetchInterval: (query) =>
      query.state.data?.status === 'pending' ? REVEAL_POLL_MS : false,
  });
}

export function usePullProof(ticketId: string | undefined) {
  return useQuery({
    queryKey: ['pulls', ticketId, 'proof'],
    queryFn: () => getPullProof(ticketId!),
    enabled: !!ticketId,
  });
}

export function useDrandInfo() {
  return useQuery({
    queryKey: ['drand', 'info'],
    queryFn: getDrandInfo,
    staleTime: Infinity,
  });
}
