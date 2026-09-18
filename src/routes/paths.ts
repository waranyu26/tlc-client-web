// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
};

// ----------------------------------------------------------------------

export const paths = {
  // The shop front, and the site's only landing page.
  //
  // Public on purpose: a guest arriving here browses the shelf, a pack's odds
  // and its rarity manifest before being asked for anything. The sign-in wall
  // used to sit in front of this, which meant the product could not be seen
  // without an account — the header's Sign in / Sign up pair replaces it.
  home: '/',
  // Catalog & discovery
  verify: (ticketId: string) => `/verify/${ticketId}`,
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
    // Provider-suffixed to match the redirect URI registered on the Google
    // OAuth client (Google matches redirect URIs exactly, so this string and
    // the console entry must stay identical), and to leave room for a second
    // provider without reusing one callback route for both.
    callback: `${ROOTS.AUTH}/callback/google`,
    // Reached from an emailed link, so all three are public: the recipient is
    // regularly in a different browser from the one that started the flow —
    // mail on a phone, a desktop client's preview pane — and a guard that
    // bounced them would break the one link that unblocks their account.
    verifyEmail: `${ROOTS.AUTH}/verify-email`,
    forgotPassword: `${ROOTS.AUTH}/forgot-password`,
    resetPassword: `${ROOTS.AUTH}/reset-password`,
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
    root: '/',
    two: '/',
    three: '/',
    group: { root: '/', five: '/', six: '/' },
  },
};
