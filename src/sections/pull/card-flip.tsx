import type { ReactNode } from 'react';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';

import { CARD_ASPECT_RATIO } from 'src/components/vault';

// ----------------------------------------------------------------------
// A real 3D card turn.
//
// Both faces must share CARD_ASPECT_RATIO and fill the container, so the box
// never changes size mid-flip — the back the user picked becomes the art with no
// jump. The PSA chrome is deliberately *not* part of this: the slab seals around
// the card afterwards, on the reveal screen.
// ----------------------------------------------------------------------

export type CardFlipProps = {
  flipped: boolean;
  back: ReactNode;
  front: ReactNode;
  durationMs?: number;
  reduceMotion?: boolean;
};

export function CardFlip({
  flipped,
  back,
  front,
  durationMs = 650,
  reduceMotion = false,
}: CardFlipProps) {
  const faceSx = {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  } as const;

  if (reduceMotion) {
    // A turn nobody asked to see. Crossfade instead, same timing contract.
    return (
      <Box sx={{ position: 'relative', width: '100%', aspectRatio: CARD_ASPECT_RATIO }}>
        <Box sx={{ ...faceSx, opacity: flipped ? 0 : 1, transition: 'opacity 260ms ease' }}>
          {back}
        </Box>
        <Box sx={{ ...faceSx, opacity: flipped ? 1 : 0, transition: 'opacity 260ms ease' }}>
          {front}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: CARD_ASPECT_RATIO,
        perspective: '1200px',
      }}
    >
      <m.div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
        }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: durationMs / 1000, ease: [0.2, 0.7, 0.25, 1] }}
      >
        <Box sx={faceSx}>{back}</Box>
        <Box sx={{ ...faceSx, transform: 'rotateY(180deg)' }}>{front}</Box>
      </m.div>
    </Box>
  );
}

export default CardFlip;
