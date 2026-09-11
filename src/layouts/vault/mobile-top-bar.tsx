
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { MusicToggle, LanguageToggle } from 'src/components/vault';

import { MobileNavDrawer } from './mobile-nav-drawer';
import { MOBILE_TOP_BAR_HEIGHT } from './layout-config';

// ----------------------------------------------------------------------
// Mobile chrome. Below `md` only — above it the sidebar carries the nav and
// there is no top bar at all.
//
// Until now the phone had no header of any kind: just the ticker, the content
// and the bottom tabs. That left nowhere to put anything that is not a
// destination, which is why Delivery and Account had no route in and why
// language and music had no home outside the Account page.
//
// Hamburger on the left, because that is where a back button would be and the
// thumb expects a way *out* of the current screen there. Settings on the right,
// where they do not compete with navigation.
// ----------------------------------------------------------------------

export function MobileTopBar() {
  const { t } = useTranslation();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      <Box
        component="header"
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'sticky',
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          alignItems: 'center',
          gap: 1,
          height: MOBILE_TOP_BAR_HEIGHT,
          px: 1,
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(13,13,16,0.92)',
          borderBottom: '1px solid rgba(231,206,146,0.09)',
        }}
      >
        <IconButton
          onClick={() => setNavOpen(true)}
          aria-label={t('nav.menu', { defaultValue: 'Open menu' })}
          sx={{ color: '#F4ECDD' }}
        >
          <Iconify icon="solar:hamburger-menu-linear" width={22} />
        </IconButton>

        <Logo href={paths.home} sx={{ width: 30, height: 30 }} />

        <Box sx={{ flexGrow: 1 }} />

        <LanguageToggle />
        <MusicToggle />
      </Box>

      <MobileNavDrawer open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
}

export default MobileTopBar;
