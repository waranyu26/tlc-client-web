import type { ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { typeScale } from 'src/theme/type-scale';
import { primaryFont } from 'src/theme/core/typography';

import { Logo } from 'src/components/logo';
import { TrustBadge } from 'src/components/vault';

// ----------------------------------------------------------------------
// Guest frame. Desktop is a split screen — a brand panel carrying the lockup,
// tagline and trust signals on the left, the form on the right. Below `md` the
// brand panel drops away (each view renders its own compact lockup instead) and
// the form takes the full column.
// ----------------------------------------------------------------------

export type AuthShellProps = {
  children: ReactNode;
  /** Content pinned above the form panel, e.g. the live ticker. */
  slotTop?: ReactNode;
};

export function AuthShell({ children, slotTop }: AuthShellProps) {
  const { t, i18n } = useTranslation('common');
  // The display serif has no Thai glyphs — Thai falls back to an arbitrary system
  // font at headline size. Thai gets the app's Thai body face, a step smaller.
  const isThai = i18n.language?.startsWith('th');

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Brand panel — desktop only */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 4,
          flex: { md: '0 0 46%' },
          px: { md: 6, lg: 10 },
          py: 8,
          borderRight: '1px solid rgba(231,206,146,0.16)',
          backgroundImage:
            'radial-gradient(ellipse at 30% 20%, rgba(231,206,146,0.10) 0%, transparent 60%)',
        }}
      >
        {/* Centred: the logo is a symmetric illustration, so it anchors the
            column better than a left-aligned wordmark would. */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 3,
            // lets the tagline size itself to the panel width (cqi units)
            containerType: 'inline-size',
          }}
        >
          <Logo
            variant="horizontal"
            sx={{
              // height follows the artwork's ~1.45:1 ratio
              width: { md: 320, lg: 440, xl: 520 },
              height: { md: 221, lg: 304, xl: 359 },
              maxWidth: '100%',
            }}
          />
          {/* Always one line: the size tracks the panel width, capped at the
              design size, so it shrinks before it would ever wrap. */}
          <Typography
            sx={{
              ...(isThai
                ? { fontFamily: primaryFont, fontWeight: 500, lineHeight: 1.5 }
                : typeScale.sectionHeading),
              fontSize: isThai ? 'min(26px, 5.6cqi)' : 'min(38px, 7.4cqi)',
              whiteSpace: 'nowrap',
              color: '#F4ECDD',
            }}
          >
            {t('tagline')}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 1.5,
          }}
        >
          <TrustBadge
            sx={{
              // Icon above the copy: balanced text doesn't shrink its box, so a
              // side-by-side icon would sit stranded at the column's left edge.
              maxWidth: 440,
              flexDirection: 'column',
              gap: 1,
              '& svg': { width: 22, height: 22 },
              '& .MuiTypography-root': {
                fontSize: { md: '13px', lg: '14px' },
                textWrap: 'balance',
              },
            }}
          />
          <Typography
            sx={{
              ...typeScale.body,
              fontSize: { md: '13px', lg: '14px' },
              color: '#7A7468',
              textWrap: 'balance',
            }}
          >
            {t('trust.footer')}
          </Typography>
        </Box>
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {slotTop}

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%',
            maxWidth: { xs: '100%', sm: 460 },
            mx: 'auto',
            px: { xs: 3, sm: 4 },
            py: { xs: 5, md: 8 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default AuthShell;
