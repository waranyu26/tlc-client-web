import type { TypographyProps } from '@mui/material/Typography';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { formatThb, formatThbSigned } from 'src/utils/format-currency';

import { typeScale } from 'src/theme/type-scale';

// ----------------------------------------------------------------------

export type ThbAmountTone = 'default' | 'success' | 'error';

const TONE_COLOR: Record<ThbAmountTone, string | undefined> = {
  default: undefined,
  success: '#6FBF8E',
  error: '#C9605B',
};

// ----------------------------------------------------------------------
// Hero sizing is container-relative, not viewport-relative.
//
// typeScale.heroAmount steps its size off the *viewport* (44/56/64px), which is
// right for a full-width card and wrong everywhere the balance actually lives:
// on desktop it sits in a 320px sticky rail (RIGHT_RAIL_WIDTH), so the number
// grew to 64px inside a box that never grew past 284px of content width and ran
// straight out of the card. A seven-figure balance did it on a phone too.
//
// So the size is capped at the design size and otherwise derived from the space
// the number actually has, divided by how many characters it has to fit.
//
// HERO_CHAR_WIDTH_EM converts "characters" into ems of advance width. It is an
// estimate rather than a measurement, because `฿` is not in Jost: the browser
// substitutes a Thai-capable face for that one glyph at an advance we do not
// control. It is calibrated from the reported overflow — "฿199,828" at 64px
// just past 284px of content width puts the average advance around 0.6em — with
// headroom on top, since erring small costs a few points of type on a large
// balance while erring large puts the customer's money through the side of the
// card. Worth trimming towards 0.62 if the number ever looks timid on desktop.
//
// The floor only engages past ~15 characters — beyond ฿99,999,999,999 — at
// which point a legible number matters more than a fitted one.
// ----------------------------------------------------------------------

const HERO_MAX_PX = { xs: 44, md: 56, lg: 64 } as const;
const HERO_MIN_PX = 24;
const HERO_CHAR_WIDTH_EM = 0.68;

function heroFontSize(charCount: number) {
  const fit = `calc(100cqi / ${charCount} / ${HERO_CHAR_WIDTH_EM})`;
  const clampAt = (max: number) => `clamp(${HERO_MIN_PX}px, ${fit}, ${max}px)`;

  return {
    xs: clampAt(HERO_MAX_PX.xs),
    md: clampAt(HERO_MAX_PX.md),
    lg: clampAt(HERO_MAX_PX.lg),
  };
}

export type ThbAmountProps = Omit<TypographyProps, 'children'> & {
  satang: number;
  signed?: boolean;
  tone?: ThbAmountTone;
  /** Hero variant for the wallet balance: the largest number on any screen. */
  hero?: boolean;
  decimals?: boolean;
};

export function ThbAmount({
  satang,
  signed = false,
  tone = 'default',
  hero = false,
  decimals,
  sx,
  ...other
}: ThbAmountProps) {
  const label = signed ? formatThbSigned(satang, { decimals }) : formatThb(satang, { decimals });
  const color = TONE_COLOR[tone];

  const amount = (
    <Typography
      component="span"
      variant={hero ? 'h2' : undefined}
      sx={[
        {
          color,
          fontVariantNumeric: 'tabular-nums',
          ...(hero && {
            ...typeScale.heroAmount,
            color: color ?? '#E7CE92',
            fontSize: heroFontSize(label.length),
            // A balance must never break across lines mid-number: "฿1,99"
            // above "9,828" is not a smaller number, it is a different one.
            whiteSpace: 'nowrap',
            maxWidth: '100%',
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {label}
    </Typography>
  );

  if (!hero) return amount;

  // The container the `cqi` above is measured against. Declared here rather
  // than left to each caller so a new balance readout cannot be added without
  // it — without a container ancestor, `cqi` silently falls back to the
  // viewport and the bug returns.
  return <Box sx={{ containerType: 'inline-size' }}>{amount}</Box>;
}

export default ThbAmount;
