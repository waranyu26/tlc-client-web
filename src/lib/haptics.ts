import type { PullTier } from 'src/utils/rarity-intensity';

// ----------------------------------------------------------------------
// Vibration is a progressive enhancement: unsupported on iOS Safari and on every
// desktop browser, and throws inside cross-origin iframes. Every call here is a
// no-op when it can't run, so callers never need to guard.
// ----------------------------------------------------------------------

export type HapticPattern = 'tap' | 'pick' | 'flip' | PullTier;

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 8,
  pick: 14,
  flip: 10,
  standard: 18,
  rare: [16, 40, 26],
  epic: [20, 45, 20, 45, 48],
  legendary: [26, 40, 26, 40, 26, 55, 110],
};

export function haptic(pattern: HapticPattern) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    // Blocked by permissions policy — nothing to recover, and nothing worth logging.
  }
}
