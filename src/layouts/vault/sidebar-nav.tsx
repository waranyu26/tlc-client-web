import type { NavItem } from './nav-items';

import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { typeScale } from 'src/theme/type-scale';
import { useWalletBalance } from 'src/api/wallet.api';
import { primaryFont } from 'src/theme/core/typography';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { ThbAmount, PrimaryButton } from 'src/components/vault';

import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_COMPACT } from './layout-config';
import { ACTIVE_COLOR, INACTIVE_COLOR, PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from './nav-items';

// ----------------------------------------------------------------------
// Persistent desktop navigation. Labelled rail at `lg`, icon-only rail at `md`,
// hidden below that — BottomNav takes over.
// ----------------------------------------------------------------------

// Digits read as numerals, not a title, so use the same sans-serif treatment
// as the pack price (ThbAmount's own default) rather than typeScale.cardTitle's
// Cormorant Garamond — serif numerals looked out of place in this compact rail.
const BALANCE_AMOUNT_SX = {
  fontFamily: primaryFont,
  fontWeight: 700,
  lineHeight: 1.2,
  fontSize: '20px',
};

function NavRow({ item }: { item: NavItem }) {
  const { t } = useTranslation();
  const label = t(`nav.${item.key}`, { defaultValue: item.fallbackLabel });

  return (
    <Box
      component={NavLink}
      to={item.href}
      end={item.href === paths.home}
      title={label}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        justifyContent: { md: 'center', lg: 'flex-start' },
        px: { md: 0, lg: 1.75 },
        py: 1.25,
        borderRadius: '12px',
        textDecoration: 'none',
        color: INACTIVE_COLOR,
        transition: (theme) => theme.transitions.create(['color', 'background-color']),
        '&:hover': { color: '#F4ECDD', backgroundColor: 'rgba(231,206,146,0.05)' },
        '&.active': {
          color: ACTIVE_COLOR,
          backgroundColor: 'rgba(231,206,146,0.08)',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: '22%',
            bottom: '22%',
            width: '2px',
            borderRadius: '999px',
            backgroundColor: ACTIVE_COLOR,
          },
        },
      }}
    >
      <Iconify icon={item.icon} width={22} sx={{ color: 'inherit', flexShrink: 0 }} />
      <Typography
        sx={{
          ...typeScale.body,
          fontWeight: 500,
          color: 'inherit',
          display: { md: 'none', lg: 'block' },
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function SidebarNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const balanceQuery = useWalletBalance();

  return (
    <Box
      component="aside"
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        flexShrink: 0,
        width: { md: SIDEBAR_WIDTH_COMPACT, lg: SIDEBAR_WIDTH },
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        height: '100vh',
        px: { md: 1.5, lg: 2 },
        py: 3,
        gap: 3,
        bgcolor: '#0D0D10',
        borderRight: '1px solid rgba(231,206,146,0.16)',
      }}
    >
      {/* Brand lockup — mark only on the compact rail */}
      <Logo
        href={paths.home}
        sx={{ display: { md: 'flex', lg: 'none' }, alignSelf: 'center', width: 36, height: 36 }}
      />
      <Logo
        href={paths.home}
        variant="horizontal"
        sx={{ display: { md: 'none', lg: 'flex' }, ml: 1, width: 200, height: 34 }}
      />

      <Box component="nav" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {PRIMARY_NAV_ITEMS.map((item) => (
          <NavRow key={item.key} item={item} />
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography
          sx={{
            ...typeScale.micro,
            color: INACTIVE_COLOR,
            px: 1.75,
            mb: 0.5,
            display: { md: 'none', lg: 'block' },
          }}
        >
          {t('nav.more', { defaultValue: 'More' })}
        </Typography>
        <Box
          sx={{
            height: '1px',
            mx: 1,
            mb: 0.5,
            backgroundColor: 'rgba(231,206,146,0.08)',
            display: { md: 'block', lg: 'none' },
          }}
        />
        {SECONDARY_NAV_ITEMS.map((item) => (
          <NavRow key={item.key} item={item} />
        ))}
      </Box>

      {/* Balance + primary action stay reachable without scrolling */}
      <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box
          sx={{
            display: { md: 'none', lg: 'block' },
            px: 1.75,
            py: 1.5,
            borderRadius: '12px',
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
            <ThbAmount
              satang={balanceQuery.data?.balance_satang ?? 0}
              sx={{ ...BALANCE_AMOUNT_SX, color: ACTIVE_COLOR, display: 'block' }}
            />
          )}
        </Box>

        {/* A pull always comes from a pack, so this opens the pack list rather
            than pulling directly. */}
        <PrimaryButton
          fullWidth
          onClick={() => navigate(paths.home)}
          title={t('nav.pull', { defaultValue: 'Choose a pack' })}
          sx={{ minWidth: 0, px: { md: 1, lg: 2.5 } }}
        >
          <Box component="span" sx={{ display: { md: 'none', lg: 'inline' } }}>
            {t('nav.pull', { defaultValue: 'Choose a pack' })}
          </Box>
          <Box component="span" sx={{ display: { md: 'inline-flex', lg: 'none' }, fontSize: 20 }}>
            ✦
          </Box>
        </PrimaryButton>
      </Box>
    </Box>
  );
}

export default SidebarNav;
