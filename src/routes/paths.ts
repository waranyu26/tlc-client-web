// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
};

// ----------------------------------------------------------------------

export const paths = {
  // Onboarding / marketing landing (shown to guests)
  onboarding: '/',
  // Authenticated home
  home: '/home',
  // Catalog & discovery
  catalog: '/catalog',
  card: (id: string) => `/catalog/card/${id}`,
  pack: (id: string) => `/pack/${id}`,
  // Gacha — always scoped to a pack; there is no global pull.
  pull: (id: string) => `/pack/${id}/pull`,
  // Collection
  vault: '/vault',
  // Wallet & money
  wallet: '/wallet',
  transactions: '/wallet/transactions',
  topupReturn: '/wallet/topup/return',
  // Live feed
  feed: '/feed',
  // Delivery
  delivery: '/delivery',
  addresses: '/delivery/addresses',
  // Account
  account: '/account',
  // AUTH
  auth: {
    signIn: `${ROOTS.AUTH}/sign-in`,
    signUp: `${ROOTS.AUTH}/sign-up`,
    callback: `${ROOTS.AUTH}/callback`,
    // --- compat: consumed only by throwaway boilerplate; removed in cleanup ---
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
  },
  // --- compat: consumed only by throwaway boilerplate; removed in cleanup ---
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  dashboard: {
    root: '/home',
    two: '/home',
    three: '/home',
    group: { root: '/home', five: '/home', six: '/home' },
  },
};
