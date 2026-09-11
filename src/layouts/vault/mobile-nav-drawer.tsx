import type { NavItem } from './nav-items';

import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { typeScale } from 'src/theme/type-scale';
import { useWalletBalance } from 'src/api/wallet.api';
import { primaryFont } from 'src/theme/core/typography';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { ThbAmount } from 'src/components/vault';

import { SIDEBAR_WIDTH } from './layout-config';
import { ACTIVE_COLOR, INACTIVE_COLOR, PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from './nav-items';

// ----------------------------------------------------------------------
// The mobile drawer, opened from the hamburger in the top bar.
//
// This exists because Delivery and Account were unreachable on a phone. Both
// are SECONDARY_NAV_ITEMS, which only the desktop sidebar rendered, and the
// BottomNav is capped at the four primary tabs — so on mobile those two routes
// could only be reached by typing the URL.
//
// The drawer carries the *whole* nav rather than only the two that were
// missing. A menu that lists some destinations invites the reader to conclude
// it lists all of them, and one holding only the leftovers would read as a
// scrap heap rather than a map.
//
// Labels are always visible here. The sidebar hides them on its compact rail
// because the rail is 88px wide; a drawer has the room, and an icon-only menu
// behind a hamburger would be two guesses deep.
// ----------------------------------------------------------------------

const BALANCE_AMOUNT_SX = {
  fontFamily: primaryFont,
  fontWeight: 700,
  lineHeight: 1.2,
  fontSize: '20px',
};

type DrawerNavRowProps = {
  item: NavItem;
  onNavigate: () => void;
};

function DrawerNavRow({ item, onNavigate }: DrawerNavRowProps) {
  const { t } = useTranslation();
  const label = t(`nav.${item.key}`, { defaultValue: item.fallbackLabel });

  return (
    <Box
      component={NavLink}
      to={item.href}
      end={item.href === paths.home}
      // Closing on tap matters more than it looks: react-router keeps the
      // drawer mounted across the navigation, so without this the user lands on
      // the new page with the menu still covering it.
      onClick={onNavigate}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.75,
        py: 1.35,
        borderRadius: '12px',
        textDecoration: 'none',
        color: INACTIVE_COLOR,
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
      <Typography sx={{ ...typeScale.body, fontWeight: 500, color: 'inherit' }}>{label}</Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------

export type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  const { t } = useTranslation();
  const balanceQuery = useWalletBalance();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="left"
      slotProps={{
        paper: {
          sx: {
            width: SIDEBAR_WIDTH,
            maxWidth: '84vw',
            px: 2,
            py: 3,
            gap: 3,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#0D0D10',
            borderRight: '1px solid rgba(231,206,146,0.16)',
            backgroundImage: 'none',
          },
        },
      }}
    >
      <Logo href={paths.home} variant="horizontal" sx={{ ml: 1, width: 190, height: 32 }} />

      <Box component="nav" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {PRIMARY_NAV_ITEMS.map((item) => (
          <DrawerNavRow key={item.key} item={item} onNavigate={onClose} />
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography sx={{ ...typeScale.micro, color: INACTIVE_COLOR, px: 1.75, mb: 0.5 }}>
          {t('nav.more', { defaultValue: 'More' })}
        </Typography>
        {SECONDARY_NAV_ITEMS.map((item) => (
          <DrawerNavRow key={item.key} item={item} onNavigate={onClose} />
        ))}
      </Box>

      <Box
        sx={{
          mt: 'auto',
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
    </Drawer>
  );
}

export default MobileNavDrawer;
