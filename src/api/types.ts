export { formatThb, formatThbSigned } from 'src/utils/format-currency';

// ----------------------------------------------------------------------
// Shared DTO contracts for the Go backend (/api/v1/*). Money fields are always
// int64 satang (THB minor units) — never float. Field names mirror the backend
// JSON exactly.
// ----------------------------------------------------------------------

export type Rarity = 'legendary' | 'mythic' | 'epic' | 'rare' | 'common';

export const RARITY_COLORS: Record<string, string> = {
  legendary: '#E7CE92',
  mythic: '#C77DFF',
  epic: '#18E0D0',
  rare: '#7C8CFF',
  common: '#4A4844',
};

// ----------------------------------------------------------------------
// User
// ----------------------------------------------------------------------

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  balance_satang: number;
};

// ----------------------------------------------------------------------
// Wallet
// ----------------------------------------------------------------------

export type Balance = {
  balance_satang: number;
};

export type TopupRequest = {
  amount_satang: number;
};

export type TopupResponse = {
  client_secret: string;
  payment_intent_id: string;
};

// ----------------------------------------------------------------------
// Catalog
// ----------------------------------------------------------------------

export type Card = {
  id: string;
  name: string;
  set_name: string;
  rarity: string;
  image_url: string;
  buyback_price_satang: number;
  stock_count: number;
};

export type RarityTier = {
  id: string;
  code: string;
  display_name: string;
  probability_bps: number;
  active: boolean;
};

export type CardBuyback = {
  card_id: string;
  buyback_price_satang: number;
};

export type CollectionItem = {
  instance_id: string;
  card_id: string;
  name: string;
  set_name: string;
  rarity: string;
  image_url: string;
  buyback_price_satang: number;
};

// ----------------------------------------------------------------------
// Gacha
// ----------------------------------------------------------------------

/**
 * Every pull comes from a pack, so there is no global price or global odds —
 * `price_satang` is the pack's, and `cards_remaining` is what's left in that
 * pack right after this pull.
 */
export type PullResult = {
  instance_id: string;
  pack_id: string;
  card_id: string;
  card_name: string;
  set_name: string;
  rarity: string;
  image_url: string;
  price_satang: number;
  new_balance_satang: number;
  cards_remaining: number;
};

// ----------------------------------------------------------------------
// Buyback
// ----------------------------------------------------------------------

export type BuybackResult = {
  card_instance_id: string;
  amount_satang: number;
  balance_satang: number;
};

// ----------------------------------------------------------------------
// Transactions
// ----------------------------------------------------------------------

export type Transaction = {
  id: string;
  user_id: string;
  type: string;
  amount_satang: number;
  balance_after_satang: number;
  status: string;
  reference: string;
  metadata: unknown;
  created_at: string;
};

export type Pagination<T> = {
  page: number;
  pageSize: number;
  totalRecord: number;
  sort?: string;
  search?: string;
  data: T[];
};

// ----------------------------------------------------------------------
// Packs
// ----------------------------------------------------------------------

export type PackListItem = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  /** Cost of ONE pull from this pack. */
  price_satang: number;
  cards_remaining: number;
  cards_total: number;
};

/** One card obtainable from a pack, with its live share of the remaining pool. */
export type PackCardItem = {
  card_id: string;
  name: string;
  set_name: string;
  rarity: string;
  image_url: string;
  buyback_price_satang: number;
  quantity_total: number;
  remaining: number;
  pulled: number;
  /** Basis points (10000 = 100%). Derived from remaining stock, never stored. */
  odds_bps: number;
};

export type PackRarityOdds = {
  rarity: string;
  remaining: number;
  odds_bps: number;
};

/** The pack page: the box plus its full, auditable pool. */
export type PackDetail = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price_satang: number;
  status: string;
  cards_remaining: number;
  cards_total: number;
  cards: PackCardItem[];
  rarity_odds: PackRarityOdds[];
};

// ----------------------------------------------------------------------
// Delivery
// ----------------------------------------------------------------------

export type Address = {
  id: string;
  recipient_name: string;
  phone: string;
  line1: string;
  line2: string;
  district: string;
  province: string;
  postal_code: string;
  is_default: boolean;
};

export type DeliveryRequest = {
  id: string;
  user_id: string;
  card_instance_id: string;
  recipient_name: string;
  phone: string;
  line1: string;
  line2: string;
  district: string;
  province: string;
  postal_code: string;
  status: string;
  fulfilled_at: string | null;
  created_at: string;
};

export type DeliveryStatus = 'pending' | 'fulfilled';

/**
 * A delivery request joined to the card it is shipping. Requesting delivery
 * removes the card from the vault, so this is where the owner tracks it after
 * it leaves.
 */
export type MyDeliveryRequest = {
  id: string;
  card_instance_id: string;
  card_name: string;
  set_name: string;
  rarity: string;
  image_url: string;
  recipient_name: string;
  line1: string;
  line2: string;
  district: string;
  province: string;
  postal_code: string;
  status: DeliveryStatus;
  fulfilled_at: string | null;
  created_at: string;
};

// ----------------------------------------------------------------------
// Ticker (SSE)
// ----------------------------------------------------------------------

export type TickerEvent = {
  type: string;
  data: {
    user_id: string;
    card_name: string;
    rarity: string;
  };
};
