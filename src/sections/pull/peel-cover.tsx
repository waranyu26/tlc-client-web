import type { PanInfo } from 'framer-motion';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

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
// covered. Dragging this down uncovers the art at whatever pace you like, which
// is the whole point: the reveal becomes something you do, not something that
// happens to you.
//
// Absolutely positioned over the card art inside a clipping frame, so sliding it
// past the bottom edge simply removes it from view.
// ----------------------------------------------------------------------

const GOLD = '#E7CE92';

/**
 * Fraction of the card that must be uncovered before releasing completes the
 * reveal. Kept modest because the card is hero-sized — 45% of a 550px slab is a
 * long way to drag with a mouse, and a flick commits regardless.
 */
const COMMIT_RATIO = 0.38;
/** A flick this fast commits regardless of distance. */
const COMMIT_VELOCITY = 420;
/** One grain tick per this much progress. */
const TICK_STEP = 0.12;

const SPARK_OFFSETS = [8, 24, 41, 58, 74, 90];

export type PeelCoverProps = {
  /** Draggable only once the turn has finished; during `flip` this is just scenery. */
  interactive: boolean;
  onComplete: () => void;
  reduceMotion?: boolean;
};

export function PeelCover({ interactive, onComplete, reduceMotion = false }: PeelCoverProps) {
  const { t } = useTranslation('pull');

  const ref = useRef<HTMLDivElement>(null);
  const heightRef = useRef(0);
  const [height, setHeight] = useState(0);

  const y = useMotionValue(0);
  const finishedRef = useRef(false);
  // Distinguishes "tapped the sleeve" from "finished a drag on it" — a click
  // event fires after both, and only the former should shortcut the reveal.
  const draggedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const measure = () => {
      heightRef.current = node.offsetHeight;
      setHeight(node.offsetHeight);
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Grain underfoot: a tick every TICK_STEP of the way down.
  useEffect(() => {
    if (!interactive || reduceMotion) return undefined;
    let lastBucket = 0;
    return y.on('change', (latest) => {
      const h = heightRef.current;
      if (!h) return;
      const bucket = Math.floor(latest / h / TICK_STEP);
      if (bucket !== lastBucket) {
        lastBucket = bucket;
        if (bucket > 0) peelTick();
      }
    });
  }, [interactive, reduceMotion, y]);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    peelRelease();
    haptic('pick');
    animate(y, heightRef.current + 56, {
      type: 'spring',
      stiffness: 240,
      damping: 28,
      onComplete,
    });
  }, [onComplete, y]);

  const handleDragEnd = useCallback(
    (_event: unknown, info: PanInfo) => {
      const h = heightRef.current;
      if (h && (y.get() > h * COMMIT_RATIO || info.velocity.y > COMMIT_VELOCITY)) {
        finish();
        return;
      }
      animate(y, 0, { type: 'spring', stiffness: 320, damping: 30 });
    },
    [finish, y]
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (!interactive) return;
      if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'ArrowDown') return;
      event.preventDefault();
      finish();
    },
    [finish, interactive]
  );

  // The hint gets out of the way as soon as the user starts pulling.
  const hintOpacity = useTransform(y, (value) => {
    const h = heightRef.current;
    if (!h) return 1;
    return Math.max(0, 1 - (value / h) * 2.6);
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
        if (interactive && !draggedRef.current) finish();
      }}
      drag={interactive ? 'y' : false}
      dragDirectionLock
      dragConstraints={{ top: 0, bottom: height }}
      dragElastic={{ top: 0, bottom: 0.06 }}
      dragMomentum={false}
      style={{
        position: 'absolute',
        inset: 0,
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
          borderTop: `1px solid ${GOLD}66`,
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

        {/* Light spilling onto the art as the edge passes over it. */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 4,
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
            boxShadow: `0 0 24px ${GOLD}, 0 0 56px ${GOLD}88`,
          }}
        />

        {!reduceMotion
          ? SPARK_OFFSETS.map((left, index) => (
              <m.div
                key={left}
                style={{
                  position: 'absolute',
                  top: -1,
                  left: `${left}%`,
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  background: '#FFF6E0',
                  boxShadow: `0 0 8px ${GOLD}`,
                }}
                animate={{ opacity: [0.2, 1, 0.2], y: [0, -5, 0] }}
                transition={{
                  duration: 1.1 + index * 0.13,
                  repeat: Infinity,
                  ease: 'easeInOut',
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
            {/* Grabber notches */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[0, 1, 2].map((line) => (
                <Box
                  key={line}
                  sx={{ width: 44, height: 3, borderRadius: '2px', bgcolor: `${GOLD}5C` }}
                />
              ))}
            </Box>

            <m.div
              animate={reduceMotion ? undefined : { y: [0, 7, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Box
                component="svg"
                viewBox="0 0 24 24"
                aria-hidden
                sx={{ width: 40, height: 40, color: GOLD }}
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 9l6 6 6-6"
                />
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
