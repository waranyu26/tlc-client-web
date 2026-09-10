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

/**
 * What a card row physically is.
 *
 * `unique` is one individually graded slab with its own PSA certificate.
 * `bulk` is an ungraded card and `sealed_pack` a sealed booster, both held in
 * multiples — a copy of either has no certificate and no grade, so anything
 * that renders a grade has to check this first.
 *
 * How many copies are left is never published to a customer. Only what a card
 * *is*.
 */
export type CardKind = 'unique' | 'bulk' | 'sealed_pack';

export type CardBuyback = {
  card_id: string;
  buyback_price_satang: number;
};

export type CollectionItem = {
  card_id: string;
  name: string;
  set_name: string;
  kind: CardKind;
  /**
   * The display name of the tier this card was pulled from, resolved through
   * its pack. Empty only if the card never belonged to a pack — rarity is a
   * property of a card's place in a box, not of the card.
   */
  rarity: string;
  rarity_color: string;
  image_url: string;
  /** Grid-sized copy of image_url. Empty for CSV-imported art — fall back to image_url. */
  thumb_url: string;
  /** Null for an ungraded card. */
  psa_cert_number: string | null;
  psa_grade: string;
  buyback_price_satang: number;
};

// ----------------------------------------------------------------------
// Gacha
// ----------------------------------------------------------------------

/**
 * What a pull committed to before its randomness existed.
 *
 * The server hands this back the moment the wallet is charged, naming a drand
 * round that has not been published yet. That is the whole point: the outcome
 * cannot be known or steered by anyone — us included — at the time the money
 * moves, and the player holds our promise about the inputs beforehand.
 */
export type PullCommitment = {
  client_seed: string;
  server_nonce: string;
  beacon_chain_hash: string;
  target_round: number;
  commit_hash: string;
  published_odds: { rarity_code: string; bps: number }[];
  /** When the target round is due. Advisory — the server waits on the beacon. */
  reveal_at: string;
};

export type PullCard = {
  card_id: string;
  card_name: string;
  set_name: string;
  kind: CardKind;
  rarity_code: string;
  image_url: string;
  /** Grid-sized copy of image_url. Empty for CSV-imported art — fall back to image_url. */
  thumb_url: string;
  psa_cert_number: string | null;
  psa_grade: string;
};

export type PullStatus = 'pending' | 'resolved' | 'refunded';

/**
 * A pull at any point in its life.
 *
 * `POST /packs/:id/pull` answers 202 with this in `pending`: charged and
 * committed, but not yet decided. Poll `GET /pulls/:id` until it resolves.
 */
export type PullTicket = {
  ticket_id: string;
  pack_id: string;
  pack_seq: number;
  status: PullStatus;
  price_satang: number;
  new_balance_satang: number;
  commitment: PullCommitment;
  card?: PullCard;
  failure_reason?: string;
};

/**
 * The public, shareable receipt for one pull.
 *
 * Everything needed to recompute the outcome from scratch. It carries no
 * personal data, only a hash, so it can be posted anywhere — the point is that
 * a reader fetches the beacon from drand themselves rather than trusting ours.
 */
export type PullProof = {
  ticket_id: string;
  pack_id: string;
  pack_seq: number;
  user_hash: string;
  status: PullStatus;
  commitment: PullCommitment;
  actual_round: number;
  beacon_randomness: string;
  beacon_signature: string;
  /** Hex of the exact bytes that were committed to. */
  preimage: string;
  effective_odds: { rarity_code: string; bps: number }[];
  rarity_roll: number;
  rarity_code: string;
  candidate_ids: string[];
  /**
   * Copies each candidate stood for, same order as `candidate_ids`. Null on
   * receipts issued before fungible stock existed, where every entry was one.
   */
  candidate_amounts: number[] | null;
  card_index: number;
  card_id: string | null;
  /**
   * The pool entry the draw landed on: the card itself for a unique slab, or
   * the stock row the customer's copy was minted from.
   */
  stock_card_id: string | null;
  prev_state_hash: string;
  state_hash: string;
  resolved_at: string | null;
  recipe: {
    beacon_url: string;
    steps: string[];
    preimage_layout: string;
  };
};

/**
 * A resolved pull, flattened for the reveal screen.
 *
 * Built from a PullTicket once it resolves. It keeps `ticket_id` so the reveal
 * can link straight to the fairness receipt — the proof is only worth having if
 * it is one tap away from the card it explains.
 */
export type PullReveal = {
  ticket_id: string;
  pack_id: string;
  card_id: string;
  card_name: string;
  set_name: string;
  kind: CardKind;
  rarity: string;
  image_url: string;
  thumb_url: string;
  psa_cert_number: string | null;
  psa_grade: string;
  price_satang: number;
  new_balance_satang: number;
};

/** The beacon chain pulls commit against. */
export type DrandInfo = {
  chain_hash: string;
  public_key: string;
  genesis_time: number;
  period_seconds: number;
  lead_rounds: number;
};

// ----------------------------------------------------------------------
// Buyback
// ----------------------------------------------------------------------

export type BuybackResult = {
  card_id: string;
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

/**
 * A pack tile.
 *
 * There is no remaining-stock figure here on purpose. How much is left in the
 * box is the seller's information; what a buyer gets is the published odds and
 * how many pulls have happened — social proof rather than a map of the
 * contents.
 */
export type PackListItem = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  /** Cost of ONE pull from this pack. */
  price_satang: number;
  pull_count: number;
  sold_out: boolean;
};

/**
 * One of a pack's own rarity tiers, and its published chance of being drawn.
 *
 * The name, colour and chance all belong to this pack — there is no global
 * rarity list, so one box's "Grail" at 0.5% and another's at 5% are unrelated
 * things. The chance is a fixed number the seller set, not one inferred from
 * live stock: odds derived from what happens to be left both reveal the pack's
 * contents and move around as other people pull.
 */
export type PackRarityOdds = {
  tier_id: string;
  rarity_code: string;
  display_name: string;
  color_hex: string;
  rank: number;
  /** Basis points (10000 = 100%). */
  odds_bps: number;
  /** How many distinct cards the rarity was stocked with — not how many remain. */
  card_count: number;
};

/**
 * One card in a pack's manifest.
 *
 * Deliberately has no availability, quantity or per-card odds. Browsing a
 * rarity shows what could come out of it, never how much of it is left.
 */
export type PackCardItem = {
  card_id: string;
  name: string;
  set_name: string;
  kind: CardKind;
  /**
   * Nothing of this entry can be pulled any more — a slab someone already won,
   * or a fungible counter at zero.
   *
   * A boolean and never a number: the manifest says what is still winnable
   * without publishing how much of it is left. The server sorts sold-out
   * entries last, so rendering in the order received puts the live pool first.
   */
  sold_out: boolean;
  rarity_code: string;
  rarity_name: string;
  image_url: string;
  /** Grid-sized copy of image_url. Empty for CSV-imported art — fall back to image_url. */
  thumb_url: string;
  psa_cert_number: string | null;
  psa_grade: string;
};

/** The pack page: the box and its published odds, and nothing about stock. */
export type PackDetail = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price_satang: number;
  status: string;
  pull_count: number;
  sold_out: boolean;
  rarity_odds: PackRarityOdds[];
};

/** The card list behind one rarity tile. */
export type PackRarityManifest = {
  pack_id: string;
  rarity_code: string;
  display_name: string;
  odds_bps: number;
  cards: PackCardItem[];
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
  method: DeliveryMethod;
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
 * How the customer takes possession of a released card.
 *
 * 'pickup' carries no address — the card waits at the shop counter — so the
 * address fields on a delivery request are empty for it.
 */
export type DeliveryMethod = 'ship' | 'pickup';

/**
 * A delivery request joined to the card it is shipping. Requesting delivery
 * removes the card from the vault, so this is where the owner tracks it after
 * it leaves.
 */
export type MyDeliveryRequest = {
  id: string;
  card_instance_id: string;
  method: DeliveryMethod;
  card_name: string;
  set_name: string;
  rarity: string;
  image_url: string;
  /** Grid-sized copy of image_url. Empty for CSV-imported art — fall back to image_url. */
  thumb_url: string;
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
