import type { BoxProps } from '@mui/material/Box';

import { keyframes } from '@emotion/react';

import Box from '@mui/material/Box';

import { CARD_ASPECT_RATIO } from './card-frame';

// ----------------------------------------------------------------------
// The face-down card. Used by the pick grid, the deck stack it deals from, and
// the back face of the reveal flip — so the same object the user chooses is
// literally the one that turns over.
//
// Original artwork only (see DESIGN.md "IP / Legal Notes"): a gold rim, a foil
// lattice, and an abstract compass sigil. Nothing here references any real
// trading-card brand.
// ----------------------------------------------------------------------

const GOLD = '#E7CE92';

const sheenSweep = keyframes`
  0% { transform: translateX(-120%) rotate(8deg); }
  100% { transform: translateX(260%) rotate(8deg); }
`;

const sigilDrift = keyframes`
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(6deg) scale(1.04); }
`;

export type CardBackProps = Omit<BoxProps, 'children'> & {
  /** Rim/sigil colour. Defaults to the vault gold; the charge stage tints it by rarity. */
  accent?: string;
  /** Continuous holo sweep. Turn off for reduced motion or for a large static grid. */
  sheen?: boolean;
  /** Outer glow intensity, 0–1. Drives the rim shadow rather than a separate prop per state. */
  glow?: number;
};

export function CardBack({ accent = GOLD, sheen = true, glow = 0, sx, ...other }: CardBackProps) {
  return (
    <Box
      sx={[
        {
          position: 'relative',
          width: '100%',
          aspectRatio: CARD_ASPECT_RATIO,
          borderRadius: '4px',
          overflow: 'hidden',
          border: `1.5px solid ${accent}${glow > 0.5 ? 'CC' : '66'}`,
          background: `radial-gradient(ellipse at 50% 38%, #17140E 0%, #0A0808 62%, #060505 100%)`,
          boxShadow:
            glow > 0
              ? `0 10px 28px rgba(0,0,0,0.55), 0 0 ${Math.round(14 + glow * 46)}px ${accent}${glow > 0.6 ? '99' : '55'}`
              : '0 10px 28px rgba(0,0,0,0.55)',
          transition: 'box-shadow 220ms ease, border-color 220ms ease',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {/* Foil lattice */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.5,
          backgroundImage: `
            repeating-linear-gradient(45deg, ${accent}0F 0px, ${accent}0F 1px, transparent 1px, transparent 9px),
            repeating-linear-gradient(-45deg, ${accent}0F 0px, ${accent}0F 1px, transparent 1px, transparent 9px)
          `,
        }}
      />

      {/* Inset frame line */}
      <Box
        sx={{
          position: 'absolute',
          inset: '7%',
          borderRadius: '2px',
          border: `1px solid ${accent}2E`,
        }}
      />

      {/* Compass sigil */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 48 48"
          aria-hidden
          sx={{
            width: '46%',
            height: '46%',
            color: accent,
            opacity: glow > 0 ? 0.55 + glow * 0.45 : 0.55,
            animation: sheen ? `${sigilDrift} 6s ease-in-out infinite` : 'none',
            transition: 'opacity 220ms ease',
          }}
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.9"
            opacity="0.5"
          />
          <path
            d="M24 6 L42 24 L24 42 L6 24 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.9"
            opacity="0.65"
          />
          <path
            fill="currentColor"
            d="M24 11c1.2 9.6 3.4 11.8 13 13-9.6 1.2-11.8 3.4-13 13-1.2-9.6-3.4-11.8-13-13 9.6-1.2 11.8-3.4 13-13z"
          />
          <circle cx="24" cy="3.4" r="1.4" fill="currentColor" opacity="0.8" />
          <circle cx="24" cy="44.6" r="1.4" fill="currentColor" opacity="0.8" />
          <circle cx="3.4" cy="24" r="1.4" fill="currentColor" opacity="0.8" />
          <circle cx="44.6" cy="24" r="1.4" fill="currentColor" opacity="0.8" />
        </Box>
      </Box>

      {sheen ? (
        <Box
          sx={{
            position: 'absolute',
            top: '-10%',
            left: 0,
            width: '40%',
            height: '120%',
            background: `linear-gradient(90deg, transparent, ${accent}22, transparent)`,
            animation: `${sheenSweep} 4.2s ease-in-out infinite`,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </Box>
  );
}

export default CardBack;
