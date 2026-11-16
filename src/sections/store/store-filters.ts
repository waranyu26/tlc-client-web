import type { CardKind } from 'src/api/types';
import type { StoreSort } from 'src/api/store.api';

// ----------------------------------------------------------------------
// The store keeps its browsing state in the query string, so a filtered shelf
// can be shared as a link and the Back button steps through it. These helpers
// read it back defensively: a hand-edited or stale link drops whatever it got
// wrong rather than failing the page or sending the API a value it will 400.
// ----------------------------------------------------------------------

export const STORE_SORTS: StoreSort[] = ['newest', 'price_asc', 'price_desc'];
export const DEFAULT_STORE_SORT: StoreSort = 'newest';
export const STORE_KINDS: CardKind[] = ['unique', 'bulk', 'sealed_pack'];

export type StoreParamKey =
  | 'category'
  | 'series'
  | 'q'
  | 'sort'
  | 'kind'
  | 'graded'
  | 'min'
  | 'max'
  | 'page';

/** The filters that live in the sheet rather than on the page. Prices in satang. */
export type StoreSheetFilters = {
  kind?: CardKind;
  graded: boolean;
  minPrice?: number;
  maxPrice?: number;
};

export type StoreFilters = StoreSheetFilters & {
  category?: string;
  /** Only ever set alongside a category. */
  series?: string;
  q: string;
  sort: StoreSort;
  page: number;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Up to nine digits of baht keeps the satang figure well inside a safe integer.
const BAHT_RE = /^(\d{1,9})(?:\.(\d{0,2}))?$/;

/**
 * "250", "99.5" or "99.50" baht → satang, or null if it isn't an amount.
 * Parsed as digits rather than through a float, so 0.29 is 29 and not 28.999….
 */
export function bahtToSatang(text: string): number | null {
  const match = BAHT_RE.exec(text.trim());
  if (!match) return null;

  const [, whole, fraction = ''] = match;
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}

/** Satang → the baht text used in the URL and the price fields: "250", "99.50". */
export function satangToBaht(satang: number): string {
  const whole = Math.floor(satang / 100);
  const rest = satang % 100;
  return rest ? `${whole}.${String(rest).padStart(2, '0')}` : String(whole);
}

export function parseStoreFilters(params: URLSearchParams): StoreFilters {
  const uuid = (key: StoreParamKey) => {
    const value = params.get(key) ?? '';
    return UUID_RE.test(value) ? value : undefined;
  };

  const category = uuid('category');

  const sortParam = params.get('sort') as StoreSort | null;
  const kindParam = params.get('kind') as CardKind | null;

  let minPrice = bahtToSatang(params.get('min') ?? '') ?? undefined;
  let maxPrice = bahtToSatang(params.get('max') ?? '') ?? undefined;
  // An inverted range matches nothing and the API refuses it; drop it whole
  // rather than guess which end was meant.
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    minPrice = undefined;
    maxPrice = undefined;
  }

  const page = Number(params.get('page'));

  return {
    category,
    series: category ? uuid('series') : undefined,
    q: (params.get('q') ?? '').trim(),
    sort: sortParam && STORE_SORTS.includes(sortParam) ? sortParam : DEFAULT_STORE_SORT,
    kind: kindParam && STORE_KINDS.includes(kindParam) ? kindParam : undefined,
    graded: params.get('graded') === 'true',
    minPrice,
    maxPrice,
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

/** How many sheet filters are on — the number on the Filters button. */
export function countSheetFilters(filters: StoreSheetFilters): number {
  const hasPrice = filters.minPrice !== undefined || filters.maxPrice !== undefined;
  return Number(!!filters.kind) + Number(filters.graded) + Number(hasPrice);
}
