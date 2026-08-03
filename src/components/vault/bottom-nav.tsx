import type { BoxProps } from '@mui/material/Box';

import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { ACTIVE_COLOR, INACTIVE_COLOR, PRIMARY_NAV_ITEMS } from 'src/layouts/vault/nav-items';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Mobile tab bar. Below `md` only — the desktop SidebarNav takes over above it.
// Items come from src/layouts/vault/nav-items.ts so the two navs can't drift.
// ----------------------------------------------------------------------

export function BottomNav({ sx, ...other }: BoxProps) {
  const { t } = useTranslation();

  return (
    <Box
      component="nav"
      sx={[
        {
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          zIndex: (theme) => theme.zIndex.appBar,
          display: { xs: 'flex', md: 'none' },
          alignItems: 'stretch',
          height: 'calc(54px + env(safe-area-inset-bottom))',
          paddingBottom: 'env(safe-area-inset-bottom)',
          bgcolor: '#0D0D10',
          borderTop: '1px solid rgba(231,206,146,0.09)',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {PRIMARY_NAV_ITEMS.map((item) => (
        <Box
          key={item.key}
          component={NavLink}
          to={item.href}
          end={item.href === paths.home}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            textDecoration: 'none',
            color: INACTIVE_COLOR,
            '&.active': {
              color: ACTIVE_COLOR,
            },
          }}
        >
          <Iconify icon={item.icon} width={22} sx={{ color: 'inherit' }} />
          <Typography
            sx={{
              fontSize: '10px',
              fontWeight: 500,
              lineHeight: 1,
              color: 'inherit',
            }}
          >
            {t(`nav.${item.key}`, { defaultValue: item.fallbackLabel })}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default BottomNav;
