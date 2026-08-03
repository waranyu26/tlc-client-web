import type { TypographyProps } from '@mui/material/Typography';

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

export type ThbAmountProps = Omit<TypographyProps, 'children'> & {
  satang: number;
  signed?: boolean;
  tone?: ThbAmountTone;
  /** Hero variant for the wallet balance: Cormorant 48px gold. */
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

  return (
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
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {label}
    </Typography>
  );
}

export default ThbAmount;
