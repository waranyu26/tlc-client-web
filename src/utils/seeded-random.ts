// ----------------------------------------------------------------------
// Deterministic pseudo-randomness for particle layouts.
//
// `Math.random()` during render is banned (react-hooks/purity) for good reason:
// a burst that re-rolls on every re-render twitches. A seeded generator is pure,
// so the same component always lays its particles out the same way, and the
// scatter still looks organic.
// ----------------------------------------------------------------------

const MODULUS = 2147483647; // 2^31 - 1
const MULTIPLIER = 48271;

/**
 * Lehmer / MINSTD generator. Deliberately arithmetic rather than bitwise: the
 * repo bans bitwise operators, and every intermediate here stays well inside
 * Number's exact-integer range.
 */
export function makeRandom(seed: number): () => number {
  // State must land in 1..MODULUS-1; 0 is a fixed point that would emit only zeros.
  let state = (Math.abs(Math.trunc(seed)) % (MODULUS - 1)) + 1;
  return () => {
    state = (state * MULTIPLIER) % MODULUS;
    return state / MODULUS;
  };
}
