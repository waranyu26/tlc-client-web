import type { Theme, SxProps } from '@mui/material/styles';

import { primaryFont, secondaryFont } from './core/typography';

// ----------------------------------------------------------------------
// Responsive type ramp.
//
// The screens previously hard-coded literal px sizes ("fontSize: '9.5px'"),
// which is why nothing grew on a desktop canvas. Spread these fragments into
// `sx` instead so every size steps up with the viewport.
//
// @see DESIGN.md — "Typography"
// ----------------------------------------------------------------------

export const typeScale = {
  /** Wallet / portfolio balance — the largest number on any screen. */
  heroAmount: {
    fontFamily: secondaryFont,
    fontWeight: 600,
    lineHeight: 1.05,
    fontSize: { xs: '44px', md: '56px', lg: '64px' },
  },

  /** Page-level display heading (onboarding, empty states). */
  display: {
    fontFamily: secondaryFont,
    fontWeight: 600,
    lineHeight: 1.1,
    letterSpacing: '-0.01em',
    fontSize: { xs: '32px', md: '40px', lg: '48px' },
  },

  /** Section heading above a grid or list. */
  sectionHeading: {
    fontFamily: secondaryFont,
    fontWeight: 600,
    lineHeight: 1.15,
    fontSize: { xs: '22px', md: '25px', lg: '27px' },
  },

  /** Card / pack title. */
  cardTitle: {
    fontFamily: secondaryFont,
    fontWeight: 600,
    lineHeight: 1.2,
    fontSize: { xs: '18px', md: '20px', lg: '23px' },
  },

  /** Default running text. Line height stays Thai-comfortable. */
  body: {
    fontFamily: primaryFont,
    fontWeight: 400,
    lineHeight: 1.55,
    fontSize: { xs: '13px', md: '14px', lg: '15px' },
  },

  /** Secondary text — captions, helper copy, list metadata. */
  label: {
    fontFamily: primaryFont,
    fontWeight: 400,
    lineHeight: 1.5,
    fontSize: { xs: '11px', md: '12px' },
  },

  /** Letter-spaced caps — "AVAILABLE BALANCE", rarity pills, slab labels. */
  micro: {
    fontFamily: primaryFont,
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    fontSize: { xs: '9.5px', md: '10.5px' },
  },

  /** Primary button label. */
  buttonPrimary: {
    fontFamily: primaryFont,
    fontWeight: 700,
    fontSize: { xs: '15px', lg: '16px' },
  },

  /** Secondary / ghost button label. */
  buttonSecondary: {
    fontFamily: primaryFont,
    fontWeight: 600,
    fontSize: { xs: '13px', lg: '14px' },
  },
} satisfies Record<string, SxProps<Theme>>;

export type TypeScaleKey = keyof typeof typeScale;
