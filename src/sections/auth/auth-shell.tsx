import type { ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { typeScale } from 'src/theme/type-scale';

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
  const { t } = useTranslation('onboarding');

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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, alignItems: 'flex-start' }}>
          <Logo variant="horizontal" sx={{ width: 260, height: 44 }} />
          <Typography sx={{ ...typeScale.body, color: '#9A9285', maxWidth: 380 }}>
            {t('tagline', { ns: 'common' })}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
          <TrustBadge />
          <Typography sx={{ ...typeScale.label, color: '#4A4844', maxWidth: 380 }}>
            {t('trust.footer', { ns: 'common' })}
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
