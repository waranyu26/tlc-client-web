import type { IconifyName } from 'src/components/iconify';

import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------
// Single source of navigation truth, read by both the desktop SidebarNav and
// the mobile BottomNav so the two can never drift.
// ----------------------------------------------------------------------

export type NavItem = {
  key: string;
  href: string;
  icon: IconifyName;
  /** Used when the `nav.<key>` translation is missing. */
  fallbackLabel: string;
};

/** Primary destinations — these are the four mobile tabs. */
export const PRIMARY_NAV_ITEMS: NavItem[] = [
  {
    key: 'home',
    href: paths.home,
    icon: 'solar:home-smile-linear' as IconifyName,
    fallbackLabel: 'Home',
  },
  {
    key: 'vault',
    href: paths.vault,
    icon: 'solar:lock-keyhole-minimalistic-linear' as IconifyName,
    fallbackLabel: 'Vault',
  },
  {
    key: 'wallet',
    href: paths.wallet,
    icon: 'solar:card-linear' as IconifyName,
    fallbackLabel: 'Wallet',
  },
  {
    key: 'live',
    href: paths.feed,
    icon: 'solar:soundwave-linear' as IconifyName,
    fallbackLabel: 'Live',
  },
];

/**
 * Secondary destinations. These routes exist but had no nav entry at all while
 * the app was capped to four mobile tabs — the sidebar has room for them.
 */
export const SECONDARY_NAV_ITEMS: NavItem[] = [
  {
    key: 'catalog',
    href: paths.catalog,
    icon: 'solar:widget-4-linear' as IconifyName,
    fallbackLabel: 'Catalog',
  },
  {
    key: 'delivery',
    href: paths.delivery,
    icon: 'solar:box-linear' as IconifyName,
    fallbackLabel: 'Delivery',
  },
  {
    key: 'account',
    href: paths.account,
    icon: 'solar:user-circle-linear' as IconifyName,
    fallbackLabel: 'Account',
  },
];

export const ACTIVE_COLOR = '#E7CE92';
export const INACTIVE_COLOR = '#5A5550';
