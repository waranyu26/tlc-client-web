import type { PanInfo } from 'framer-motion';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

import { keyframes } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect, useCallback } from 'react';
import { m, animate, useTransform, useMotionValue } from 'framer-motion';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { haptic } from 'src/lib/haptics';
import { peelTick, peelRelease } from 'src/lib/pull-sfx';

// ----------------------------------------------------------------------
// The sleeve over the turned card.
//
// The flip no longer hands you the result — it hands you something still
// covered. Drag this off in any direction (up, down, left or right) to uncover
// the art at whatever pace you like, which is the whole point: the reveal
// becomes something you do, not something that happens to you.
//
// Absolutely positioned over the card art inside a clipping frame, so sliding it
// past any edge simply removes it from view. `dragDirectionLock` snaps the
// gesture to whichever axis you start on, so the four cardinal peels stay clean
// instead of smearing into diagonals.
// ----------------------------------------------------------------------

const GOLD = '#E7CE92';

/**
 * Fraction of the card that must be uncovered along the locked axis before
 * releasing completes the reveal. Kept modest because the card is hero-sized —
 * half of a 550px slab is a long way to drag with a mouse, and a flick commits
 * regardless.
 */
const COMMIT_RATIO = 0.38;
/** A flick this fast commits regardless of distance. */
const COMMIT_VELOCITY = 420;
/** One grain tick per this much progress. */
const TICK_STEP = 0.12;
/** How long the sleeve takes to clear the frame once committed. */
const EXIT_MS = 400;

const sparkPulse = keyframes`
  0%, 100% { opacity: 0.15; transform: scale(0.7); }
  50% { opacity: 1; transform: scale(1.15); }
`;

/**
 * Sparks ride every edge, not just the top — whichever one is crossing the art
 * is the one you see, and that depends entirely on which way you pull.
 */
const EDGE_SPARKS: {
  top?: string | number;
  bottom?: number;
  left?: string | number;
  right?: number;
}[] = [
  { top: -1, left: '14%' },
  { top: -1, left: '38%' },
  { top: -1, left: '62%' },
  { top: -1, left: '86%' },
  { bottom: -1, left: '18%' },
  { bottom: -1, left: '42%' },
  { bottom: -1, left: '66%' },
  { bottom: -1, left: '90%' },
  { left: -1, top: '16%' },
  { left: -1, top: '38%' },
  { left: -1, top: '62%' },
  { left: -1, top: '84%' },
  { right: -1, top: '20%' },
  { right: -1, top: '44%' },
  { right: -1, top: '68%' },
  { right: -1, top: '88%' },
];

export type PeelCoverProps = {
  /** Draggable only once the turn has finished; during `flip` this is just scenery. */
  interactive: boolean;
  onComplete: () => void;
  reduceMotion?: boolean;
};

export function PeelCover({ interactive, onComplete, reduceMotion = false }: PeelCoverProps) {
  const { t } = useTranslation('pull');

  const ref = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const finishedRef = useRef(false);
  // Distinguishes "tapped the sleeve" from "finished a drag on it" — a click
  // event fires after both, and only the former should shortcut the reveal.
  const draggedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const measure = () => {
      const next = { width: node.offsetWidth, height: node.offsetHeight };
      sizeRef.current = next;
      setSize(next);
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /** How much of the card is uncovered, 0..1, along whichever axis is in play. */
  const progress = useCallback(() => {
    const { width, height } = sizeRef.current;
    if (!width || !height) return 0;
    return Math.max(Math.abs(x.get()) / width, Math.abs(y.get()) / height);
  }, [x, y]);

  // Grain underfoot: a tick every TICK_STEP of the way off.
  useEffect(() => {
    if (!interactive || reduceMotion) return undefined;
    let lastBucket = 0;
    const onChange = () => {
      const bucket = Math.floor(progress() / TICK_STEP);
      if (bucket !== lastBucket) {
        lastBucket = bucket;
        if (bucket > 0) peelTick();
      }
    };
    const unsubscribeX = x.on('change', onChange);
    const unsubscribeY = y.on('change', onChange);
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [interactive, progress, reduceMotion, x, y]);

  /**
   * Sends the sleeve off along `(dx, dy)`. A zero vector — a tap, or Enter —
   * falls back to sliding it downward.
   */
  const finish = useCallback(
    (dx: number, dy: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      peelRelease();
      haptic('pick');

      const { width, height } = sizeRef.current;
      const magnitude = Math.hypot(dx, dy);
      const unitX = magnitude > 0.5 ? dx / magnitude : 0;
      const unitY = magnitude > 0.5 ? dy / magnitude : 1;
      // Far enough that the sleeve clears the frame from any starting corner.
      const clearance = Math.hypot(width, height) + 64;

      const transition = { duration: EXIT_MS / 1000, ease: 'easeIn' } as const;
      animate(x, unitX * clearance, transition);
      animate(y, unitY * clearance, { ...transition, onComplete });
    },
    [onComplete, x, y]
  );

  const handleDragEnd = useCallback(
    (_event: unknown, info: PanInfo) => {
      const flicked = Math.hypot(info.velocity.x, info.velocity.y) > COMMIT_VELOCITY;
      if (progress() > COMMIT_RATIO || flicked) {
        // Position plus a dash of velocity: a fast flick that barely moved still
        // carries a clear direction, and a slow long drag still uses where it ended.
        finish(x.get() + info.velocity.x * 0.15, y.get() + info.velocity.y * 0.15);
        return;
      }
      const springBack = { type: 'spring', stiffness: 320, damping: 30 } as const;
      animate(x, 0, springBack);
      animate(y, 0, springBack);
    },
    [finish, progress, x, y]
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (!interactive) return;
      const vectors: Record<string, [number, number]> = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        Enter: [0, 1],
        ' ': [0, 1],
      };
      const vector = vectors[event.key];
      if (!vector) return;
      event.preventDefault();
      finish(vector[0], vector[1]);
    },
    [finish, interactive]
  );

  // The hint gets out of the way as soon as the user starts pulling, whichever
  // way that is.
  const hintOpacity = useTransform([x, y], (latest: number[]) => {
    const { width, height } = sizeRef.current;
    if (!width || !height) return 1;
    const moved = Math.max(Math.abs(latest[0]) / width, Math.abs(latest[1]) / height);
    return Math.max(0, 1 - moved * 2.6);
  });

  return (
    <m.div
      ref={ref}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : -1}
      aria-label={interactive ? t('peel.aria') : undefined}
      onKeyDown={handleKeyDown}
      onPointerDown={() => {
        draggedRef.current = false;
      }}
      onDragStart={() => {
        draggedRef.current = true;
      }}
      onDragEnd={handleDragEnd}
      onClick={(event) => {
        event.stopPropagation();
        if (interactive && !draggedRef.current) finish(0, 0);
      }}
      drag={interactive}
      dragDirectionLock
      dragConstraints={{
        top: -size.height,
        bottom: size.height,
        left: -size.width,
        right: size.width,
      }}
      dragElastic={0.08}
      dragMomentum={false}
      style={{
        position: 'absolute',
        inset: 0,
        x,
        y,
        touchAction: 'none',
        cursor: interactive ? 'grab' : 'default',
      }}
      whileDrag={{ cursor: 'grabbing' }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          background: 'linear-gradient(165deg, #16130D 0%, #0A0908 55%, #050505 100%)',
          // Every edge glows, because any of them can be the one crossing the art.
          border: `2px solid ${GOLD}`,
          boxShadow: `0 0 24px ${GOLD}, 0 0 56px ${GOLD}77`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Brushed sleeve texture — deliberately plainer than the compass back, so
            it reads as something laid over the card rather than the card itself. */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.6,
            backgroundImage: `repeating-linear-gradient(90deg, ${GOLD}0A 0px, ${GOLD}0A 1px, transparent 1px, transparent 7px)`,
          }}
        />

        {!reduceMotion
          ? EDGE_SPARKS.map((spark, index) => (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  ...spark,
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  bgcolor: '#FFF6E0',
                  boxShadow: `0 0 8px ${GOLD}`,
                  animation: `${sparkPulse} ${1.2 + index * 0.07}s ease-in-out infinite`,
                }}
              />
            ))
          : null}

        <m.div style={{ opacity: hintOpacity }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              padding: '0 16px',
              textAlign: 'center',
            }}
          >
            <m.div
              animate={reduceMotion ? undefined : { scale: [1, 1.12, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Box
                component="svg"
                viewBox="0 0 48 48"
                aria-hidden
                sx={{ width: 46, height: 46, color: GOLD }}
              >
                <path fill="currentColor" d="M24 3l7 9H17z" />
                <path fill="currentColor" d="M24 45l-7-9h14z" />
                <path fill="currentColor" d="M3 24l9-7v14z" />
                <path fill="currentColor" d="M45 24l-9 7V17z" />
                <circle cx="24" cy="24" r="3.4" fill="currentColor" opacity="0.75" />
              </Box>
            </m.div>

            <Typography
              sx={{
                fontSize: '12px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#9A9285',
                lineHeight: 1.7,
              }}
            >
              {t('peel.hint')}
            </Typography>
          </Box>
        </m.div>
      </Box>
    </m.div>
  );
}

export default PeelCover;
