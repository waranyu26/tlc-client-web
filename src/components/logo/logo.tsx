import type { LinkProps } from '@mui/material/Link';

import { mergeClasses } from 'minimal-shared/utils';

import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------
// Brand logo — VIP Card & Toys. One artwork (the whole logo, never cropped) on a
// transparent background, so it sits on the light and dark themes alike.
//   mark       -> small slots (top bars, compact rail, splash)
//   horizontal -> standard size
//   stacked    -> larger size; kept so existing call sites work
//
// The variants differ only in their default box. The artwork is drawn with
// `contain`, so any box keeps its proportions — but a box shaped like the logo
// (~1.45 : 1) lets it fill the space instead of floating small inside a square.
// ----------------------------------------------------------------------

export type LogoVariant = 'mark' | 'horizontal' | 'stacked';

/** Full logo aspect ratio (artwork is 800 x 553). */
const FULL_RATIO = 800 / 553;

const VARIANTS = {
  mark: { width: Math.round(32 * FULL_RATIO), height: 32 },
  horizontal: { width: Math.round(56 * FULL_RATIO), height: 56 },
  stacked: { width: Math.round(96 * FULL_RATIO), height: 96 },
} as const satisfies Record<LogoVariant, unknown>;

// ----------------------------------------------------------------------

/** `variant` is omitted from LinkProps — here it selects the lockup, not a typography variant. */
export type LogoProps = Omit<LinkProps, 'variant'> & {
  variant?: LogoVariant;
  disabled?: boolean;
};

export function Logo({
  sx,
  disabled,
  className,
  href = '/',
  variant = 'mark',
  ...other
}: LogoProps) {
  const { width, height } = VARIANTS[variant];

  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="VIP Card & Toys"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width,
          height,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundImage: `url(${CONFIG.assetsDir}/logo/logo-full.webp)`,
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    />
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
