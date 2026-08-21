import type { PullResult } from 'src/api/types';
import type { PullPhase } from 'src/store/pull-flow-store';
import type { PullIntensity } from 'src/utils/rarity-intensity';

import { m } from 'framer-motion';
import { useRef, useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';

import { makeRandom } from 'src/utils/seeded-random';

import { CardBack, CardFrame, getRarityColor, CARD_ASPECT_RATIO } from 'src/components/vault';

import { CardFlip } from './card-flip';
import { PeelCover } from './peel-cover';

// ----------------------------------------------------------------------
// converge -> charge -> flip -> peel.
//
// The picked card flies out of the grid (framer shares the layoutId with the
// PickCard that was tapped, so it is literally the same element continuing its
// journey), gathers light, and turns over — onto a sleeve, not the art. The
// user drags that sleeve off at their own pace.
//
// The rarity colour stays hidden until the peel: leaking it during `charge`
// would spoil a legendary and telegraph a dud. What *does* scale with tier is
// the charge length and the density of the motes — a hint, not an answer.
//
// `peel` drops the 3D flip wrapper for a plain stack of the same geometry. The
// swap is invisible (both show the sleeve over the art at identical size), and
// it keeps a draggable element out of a doubly-rotated 3D context.
// ----------------------------------------------------------------------

const GOLD = '#E7CE92';

type Mote = { angle: number; radius: number; delay: number; duration: number; size: number };

export type PullSuspenseViewProps = {
  phase: Extract<PullPhase, 'converge' | 'charge' | 'flip' | 'peel'>;
  intensity: PullIntensity;
  result: PullResult | null;
  pickedIndex: number | null;
  /** Fired when the sleeve clears the card. */
  onPeelComplete: () => void;
  reduceMotion?: boolean;
};

export function PullSuspenseView({
  phase,
  intensity,
  result,
  pickedIndex,
  onPeelComplete,
  reduceMotion = false,
}: PullSuspenseViewProps) {
  const peeling = phase === 'peel';
  const charging = phase === 'charge' || phase === 'flip' || peeling;
  const flipped = phase === 'flip' || peeling;
  const rarityColor = getRarityColor(result?.rarity);

  // The stage sizes itself off the viewport, so the motes have to be measured
  // rather than hardcoded: anything spawning inside the card's own footprint is
  // painted over by it and never seen.
  const stageRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return undefined;

    const measure = () => setCardWidth(node.offsetWidth);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const motes = useMemo<Mote[]>(() => {
    const rand = makeRandom(0x85ebca6b + intensity.moteCount);
    // Half the card's diagonal is ~0.98×width at this ratio, so anything under
    // 1.0 spawns under the card and is painted over before it is ever seen.
    const clearance = Math.max(150, cardWidth);
    return Array.from({ length: intensity.moteCount }, (_, i) => ({
      angle: (i / Math.max(1, intensity.moteCount)) * Math.PI * 2 + rand() * 0.5,
      radius: clearance * (1.05 + rand() * 0.55),
      delay: rand() * 0.8,
      duration: 0.9 + rand() * 0.7,
      size: 2.5 + rand() * 3,
    }));
  }, [cardWidth, intensity.moteCount]);

  // The art with the sleeve laid over it, inside a frame that clips — sliding
  // the sleeve past the bottom edge is what takes it out of view. Shared by both
  // branches below so the flip→peel swap is pixel-identical.
  const sleevedCard = (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: '4px',
      }}
    >
      {result ? (
        <CardFrame
          priority
          glow
          thumbUrl={result.thumb_url}
          imageUrl={result.image_url}
          rarity={result.rarity}
          alt={result.card_name}
          sx={{ position: 'absolute', inset: 0, height: '100%', aspectRatio: 'auto' }}
        />
      ) : (
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#0A0808' }} />
      )}

      <PeelCover interactive={peeling} reduceMotion={reduceMotion} onComplete={onPeelComplete} />
    </Box>
  );

  return (
    <Box
      ref={stageRef}
      sx={{
        position: 'relative',
        // Hero-sized, and bounded by height as well as width: at the catalogue's
        // card ratio the box is 1.7× as tall as it is wide, so `37vh` of width is
        // `63vh` of card — about as much as fits above the caption without the
        // stage needing to scroll.
        width: 'min(78vw, 37vh, 340px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Motes spiralling into the card while it charges. */}
      {charging && !reduceMotion
        ? motes.map((mote, index) => (
            <m.div
              key={index}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: mote.size,
                height: mote.size,
                borderRadius: '50%',
                background: GOLD,
                boxShadow: `0 0 8px ${GOLD}`,
                pointerEvents: 'none',
              }}
              initial={{
                x: Math.cos(mote.angle) * mote.radius,
                y: Math.sin(mote.angle) * mote.radius,
                opacity: 0,
                scale: 1,
              }}
              animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: 0.2 }}
              transition={{
                duration: mote.duration,
                delay: mote.delay,
                repeat: Infinity,
                ease: 'easeIn',
              }}
            />
          ))
        : null}

      {/* Rim light in the card's rarity colour, blooming behind it as the sleeve
          comes off. Rendered before the card and left unpositioned in z so it
          stays a halo rather than a wash over the art. */}
      {peeling && !reduceMotion ? (
        <m.div
          style={{
            position: 'absolute',
            inset: '-14%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${rarityColor}3D 0%, transparent 62%)`,
            pointerEvents: 'none',
          }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ) : null}

      <m.div
        // Shares its identity with the tapped PickCard, so framer morphs that
        // exact card out of the grid and into the centre instead of cross-fading
        // an unrelated one in.
        layoutId={!reduceMotion && pickedIndex !== null ? `pick-card-${pickedIndex}` : undefined}
        style={{ position: 'relative', width: '100%' }}
        animate={{ scale: charging ? 1 : 0.94 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      >
        {peeling ? (
          <Box sx={{ position: 'relative', width: '100%', aspectRatio: CARD_ASPECT_RATIO }}>
            {sleevedCard}
          </Box>
        ) : (
          <CardFlip
            flipped={flipped}
            reduceMotion={reduceMotion}
            back={
              <CardBack
                sheen={!reduceMotion}
                glow={charging ? 0.85 : 0.3}
                sx={{ height: '100%', aspectRatio: 'auto' }}
              />
            }
            front={sleevedCard}
          />
        )}
      </m.div>
    </Box>
  );
}

export default PullSuspenseView;
