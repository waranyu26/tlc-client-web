import type { Features } from 'src/api/features.api';
import type { IconifyName } from 'src/components/iconify';

import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import { useFeatures } from 'src/api/features.api';

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
  /** Hidden while this operator switch is off. */
  feature?: keyof Features;
};

/**
 * Primary destinations — the mobile tabs. Four always, plus Store while the
 * operator has it switched on (see usePrimaryNavItems), so the bar is five tabs
 * when the store is open and four when it is not.
 */
export const PRIMARY_NAV_ITEMS: NavItem[] = [
  {
    key: 'home',
    href: paths.home,
    icon: 'solar:home-smile-linear',
    fallbackLabel: 'Home',
  },
  {
    key: 'store',
    href: paths.store,
    icon: 'solar:shop-linear',
    fallbackLabel: 'Store',
    feature: 'store',
  },
  {
    key: 'vault',
    href: paths.vault,
    icon: 'solar:lock-keyhole-minimalistic-linear',
    fallbackLabel: 'Vault',
  },
  {
    key: 'wallet',
    href: paths.wallet,
    icon: 'solar:card-linear',
    fallbackLabel: 'Wallet',
  },
  {
    key: 'live',
    href: paths.feed,
    icon: 'solar:soundwave-linear',
    fallbackLabel: 'Live',
  },
];

/**
 * Secondary destinations. These routes exist but had no nav entry at all while
 * the app was capped to four mobile tabs — the sidebar and the mobile drawer
 * have room for them.
 */
export const SECONDARY_NAV_ITEMS: NavItem[] = [
  {
    key: 'delivery',
    href: paths.delivery,
    icon: 'solar:box-linear',
    fallbackLabel: 'Delivery',
  },
  {
    key: 'account',
    href: paths.account,
    icon: 'solar:user-circle-linear',
    fallbackLabel: 'Account',
  },
];

/**
 * The primary items the operator has not switched off.
 *
 * Read by the bottom bar, the sidebar and the drawer alike, so a switched-off
 * Store disappears from all three at once. Home, Vault, Wallet and Live are
 * never behind a switch.
 */
export function usePrimaryNavItems(): NavItem[] {
  const { features } = useFeatures();

  return useMemo(
    () => PRIMARY_NAV_ITEMS.filter((item) => !item.feature || features[item.feature]),
    [features]
  );
}

export const ACTIVE_COLOR = '#E7CE92';
export const INACTIVE_COLOR = '#5A5550';
