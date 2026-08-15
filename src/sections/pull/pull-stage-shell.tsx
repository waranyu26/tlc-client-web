import type { ReactNode } from 'react';

import { useMemo } from 'react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { makeRandom } from 'src/utils/seeded-random';

// ----------------------------------------------------------------------
// The stage every pull phase plays on.
//
// It has to be `position: fixed` to escape AppShell's sidebar/ticker column —
// the pull is a takeover, not a panel. Owns the ambient atmosphere (vignette,
// drifting motes), the screen shake, the tap-to-skip surface, and the aria-live
// region that narrates the phase for screen readers.
// ----------------------------------------------------------------------

const MOTE_COUNT = 16;

type Mote = { left: number; top: number; size: number; delay: number; duration: number };

export type PullStageShellProps = {
  children: ReactNode;
  /** Caption under the stage. */
  caption?: ReactNode;
  /** Announced politely to screen readers when it changes. */
  announcement?: string;
  /**
   * Peak shake amplitude in px. `0` renders no shake at all. Raising it from 0
   * is what fires the shake — the stage never remounts, so children keep their
   * own animations running through it.
   */
  shake?: number;
  /** Tap/click anywhere to fast-forward. Omit to make the stage inert. */
  onSkip?: () => void;
  skipLabel?: string;
  reduceMotion?: boolean;
};

export function PullStageShell({
  children,
  caption,
  announcement,
  shake = 0,
  onSkip,
  skipLabel,
  reduceMotion = false,
}: PullStageShellProps) {
  // Seeded, not random, so React re-renders don't re-roll the drift and make the
  // motes twitch.
  const motes = useMemo<Mote[]>(() => {
    const rand = makeRandom(0xc2b2ae35);
    return Array.from({ length: MOTE_COUNT }, () => ({
      left: rand() * 100,
      top: rand() * 100,
      size: 1 + rand() * 2.2,
      delay: rand() * 6,
      duration: 7 + rand() * 7,
    }));
  }, []);

  const shakeAmp = reduceMotion ? 0 : shake;

  return (
    <Box
      onClick={onSkip}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: (theme) => theme.zIndex.modal,
        // Shards and motes fly sideways out of frame, so x is clipped — but a
        // 4-row pick grid can outgrow a short phone, so y has to be scrollable.
        overflowX: 'hidden',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // `safe` keeps the top of an overflowing stage reachable; plain `center`
        // would push it above the scroll origin.
        justifyContent: 'safe center',
        gap: { xs: '22px', md: '34px' },
        padding: '32px 16px calc(env(safe-area-inset-bottom, 0px) + 48px)',
        backgroundColor: '#08080A',
        backgroundImage:
          'radial-gradient(ellipse at 50% 38%, rgba(231,206,146,0.11) 0%, transparent 62%)',
        cursor: onSkip ? 'pointer' : 'default',
      }}
    >
      {/* Ambient motes */}
      {!reduceMotion
        ? motes.map((mote, index) => (
            <m.div
              key={index}
              style={{
                position: 'absolute',
                left: `${mote.left}%`,
                top: `${mote.top}%`,
                width: mote.size,
                height: mote.size,
                borderRadius: '50%',
                background: 'rgba(231,206,146,0.5)',
                pointerEvents: 'none',
              }}
              animate={{ y: [0, -26, 0], opacity: [0, 0.7, 0] }}
              transition={{
                duration: mote.duration,
                delay: mote.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))
        : null}

      {/* Vignette */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      <m.div
        animate={
          shakeAmp > 0
            ? {
                x: [0, -shakeAmp, shakeAmp, -shakeAmp * 0.6, 0],
                y: [0, shakeAmp * 0.6, -shakeAmp * 0.6, shakeAmp * 0.3, 0],
              }
            : { x: 0, y: 0 }
        }
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 22,
        }}
      >
        {children}
      </m.div>

      {caption ? (
        <Typography
          component="div"
          sx={{
            position: 'relative',
            fontSize: '13px',
            letterSpacing: '0.04em',
            color: '#9A9285',
            textAlign: 'center',
            maxWidth: 420,
          }}
        >
          {caption}
        </Typography>
      ) : null}

      {onSkip && skipLabel ? (
        <Typography
          sx={{
            // Fixed, not absolute: the stage scrolls when the grid is taller
            // than the viewport and this hint should stay put.
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 18px)',
            fontSize: '10.5px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(154,146,133,0.55)',
          }}
        >
          {skipLabel}
        </Typography>
      ) : null}

      <Box
        aria-live="polite"
        aria-atomic="true"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
        }}
      >
        {announcement}
      </Box>
    </Box>
  );
}

export default PullStageShell;
