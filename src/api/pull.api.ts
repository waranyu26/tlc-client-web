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

/** How often to ask once the committed round is actually due. */
const REVEAL_POLL_MS = 400;
/** drand publishes a round a beat after its nominal time; asking sooner is a wasted round trip. */
const BEACON_GRACE_MS = 400;
/**
 * Ceiling on a scheduled wait. `reveal_at` is compared against the *client's*
 * clock, so a skewed one must only ever slow the reveal down — never park it
 * minutes into the future on a ticket that has already resolved.
 */
const MAX_POLL_WAIT_MS = 3000;

export function useCommitPull(packId: string | undefined) {
  return useMutation({
    mutationFn: ({ idempotencyKey, clientSeed }: { idempotencyKey: string; clientSeed?: string }) =>
      commitPull(packId!, idempotencyKey, clientSeed),
    onSuccess: (ticket) => {
      // Seed the reveal poll with what the commit already told us. It is the
      // freshest answer obtainable — nothing about this ticket can change until
      // its beacon publishes — so handing it over spares the poll an immediate
      // round trip whose reply is guaranteed to be this same pending ticket.
      queryClient.setQueryData(['pulls', ticket.ticket_id], ticket);

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
 *
 * The schedule is driven by the ticket's own `reveal_at` rather than a fixed
 * cadence, because the answer is not merely unknown before that instant — it
 * cannot exist. A flat interval therefore spent most of a pull asking a
 * question with one possible reply, and then still landed up to a full interval
 * late on the one request that mattered. Sleeping to the round and tightening
 * the cadence around it cuts both the wasted requests and the latency the
 * customer actually feels, sitting on a card they cannot yet uncover.
 */
export function usePullTicket(ticketId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['pulls', ticketId],
    queryFn: () => getPull(ticketId!),
    enabled: !!ticketId && enabled,
    // Keeps the commit-seeded ticket from being refetched on mount, seconds
    // before its round is due. The interval below owns the schedule.
    staleTime: REVEAL_POLL_MS,
    refetchInterval: (query) => {
      const ticket = query.state.data;
      if (!ticket || ticket.status !== 'pending') return false;

      const dueIn = new Date(ticket.commitment.reveal_at).getTime() - Date.now() + BEACON_GRACE_MS;
      return Math.min(MAX_POLL_WAIT_MS, Math.max(REVEAL_POLL_MS, dueIn));
    },
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
