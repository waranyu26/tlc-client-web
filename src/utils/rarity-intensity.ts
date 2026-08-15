import type { PackRarityOdds } from 'src/api/types';

// ----------------------------------------------------------------------
// How loud the pull celebration gets.
//
// `Card.Rarity` is a free-form string server-side — there is no enum and no
// seeded value set, so an admin can invent a rarity at any time. Tiering off a
// hardcoded name list would silently degrade every new rarity to "boring".
// Instead we tier off the pack's own live odds (`PackDetail.rarity_odds`, which
// `usePack` has already fetched by the time a pull resolves): the rarer the
// thing you just beat, the bigger the party. The name map is only a fallback
// for paths where odds aren't available (e.g. reconciling an interrupted pull).
// ----------------------------------------------------------------------

export type PullTier = 'standard' | 'rare' | 'epic' | 'legendary';

export type PullIntensity = {
  tier: PullTier;
  /** Extra suspense held before the flip, on top of the base charge window. */
  chargeBonusMs: number;
  /** Motes that spiral inward while the card charges. */
  moteCount: number;
  /** Shards thrown outward at the moment of reveal. */
  shardCount: number;
  /** Peak screen-shake amplitude in px. `0` disables the shake entirely. */
  shakeAmplitude: number;
  /** Rotating light rays behind the card on reveal. */
  rays: boolean;
};

/** Upper bound of each tier, in basis points (10000 = 100%). Ordered rarest first. */
const TIER_BY_ODDS: readonly { maxBps: number; tier: PullTier }[] = [
  { maxBps: 200, tier: 'legendary' }, // < 2%
  { maxBps: 800, tier: 'epic' }, // < 8%
  { maxBps: 2500, tier: 'rare' }, // < 25%
  { maxBps: Infinity, tier: 'standard' },
];

/** Fallback only — see the note above. Keys match `RARITY_COLORS` in `rarity-badge.tsx`. */
const TIER_BY_NAME: Record<string, PullTier> = {
  mythic: 'legendary',
  legendary: 'legendary',
  epic: 'epic',
  rare: 'rare',
  common: 'standard',
};

const INTENSITY: Record<PullTier, PullIntensity> = {
  standard: {
    tier: 'standard',
    chargeBonusMs: 0,
    moteCount: 10,
    shardCount: 0,
    shakeAmplitude: 0,
    rays: false,
  },
  rare: {
    tier: 'rare',
    chargeBonusMs: 300,
    moteCount: 16,
    shardCount: 14,
    shakeAmplitude: 0,
    rays: false,
  },
  epic: {
    tier: 'epic',
    chargeBonusMs: 700,
    moteCount: 24,
    shardCount: 26,
    shakeAmplitude: 5,
    rays: true,
  },
  legendary: {
    tier: 'legendary',
    chargeBonusMs: 1200,
    moteCount: 34,
    shardCount: 40,
    shakeAmplitude: 9,
    rays: true,
  },
};

function tierFromOddsBps(oddsBps: number): PullTier {
  return (
    TIER_BY_ODDS.find((entry) => oddsBps < entry.maxBps) ?? TIER_BY_ODDS[TIER_BY_ODDS.length - 1]
  ).tier;
}

export function getPullTier(
  rarity?: string | null,
  rarityOdds?: PackRarityOdds[] | null
): PullTier {
  const key = (rarity ?? '').trim().toLowerCase();
  if (!key) return 'standard';

  const match = rarityOdds?.find((entry) => entry.rarity.trim().toLowerCase() === key);
  // `odds_bps === 0` means the pack query is stale (it can't have been 0 for the
  // card we just pulled), so fall through to the name map rather than trusting it.
  if (match && match.odds_bps > 0) return tierFromOddsBps(match.odds_bps);

  return TIER_BY_NAME[key] ?? 'standard';
}

export function getPullIntensity(
  rarity?: string | null,
  rarityOdds?: PackRarityOdds[] | null
): PullIntensity {
  return INTENSITY[getPullTier(rarity, rarityOdds)];
}

/** Motion-reduced variant: keeps the tier, drops everything that moves the screen. */
export function calmIntensity(intensity: PullIntensity): PullIntensity {
  return {
    ...intensity,
    chargeBonusMs: Math.round(intensity.chargeBonusMs * 0.4),
    moteCount: 0,
    shardCount: 0,
    shakeAmplitude: 0,
    rays: false,
  };
}
