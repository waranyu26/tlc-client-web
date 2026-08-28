/**
 * Browser-side reimplementation of the server's pull derivation.
 *
 * This deliberately duplicates `gacha/fair` on the backend rather than trusting
 * anything it says. The whole point of the receipt is that a sceptic can
 * recompute the outcome themselves, from inputs published before the randomness
 * existed, using a beacon they fetch from drand rather than from us.
 *
 * The two implementations are kept honest by a shared fixture: the Go tests
 * write `gacha/fair/testdata/vectors.json`, and `fair-verify.test.ts` replays
 * it through this code. If either side drifts, that test fails.
 */

/** Full probability space, in basis points. */
export const TOTAL_BPS = 10000;

export type Odds = { rarity_code: string; bps: number };

// ----------------------------------------------------------------------

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new Error('hex string has an odd length');
  }

  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    const byte = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(byte)) {
      throw new Error('hex string contains a non-hex character');
    }
    out[i] = byte;
  }
  return out;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes as BufferSource);
  return bytesToHex(new Uint8Array(digest));
}

// ----------------------------------------------------------------------

/**
 * The i-th 32-bit draw for a pull.
 *
 * Beacon randomness keys an HMAC over the commitment preimage plus a counter.
 * The draw is 32 bits, not 64, precisely so this line can be written the
 * obvious way in JavaScript: a uint64 would exceed Number.MAX_SAFE_INTEGER and
 * silently disagree with the server, which would look exactly like cheating.
 */
export async function derive(
  randomness: Uint8Array,
  preimage: Uint8Array,
  counter: number
): Promise<number> {
  const key = await crypto.subtle.importKey(
    'raw',
    randomness as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const message = new Uint8Array(preimage.length + 4);
  message.set(preimage, 0);
  new DataView(message.buffer).setUint32(preimage.length, counter, false);

  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, message as BufferSource));
  return new DataView(mac.buffer).getUint32(0, false);
}

/**
 * Rescales published odds over the rarities that still have stock.
 *
 * Largest remainder, ties broken by the lowest rarity code — spelled out
 * because an unspecified tiebreak is exactly where this implementation and the
 * server's would diverge, on the very inputs a suspicious player would build.
 */
export function effectiveOdds(published: Odds[], stock: Record<string, number>): Odds[] {
  const eligible = published
    .filter((o) => o.bps > 0 && (stock[o.rarity_code] ?? 0) > 0)
    .sort((a, b) => a.rarity_code.localeCompare(b.rarity_code));

  if (eligible.length === 0) {
    return [];
  }

  const weight = eligible.reduce((sum, o) => sum + o.bps, 0);
  const out = eligible.map((o) => ({
    rarity_code: o.rarity_code,
    bps: Math.floor((o.bps * TOTAL_BPS) / weight),
  }));
  const remainders = eligible.map((o) => (o.bps * TOTAL_BPS) % weight);

  const assigned = out.reduce((sum, o) => sum + o.bps, 0);
  const order = out.map((_, i) => i).sort((a, b) => remainders[b] - remainders[a]);
  for (let i = 0; i < TOTAL_BPS - assigned; i += 1) {
    out[order[i]].bps += 1;
  }

  return out;
}

/** Walks cumulative odds in rarity-code order to find the rolled rarity. */
export function pickRarity(effective: Odds[], roll: number): string | null {
  let cumulative = 0;
  for (const o of effective) {
    cumulative += o.bps;
    if (roll < cumulative) {
      return o.rarity_code;
    }
  }
  return null;
}

// ----------------------------------------------------------------------

export type VerificationInput = {
  /** Hex, from the receipt. */
  preimage: string;
  /** Hex, fetched from drand independently of us. */
  randomness: string;
  commitHash: string;
  effectiveOdds: Odds[];
  candidateIds: string[];
  claimedRarity: string;
  claimedRoll: number;
  claimedIndex: number;
  claimedCardId: string | null;
};

export type CheckResult = {
  label: string;
  passed: boolean;
  detail: string;
};

export type VerificationReport = {
  ok: boolean;
  checks: CheckResult[];
};

/** Recomputes a pull end to end and reports what matched. */
export async function verifyPull(input: VerificationInput): Promise<VerificationReport> {
  const checks: CheckResult[] = [];

  const preimage = hexToBytes(input.preimage);
  const randomness = hexToBytes(input.randomness);

  // 1. The commitment was not altered after the fact.
  const recomputedCommit = await sha256Hex(preimage);
  checks.push({
    label: 'Commitment intact',
    passed: recomputedCommit === input.commitHash,
    detail: `sha256(preimage) = ${recomputedCommit.slice(0, 16)}…`,
  });

  // 2. The rarity roll.
  const roll = (await derive(randomness, preimage, 0)) % TOTAL_BPS;
  checks.push({
    label: 'Rarity roll reproduces',
    passed: roll === input.claimedRoll,
    detail: `roll ${roll} of ${TOTAL_BPS}`,
  });

  // 3. The roll lands on the rarity that was awarded.
  const rarity = pickRarity(input.effectiveOdds, roll);
  checks.push({
    label: 'Rarity matches the roll',
    passed: rarity === input.claimedRarity,
    detail: rarity ? `${roll} lands in ${rarity}` : 'no rarity contains this roll',
  });

  // 4. The card index within that rarity.
  const index =
    input.candidateIds.length > 0
      ? (await derive(randomness, preimage, 1)) % input.candidateIds.length
      : -1;
  checks.push({
    label: 'Card index reproduces',
    passed: index === input.claimedIndex,
    detail: `index ${index} of ${input.candidateIds.length}`,
  });

  // 5. That index really points at the card handed over.
  const derivedCard = index >= 0 ? (input.candidateIds[index] ?? null) : null;
  checks.push({
    label: 'Card matches the index',
    passed: derivedCard !== null && derivedCard === input.claimedCardId,
    detail: derivedCard ? `${derivedCard.slice(0, 8)}…` : 'no card at that index',
  });

  return { ok: checks.every((c) => c.passed), checks };
}
