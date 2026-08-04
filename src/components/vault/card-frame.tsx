import type { BoxProps } from '@mui/material/Box';

import { keyframes } from '@emotion/react';

import Box from '@mui/material/Box';
import SvgIcon from '@mui/material/SvgIcon';

import { getRarityColor } from './rarity-badge';

// ----------------------------------------------------------------------

const sheenSweep = keyframes`
  0% { transform: translateX(-100%) rotate(8deg); }
  100% { transform: translateX(220%) rotate(8deg); }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 28px var(--glow-color); }
  50% { box-shadow: 0 0 52px var(--glow-color); }
`;

/**
 * The proportions every piece of card art is rendered at. Pack covers use it
 * too, so a pack reads as a card rather than a banner — exported here so the
 * two can't drift apart.
 */
export const CARD_ASPECT_RATIO = '5 / 6';

export type CardFrameProps = Omit<BoxProps, 'children'> & {
  /**
   * Grid-sized art. Prefer a card's `thumb_url` here — the frame renders at
   * roughly 200-260px, so handing it the full scan makes every browse surface
   * decode megapixels it will never show. Falls back to `imageUrl` for cards
   * whose art was bulk-imported and never got a thumbnail.
   */
  thumbUrl?: string | null;
  /** Full-resolution art, used only as the fallback source — see `thumbUrl`. */
  imageUrl?: string | null;
  rarity: string;
  alt: string;
  glow?: boolean;
  /**
   * Render above the fold. Eager-loads instead of deferring, for the one card
   * that is certainly visible on arrival (a detail page hero, a pull reveal).
   */
  priority?: boolean;
};

export function CardFrame({
  thumbUrl,
  imageUrl,
  rarity,
  alt,
  glow = false,
  priority = false,
  sx,
  ...other
}: CardFrameProps) {
  const color = getRarityColor(rarity);
  const src = thumbUrl || imageUrl;

  return (
    <Box
      sx={[
        {
          position: 'relative',
          width: '100%',
          aspectRatio: CARD_ASPECT_RATIO,
          borderRadius: '4px',
          border: `1.5px solid ${color}`,
          boxShadow: `0 0 36px ${color}55, inset 0 0 50px rgba(0,0,0,0.35)`,
          overflow: 'hidden',
          bgcolor: '#0A0808',
          ...(glow && {
            '--glow-color': `${color}80`,
            animation: `${glowPulse} 2s ease-in-out infinite`,
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {src ? (
        <Box
          component="img"
          src={src}
          alt={alt}
          // Grids stack dozens of these. Deferring the off-screen ones and
          // decoding off the main thread is what keeps scrolling smooth.
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SvgIcon
            viewBox="0 0 24 24"
            sx={{ width: '30%', height: '30%', color: `${color}55` }}
            titleAccess={alt}
          >
            <path
              fill="currentColor"
              d="M12 2c.6 5 2.9 7.4 8 8-5.1.6-7.4 2.9-8 8-.6-5.1-2.9-7.4-8-8 5.1-.6 7.4-2.9 8-8z"
            />
          </SvgIcon>
        </Box>
      )}

      {/* Holo sheen sweep */}
      <Box
        className="sheen"
        sx={{
          position: 'absolute',
          top: '-10%',
          left: 0,
          width: '45%',
          height: '120%',
          background: 'linear-gradient(90deg, transparent, rgba(231,206,146,0.13), transparent)',
          animation: `${sheenSweep} 3.8s ease-in-out infinite`,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}

export default CardFrame;
