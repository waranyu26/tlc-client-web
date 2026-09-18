import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { typeScale } from 'src/theme/type-scale';
import { useWalletBalance } from 'src/api/wallet.api';
import { primaryFont } from 'src/theme/core/typography';

import { Iconify } from 'src/components/iconify';
import {
  ThbAmount,
  GhostButton,
  MusicToggle,
  PrimaryButton,
  LanguageToggle,
} from 'src/components/vault';

import { useAuthContext } from 'src/auth/hooks';

import { ACTIVE_COLOR, INACTIVE_COLOR } from './nav-items';
import { APP_HEADER_HEIGHT, AUTH_CLUSTER_MIN_WIDTH } from './layout-config';

// ----------------------------------------------------------------------
// Desktop chrome, `md` and up. The phone's equivalent is MobileTopBar.
//
// This bar exists because the site is browsable signed out and the way in has
// to be visible from the first screen. The left sidebar is the wrong home for
// it — it reads as navigation, and "Sign up" is not a destination — so the
// session cluster sits top-right, which is where a visitor looks for it.
//
// Language and music moved up here from the ticker strip. The strip is 34px of
// scrolling text and could only ever host things shorter than itself; now that
// there is a real header above it, keeping two rows of controls would have put
// two language switches on one screen.
// ----------------------------------------------------------------------

/** Digits read as numerals, not a title — same treatment as the sidebar's balance. */
const BALANCE_AMOUNT_SX = {
  fontFamily: primaryFont,
  fontWeight: 700,
  fontSize: '15px',
  lineHeight: 1.2,
  color: ACTIVE_COLOR,
};

function SessionCluster() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { authenticated, loading } = useAuthContext();

  const balanceQuery = useWalletBalance();

  // Nothing at all until the session is known. The alternative is rendering
  // "Sign in" for the moment it takes to check and then swapping it for the
  // balance, which tells a returning customer they are signed out.
  if (loading) {
    return null;
  }

  if (!authenticated) {
    // Carrying the current path through means a guest who signs in from a pack
    // page comes back to that pack, not to the shelf.
    const returnTo = `?${new URLSearchParams({ returnTo: pathname }).toString()}`;

    return (
      <>
        <GhostButton
          component={RouterLink}
          href={`${paths.auth.signIn}${returnTo}`}
          sx={{ py: '7px', px: 2, fontSize: '13px' }}
        >
          {t('actions.signIn', { defaultValue: 'Sign in' })}
        </GhostButton>
        <PrimaryButton
          component={RouterLink}
          href={`${paths.auth.signUp}${returnTo}`}
          sx={{ py: '8px', px: 2, fontSize: '13px', boxShadow: 'none' }}
        >
          {t('actions.signUp', { defaultValue: 'Sign up' })}
        </PrimaryButton>
      </>
    );
  }

  return (
    <>
      {/* At `lg` the sidebar already carries the balance — don't say it twice. */}
      <Box
        sx={{
          display: { md: 'flex', lg: 'none' },
          alignItems: 'baseline',
          gap: 0.75,
          px: 1.5,
          py: 0.75,
          borderRadius: '999px',
          border: '1px solid rgba(231,206,146,0.16)',
          backgroundColor: '#17161B',
        }}
      >
        <Typography sx={{ ...typeScale.micro, color: '#9A9285' }}>
          {t('nav.balance', { defaultValue: 'Balance' })}
        </Typography>
        {balanceQuery.isPending ? (
          <Typography sx={{ ...BALANCE_AMOUNT_SX, color: '#4A4844' }}>—</Typography>
        ) : (
          <ThbAmount satang={balanceQuery.data?.balance_satang ?? 0} sx={BALANCE_AMOUNT_SX} />
        )}
      </Box>

      <Box
        component={NavLink}
        to={paths.account}
        title={t('nav.account', { defaultValue: 'Account' })}
        aria-label={t('nav.account', { defaultValue: 'Account' })}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: '999px',
          border: '1px solid rgba(231,206,146,0.16)',
          color: INACTIVE_COLOR,
          textDecoration: 'none',
          transition: (theme) => theme.transitions.create(['color', 'border-color']),
          '&:hover': { color: '#F4ECDD', borderColor: 'rgba(231,206,146,0.32)' },
          '&.active': { color: ACTIVE_COLOR, borderColor: 'rgba(231,206,146,0.4)' },
        }}
      >
        <Iconify icon="solar:user-circle-linear" width={21} sx={{ color: 'inherit' }} />
      </Box>
    </>
  );
}

// ----------------------------------------------------------------------

export function AppHeader() {
  return (
    <Box
      component="header"
      sx={{
        display: { xs: 'none', md: 'flex' },
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 1,
        height: APP_HEADER_HEIGHT,
        px: { md: 2, lg: 3 },
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(13,13,16,0.92)',
        borderBottom: '1px solid rgba(231,206,146,0.09)',
      }}
    >
      <LanguageToggle />
      <MusicToggle size="small" />

      {/* Held open across the session check so the toggles beside it don't slide. */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1,
          ml: 1,
          minWidth: AUTH_CLUSTER_MIN_WIDTH,
        }}
      >
        <SessionCluster />
      </Box>
    </Box>
  );
}

export default AppHeader;
