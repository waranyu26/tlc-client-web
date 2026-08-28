/**
 * Independent verification of a drand quicknet beacon, in the browser.
 *
 * The receipt page already re-fetches the randomness from api.drand.sh rather
 * than trusting ours. That is good but not sufficient: it makes api.drand.sh an
 * oracle, so a spoofed or compromised mirror — or a DNS answer we influenced —
 * would agree with a forged receipt. Checking the BLS signature closes that,
 * because a valid threshold signature can only be produced by the drand network
 * itself, whatever server hands it to you.
 *
 * The service deliberately does NOT do this in-process (see
 * `shared/external/drand.go` — it cross-checks mirrors instead of importing a
 * pairing curve). So this is the only place the signature is actually checked,
 * which is the right place: on the sceptic's machine.
 */
import { sha256 } from '@noble/hashes/sha2.js';
import { bls12_381 } from '@noble/curves/bls12-381.js';

import { bytesToHex, hexToBytes } from './fair-verify';

// ----------------------------------------------------------------------

/**
 * Quicknet's chain parameters, pinned rather than fetched.
 *
 * The public key MUST NOT come from our own /v1/drand/info: verifying a
 * signature against a key the signer's counterparty supplied proves nothing,
 * because we could serve a key we hold and sign whatever we liked. These are
 * public, published values — hardcoding them is what makes the check adversarial
 * to us. Cross-check them yourself at
 * https://api.drand.sh/52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971/info
 */
export const QUICKNET = {
  chainHash: '52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971',
  publicKey:
    '83cf0f2896adee7eb8b5f01fcad3912212c437e0073e911fb90022d3e760183c8c4b450b6a0a6c3ac6a5776a2d1064510d1fec758c921cc22b0e17e63aaf4bcb5ed66304de9cf809bd274ca73bab4af5a6e9c76a4bc09e76eae8991ef5ece45a',
  /** RFC 9380 domain separation tag for G1 signatures — part of the scheme id. */
  dst: 'BLS_SIG_BLS12381G1_XMD:SHA-256_SSWU_RO_NUL_',
  schemeId: 'bls-unchained-g1-rfc9380',
  genesisTime: 1692803367,
  periodSeconds: 3,
} as const;

/** Which round covers a given wall-clock instant. Round 1 lands at genesis. */
export function roundAt(unixSeconds: number): number {
  if (unixSeconds < QUICKNET.genesisTime) return 0;
  return Math.floor((unixSeconds - QUICKNET.genesisTime) / QUICKNET.periodSeconds) + 1;
}

/** When a round is due, as a unix timestamp in seconds. */
export function roundDueAt(round: number): number {
  return QUICKNET.genesisTime + (round - 1) * QUICKNET.periodSeconds;
}

// ----------------------------------------------------------------------

export type BeaconRound = {
  round: number;
  randomness: string;
  signature: string;
};

/**
 * Fetches a round straight from drand.
 *
 * `latest` is accepted so a caller can watch the chain advance without having
 * to trust our clock either.
 */
export async function fetchDrandRound(round: number | 'latest'): Promise<BeaconRound> {
  const res = await fetch(`https://api.drand.sh/${QUICKNET.chainHash}/public/${round}`);
  if (!res.ok) {
    throw new Error(`drand returned ${res.status} for round ${round}`);
  }
  const body = await res.json();
  return {
    round: body.round as number,
    randomness: body.randomness as string,
    signature: body.signature as string,
  };
}

// ----------------------------------------------------------------------

export type BeaconVerdict = {
  /** False if any check failed, or if the chain is one we cannot vouch for. */
  ok: boolean;
  chainRecognised: boolean;
  randomnessDerived: boolean;
  signatureValid: boolean;
  detail: string;
};

/**
 * Checks that a beacon is genuinely the drand network's, for the round claimed.
 *
 * Two independent facts, in order of strength:
 *
 *  1. `randomness == sha256(signature)` — quicknet's definition. Catches a
 *     truncated or naively edited response, and is what binds the number the
 *     draw consumed to the signature being checked. Cheap, but only as strong
 *     as step 2, since anyone can sha256 a string they invented.
 *  2. The signature verifies under quicknet's public key for the message
 *     `sha256(uint64be(round))`. Unchained, so the message is the round alone
 *     with no dependence on the previous round. This is the real check: it is
 *     unforgeable without the network's threshold key, so it holds even if the
 *     mirror that served it is hostile.
 */
export function verifyBeaconRound(beacon: BeaconRound, chainHash?: string): BeaconVerdict {
  const chainRecognised = !chainHash || chainHash === QUICKNET.chainHash;
  if (!chainRecognised) {
    return {
      ok: false,
      chainRecognised: false,
      randomnessDerived: false,
      signatureValid: false,
      detail: `receipt cites chain ${chainHash?.slice(0, 12)}…, which is not quicknet — cannot verify independently`,
    };
  }

  let signature: Uint8Array;
  try {
    signature = hexToBytes(beacon.signature);
  } catch {
    return {
      ok: false,
      chainRecognised,
      randomnessDerived: false,
      signatureValid: false,
      detail: 'signature is not valid hex',
    };
  }

  const randomnessDerived = bytesToHex(sha256(signature)) === beacon.randomness;

  // Unchained scheme: the signed message is the round number alone, as an
  // 8-byte big-endian integer, hashed once with SHA-256.
  const roundBytes = new Uint8Array(8);
  new DataView(roundBytes.buffer).setBigUint64(0, BigInt(beacon.round), false);

  let signatureValid = false;
  try {
    const sigs = bls12_381.shortSignatures;
    const message = sigs.hash(sha256(roundBytes), QUICKNET.dst);
    signatureValid = sigs.verify(signature, message, hexToBytes(QUICKNET.publicKey));
  } catch {
    // A malformed point throws during decoding rather than returning false.
    signatureValid = false;
  }

  const ok = randomnessDerived && signatureValid;
  return {
    ok,
    chainRecognised,
    randomnessDerived,
    signatureValid,
    detail: ok
      ? `round ${beacon.round} carries a valid drand threshold signature`
      : [
          !randomnessDerived && 'randomness is not sha256(signature)',
          !signatureValid && 'signature does not verify under quicknet’s public key',
        ]
          .filter(Boolean)
          .join('; '),
  };
}
