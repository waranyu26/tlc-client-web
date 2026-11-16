import type { Pagination, CardBuyback, CollectionItem, CollectionCategory } from './types';

import { useQuery, keepPreviousData } from '@tanstack/react-query';

import axiosInstance from 'src/lib/axios';

import { useAuthContext } from 'src/auth/hooks/use-auth-context';

// ----------------------------------------------------------------------

export type CollectionParams = {
  page?: number;
  pageSize?: number;
  category_id?: string;
  series_id?: string;
  /** Matches the card name, set name or collection name. */
  search?: string;
};

// Every collection query lives under this key, so the mutations that move a
// card in or out of the vault refresh the pages, the whole list and the tree.
const COLLECTION_KEY = ['catalog', 'collection'] as const;

/** The largest page the service will hand back; it caps anything bigger to this. */
const COLLECTION_MAX_PAGE_SIZE = 100;

// ----------------------------------------------------------------------

export async function getCardBuyback(cardId: string): Promise<CardBuyback> {
  const { data } = await axiosInstance.get<CardBuyback>(`/api/v1/catalog/cards/${cardId}/buyback`);
  return data;
}

/** One page of the customer's vault. Without page params the service sends its default of 10. */
export async function getCollection(
  params?: CollectionParams
): Promise<Pagination<CollectionItem>> {
  const { data } = await axiosInstance.get<Pagination<CollectionItem>>(
    '/api/v1/catalog/collection',
    { params }
  );
  return data;
}

/**
 * Every card in the vault, unfiltered, for the places that need all of it at
 * once: the portfolio total and the delivery picker. Reads the first page at
 * the largest size the service allows, then the rest in parallel.
 */
export async function getWholeCollection(): Promise<CollectionItem[]> {
  const first = await getCollection({ page: 1, pageSize: COLLECTION_MAX_PAGE_SIZE });
  const pageCount = Math.ceil(first.totalRecord / COLLECTION_MAX_PAGE_SIZE);
  if (pageCount <= 1) return first.data ?? [];

  const rest = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) =>
      getCollection({ page: index + 2, pageSize: COLLECTION_MAX_PAGE_SIZE })
    )
  );
  return [first, ...rest].flatMap((page) => page.data ?? []);
}

/** The category → collection tree over the customer's own cards. */
export async function getCollectionCategories(): Promise<CollectionCategory[]> {
  const { data } = await axiosInstance.get<CollectionCategory[]>(
    '/api/v1/catalog/collection/categories'
  );
  return data ?? [];
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
export function useCollection(params?: CollectionParams) {
  const { authenticated } = useAuthContext();

  return useQuery({
    queryKey: [...COLLECTION_KEY, 'list', params],
    queryFn: () => getCollection(params),
    enabled: authenticated,
    // Keep the current page on screen while the next one loads, so paging and
    // filtering do not flash the grid back to a loading state.
    placeholderData: keepPreviousData,
  });
}

/** Every card in the vault; see `getWholeCollection`. Session-gated like `useCollection`. */
export function useWholeCollection() {
  const { authenticated } = useAuthContext();

  return useQuery({
    queryKey: [...COLLECTION_KEY, 'all'],
    queryFn: getWholeCollection,
    enabled: authenticated,
  });
}

/** The vault's category and collection rows. Session-gated like `useCollection`. */
export function useCollectionCategories() {
  const { authenticated } = useAuthContext();

  return useQuery({
    queryKey: [...COLLECTION_KEY, 'categories'],
    queryFn: getCollectionCategories,
    enabled: authenticated,
  });
}
