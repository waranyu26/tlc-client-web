import { useState } from 'react';
import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { MusicToggle, GhostButton, PrimaryButton, LanguageToggle } from 'src/components/vault';

import { useAuthContext } from 'src/auth/hooks';

import { MobileNavDrawer } from './mobile-nav-drawer';
import { MOBILE_TOP_BAR_HEIGHT } from './layout-config';
import { ACTIVE_COLOR, INACTIVE_COLOR } from './nav-items';

// ----------------------------------------------------------------------
// Mobile chrome. Below `md` only — above it AppHeader carries the same session
// controls and the sidebar carries the nav.
//
// Until the top bar existed the phone had no header of any kind: just the
// ticker, the content and the bottom tabs. That left nowhere to put anything
// that is not a destination, which is why Delivery and Account had no route in
// and why language and music had no home outside the Account page.
//
// Hamburger on the left, because that is where a back button would be and the
// thumb expects a way *out* of the current screen there. Everything that is not
// navigation — language, music, and the way into an account — sits on the
// right, where it does not compete with it.
// ----------------------------------------------------------------------

/** Tight enough that both fit beside the toggles on a 360px phone. */
const AUTH_BUTTON_SX = {
  flexShrink: 0,
  px: 1.25,
  py: 0.5,
  fontSize: '12px',
  whiteSpace: 'nowrap',
} as const;

function SessionCluster() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { authenticated, loading } = useAuthContext();

  // Nothing until the session is known — see AppHeader for why.
  if (loading) {
    return null;
  }

  if (!authenticated) {
    const returnTo = `?${new URLSearchParams({ returnTo: pathname }).toString()}`;

    return (
      <>
        <GhostButton
          component={RouterLink}
          href={`${paths.auth.signIn}${returnTo}`}
          sx={AUTH_BUTTON_SX}
        >
          {t('actions.signIn', { defaultValue: 'Sign in' })}
        </GhostButton>
        <PrimaryButton
          component={RouterLink}
          href={`${paths.auth.signUp}${returnTo}`}
          sx={{ ...AUTH_BUTTON_SX, boxShadow: 'none' }}
        >
          {t('actions.signUp', { defaultValue: 'Sign up' })}
        </PrimaryButton>
      </>
    );
  }

  return (
    <Box
      component={NavLink}
      to={paths.account}
      aria-label={t('nav.account', { defaultValue: 'Account' })}
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        p: 0.75,
        color: INACTIVE_COLOR,
        textDecoration: 'none',
        '&.active': { color: ACTIVE_COLOR },
      }}
    >
      <Iconify icon="solar:user-circle-linear" width={24} sx={{ color: 'inherit' }} />
    </Box>
  );
}

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
          gap: 0.5,
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
          sx={{ flexShrink: 0, color: '#F4ECDD' }}
        >
          <Iconify icon="solar:hamburger-menu-linear" width={22} />
        </IconButton>

        {/* First to go when the session cluster is two buttons wide: the mark is
            the one thing here that is also everywhere else on the screen. */}
        <Logo
          href={paths.home}
          sx={{ display: { xs: 'none', sm: 'flex' }, width: 30, height: 30, flexShrink: 0 }}
        />

        <Box sx={{ flexGrow: 1, minWidth: 0 }} />

        <LanguageToggle sx={{ flexShrink: 0 }} />
        <MusicToggle size="small" sx={{ flexShrink: 0 }} />

        <SessionCluster />
      </Box>

      <MobileNavDrawer open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
}

export default MobileTopBar;
