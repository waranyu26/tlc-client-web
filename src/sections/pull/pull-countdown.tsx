import { m } from 'framer-motion';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------
// The 3 · 2 · 1 under the charging card.
//
// What it counts out is not a literal three seconds. The card is charged
// against a drand round that has not published yet, so the true hold is the
// later of the local charge window and the beacon's own arrival, and it moves
// from pull to pull. The three digits are therefore spread evenly across
// whatever that window turns out to be: a counter that hit one and then sat
// there for two seconds — or got cut off at two — would read as broken on the
// one screen whose entire job is to look trustworthy.
//
// If the beacon runs late anyway the count holds at 1 rather than passing 0.
// Zero promises an instant, and this is the one instant we cannot promise.
// ----------------------------------------------------------------------

const GOLD = '#E7CE92';
const STEPS = 3;
/** How often the remaining window is re-read. Cheap: an unchanged digit bails out of the re-render. */
const SAMPLE_MS = 80;

function digitAt(startAt: number, endAt: number, now: number) {
  const step = Math.max(endAt - startAt, STEPS) / STEPS;
  const elapsed = Math.max(0, now - startAt);
  return Math.min(STEPS, Math.max(1, STEPS - Math.floor(elapsed / step)));
}

export type PullCountdownProps = {
  /** When the charge began. */
  startAt: number;
  /** Best estimate of when the card turns over. */
  endAt: number;
  reduceMotion?: boolean;
};

export function PullCountdown({ startAt, endAt, reduceMotion = false }: PullCountdownProps) {
  const [digit, setDigit] = useState(() => digitAt(startAt, endAt, Date.now()));

  // `endAt` moves once the ticket lands and names its beacon round, so the
  // window is re-read every tick rather than baked into scheduled timeouts.
  useEffect(() => {
    const sample = () => setDigit(digitAt(startAt, endAt, Date.now()));
    sample();
    const id = setInterval(sample, SAMPLE_MS);
    return () => clearInterval(id);
  }, [startAt, endAt]);

  return (
    // Hidden from screen readers: the stage already announces the phase once,
    // and a digit re-announced every second is noise, not information.
    <Box
      aria-hidden
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Fixed, so the stage above it does not shift as the glyph changes.
        height: 64,
      }}
    >
      <m.span
        // Re-keying per digit is what replays the pop — the glyph is a new
        // element each beat rather than the same one changing its text.
        key={reduceMotion ? 'countdown' : digit}
        initial={reduceMotion ? false : { scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
        style={{
          display: 'block',
          fontSize: 56,
          lineHeight: 1,
          fontWeight: 300,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.04em',
          color: GOLD,
          textShadow: `0 0 24px ${GOLD}66, 0 0 6px ${GOLD}99`,
        }}
      >
        {digit}
      </m.span>
    </Box>
  );
}

export default PullCountdown;
