// ----------------------------------------------------------------------
// Shared layout metrics for the desktop-first app shell.
//
// The design target is the wide canvas: a persistent sidebar beside a content
// pane capped at CONTENT_MAX_WIDTH. Everything below `md` collapses back to a
// single full-width column with the fixed BottomNav.
//
// @see DESIGN.md — "Responsive Layout"
// ----------------------------------------------------------------------

/** Expanded sidebar rail (lg and up) — mark, wordmark, labelled nav. */
export const SIDEBAR_WIDTH = 248;

/** Icon-only sidebar rail (md..lg) — mark and icons, no labels. */
export const SIDEBAR_WIDTH_COMPACT = 88;

/** Fixed bottom tab bar, rendered below `md` only. */
export const BOTTOM_NAV_HEIGHT = 54;

/** Sticky mobile header (hamburger, language, music, session), below `md` only. */
export const MOBILE_TOP_BAR_HEIGHT = 52;

/**
 * Sticky desktop header (language, music, session), `md` and up.
 *
 * Tall enough to seat a real button, which is the whole reason it exists: the
 * ticker strip it sits above is 34px of scrolling text and can only host
 * controls shorter than itself.
 */
export const APP_HEADER_HEIGHT = 56;

/** Content pane cap — beyond this the pane centers rather than stretching. */
export const CONTENT_MAX_WIDTH = 1440;

/** Sticky secondary column on Home (wallet, primary CTA, trust). */
export const RIGHT_RAIL_WIDTH = 320;

/** Sticky filter column on Catalog. */
export const FILTER_RAIL_WIDTH = 240;

/** Narrow reading column for single-flow screens (transactions, account). */
export const READING_MAX_WIDTH = 880;

/** Live ticker strip height, used to offset sticky headers beneath it. */
export const TICKER_HEIGHT = 34;

/**
 * Where a page's own sticky column has to start on `md` and up, so it clears
 * the chrome above it — the header and the ticker strip, plus a gutter.
 *
 * Derived rather than written down: the rail on Home used to carry a literal 88
 * that was tuned against the ticker alone, and adding the header above it would
 * have quietly slid the rail underneath.
 */
export const CONTENT_STICKY_TOP = APP_HEADER_HEIGHT + TICKER_HEIGHT + 16;

// ----------------------------------------------------------------------

/**
 * Horizontal page gutter, in MUI spacing units (×8px).
 * Replaces the literal '16px'/'18px' paddings the screens used to hard-code.
 */
export const gutter = { xs: 2, sm: 2.5, md: 3.5, lg: 5 } as const;

/** Vertical rhythm between page sections. */
export const sectionGap = { xs: 2, md: 3, lg: 4 } as const;

// ----------------------------------------------------------------------

/** Dense card grid — vault and catalog tiles. */
export const cardGridColumns = {
  xs: 'repeat(2, 1fr)',
  sm: 'repeat(3, 1fr)',
  md: 'repeat(4, 1fr)',
  lg: 'repeat(5, 1fr)',
} as const;

// Home no longer tiles packs. The shop runs one to three boxes, and a grid
// sized for a catalogue left most of the column empty, so each pack now gets a
// full-width row instead (`sections/home/pack-shelf-card.tsx`).

/** Live feed event cards — wider tiles, reads as a stream not a grid. */
export const feedGridColumns = {
  xs: '1fr',
  md: 'repeat(2, 1fr)',
  lg: 'repeat(3, 1fr)',
} as const;

/** Compact card picker inside the delivery flow. */
export const pickerGridColumns = {
  xs: 'repeat(3, 1fr)',
  md: 'repeat(4, 1fr)',
  lg: 'repeat(6, 1fr)',
} as const;

/** Gap between grid tiles, in MUI spacing units. */
export const gridGap = { xs: 1.5, md: 2, lg: 2.5 } as const;
