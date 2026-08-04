import type { LinkProps } from '@mui/material/Link';

import { mergeClasses } from 'minimal-shared/utils';

import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------
// Brand logo. Three lockups, each with a light- and dark-theme artwork:
//   mark       -> the diamond mark alone
//   horizontal -> mark + wordmark + AUTHENTICATED VAULT, on one line
//   stacked    -> mark above the wordmark + Thai sub-lockup; for narrow,
//                 centred spaces where the horizontal lockup gets too small
//
// The exported PNGs carry a transparent safe-area margin around the artwork, so
// the background is scaled up to make the *visible* logo fill the box a layout
// reserves. Note the star inside the diamond is a knockout — whatever surface
// sits behind shows through it, so keep the logo on flat backgrounds.
// ----------------------------------------------------------------------

export type LogoVariant = 'mark' | 'horizontal' | 'stacked';

/**
 * Per-variant artwork geometry.
 *
 * `backgroundSize` scales the canvas up until the artwork inside it exactly fills the box.
 * `backgroundPosition` then pulls the overflow back to the right place: the safe area is not
 * symmetric, so `center` would clip one edge — each percentage is `nearPad / (nearPad + farPad)`,
 * which lands the artwork flush at any box size.
 */
const VARIANTS = {
  // artwork 338 inside a 496 canvas; pad 79 on every side
  mark: {
    file: 'logo-mark',
    width: 40,
    height: 40,
    backgroundSize: '146.7%',
    backgroundPosition: '50% 50%',
  },
  // artwork 1468 x 248 inside a 1656 x 432 canvas; pad L108 R81 T92 B93
  horizontal: {
    file: 'logo-primary',
    width: 213,
    height: 36,
    backgroundSize: 'auto 174.2%',
    backgroundPosition: '57.1% 49.7%',
  },
  // artwork 870 x 555 inside a 1048 x 736 canvas; pad L92 R86 T102 B79
  stacked: {
    file: 'logo-stacked',
    width: 138,
    height: 88,
    backgroundSize: 'auto 132.6%',
    backgroundPosition: '51.7% 56.4%',
  },
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
  const { file, width, height, backgroundSize, backgroundPosition } = VARIANTS[variant];

  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="Tokyo Lucky Card"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        (theme) => ({
          width,
          height,
          backgroundSize,
          backgroundPosition,
          backgroundRepeat: 'no-repeat',
          backgroundImage: `url(${CONFIG.assetsDir}/logo/${file}-light.png)`,
          ...theme.applyStyles('dark', {
            backgroundImage: `url(${CONFIG.assetsDir}/logo/${file}-dark.png)`,
          }),
          ...(disabled && { pointerEvents: 'none' }),
        }),
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
