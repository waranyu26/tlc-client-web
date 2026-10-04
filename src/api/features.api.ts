import { useQuery } from '@tanstack/react-query';

import { queryClient } from 'src/lib/query-client';
import axiosInstance, { ApiError } from 'src/lib/axios';

// ----------------------------------------------------------------------

/**
 * Operator switches for whole product areas, read from `GET /v1/features`.
 *
 * `pull` gates *new* pull commits only. A ticket that has already been charged
 * is still resolved and revealed with the switch off, so nothing here may be
 * used to block `GET /v1/pulls/:id` or the reveal of an in-flight pull.
 */
export type Features = {
  pull: boolean;
  store: boolean;
};

/** The service answers a gated endpoint with 503 and this code when its switch is off. */
export const FEATURE_DISABLED_CODE = '470201';

const FEATURES_KEY = ['features'] as const;

/**
 * What the app assumes until the real answer arrives, or if it never does.
 *
 * Deliberately asymmetric. Pulling is the product, so it stays on — the
 * service refuses a commit with FEATURE_DISABLED if it really is off, and that
 * is handled where it happens. The store defaults off so a menu entry that may
 * lead nowhere never flashes in and then disappears.
 */
const FEATURES_FALLBACK: Features = { pull: true, store: false };

// ----------------------------------------------------------------------

export async function getFeatures(): Promise<Features> {
  const { data } = await axiosInstance.get<Features>('/api/v1/features');
  return data;
}

/** True when a request failed because the operator switched its feature off. */
export function isFeatureDisabledError(error: unknown): boolean {
  return error instanceof ApiError && error.code === FEATURE_DISABLED_CODE;
}

/**
 * Records that a feature has just been refused by the service.
 *
 * The cached answer can be minutes old; a FEATURE_DISABLED reply is fresher
 * than it, so the UI switches to the "unavailable" state at once rather than
 * waiting for the next refetch. The refetch is still requested, so the other
 * switches are brought up to date too.
 */
export function markFeatureDisabled(feature: keyof Features) {
  queryClient.setQueryData<Features>(
    FEATURES_KEY,
    (current) => current && { ...current, [feature]: false }
  );
  queryClient.invalidateQueries({ queryKey: FEATURES_KEY });
}

// ----------------------------------------------------------------------

/**
 * The current feature switches, with the fallback above while loading.
 *
 * A long stale time because this is read by the nav on every page; re-checking
 * on window focus keeps a switch flipped mid-session from lingering for the
 * whole of it.
 */
export function useFeatures() {
  const query = useQuery({
    queryKey: FEATURES_KEY,
    queryFn: getFeatures,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });

  return { features: query.data ?? FEATURES_FALLBACK, isLoading: query.isPending };
}
