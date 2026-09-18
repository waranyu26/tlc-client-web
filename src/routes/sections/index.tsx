import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet, Navigate } from 'react-router';

import { AppShell } from 'src/layouts/vault';

import { SplashScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard/auth-guard';
import { GuestGuard } from 'src/auth/guard/guest-guard';

// ----------------------------------------------------------------------

const Page404 = lazy(() => import('src/pages/error/404'));

// Guest-only pages — an authenticated visitor is bounced off them.
const SignInPage = lazy(() => import('src/pages/auth/sign-in'));
const SignUpPage = lazy(() => import('src/pages/auth/sign-up'));
const AuthCallbackPage = lazy(() => import('src/pages/auth/callback'));

// Browsable without an account
const HomePage = lazy(() => import('src/pages/home'));
const PackPage = lazy(() => import('src/pages/pack'));
const FeedPage = lazy(() => import('src/pages/feed'));
const VerifyPage = lazy(() => import('src/pages/verify'));

// Account-bound pages
const PullPage = lazy(() => import('src/pages/pull'));
const VaultPage = lazy(() => import('src/pages/vault'));
const WalletPage = lazy(() => import('src/pages/wallet'));
const TransactionsPage = lazy(() => import('src/pages/transactions'));
const TopupReturnPage = lazy(() => import('src/pages/topup-return'));
const DeliveryPage = lazy(() => import('src/pages/delivery'));
const AddressesPage = lazy(() => import('src/pages/addresses'));
const AccountPage = lazy(() => import('src/pages/account'));

// ----------------------------------------------------------------------

export const routesSection: RouteObject[] = [
  // Guest — the sign-in pair, and nothing else.
  //
  // The onboarding splash that used to sit at `/` is gone: it existed only to
  // put a choice of sign-in methods in front of a visitor who had not seen the
  // shop yet, and the shop itself is a better argument than a splash screen.
  {
    element: (
      <GuestGuard>
        <Suspense fallback={<SplashScreen />}>
          <Outlet />
        </Suspense>
      </GuestGuard>
    ),
    children: [
      { path: '/auth/sign-in', element: <SignInPage /> },
      { path: '/auth/sign-up', element: <SignUpPage /> },
      { path: '/auth/callback/google', element: <AuthCallbackPage /> },
    ],
  },

  // Public storefront — the same shell as the rest of the app, no guard.
  //
  // Everything here reads from endpoints the service already serves
  // unauthenticated (`GET /v1/packs`, `/v1/packs/:id`, the rarity manifest and
  // the ticker stream), so a guest sees a real shelf rather than a teaser. What
  // the shell itself shows changes with the session, not what routes exist:
  // see `AppHeader`.
  {
    element: (
      <AppShell>
        <Suspense fallback={<SplashScreen />}>
          <Outlet />
        </Suspense>
      </AppShell>
    ),
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/pack/:id', element: <PackPage /> },
      { path: '/feed', element: <FeedPage /> },
    ],
  },

  // Account-bound — the money, the collection and anything that spends it.
  //
  // These are gated in the same shell, so a guest who taps Wallet in the nav
  // gets the sign-in page with `returnTo` set and lands back where they were
  // aiming, rather than on a dead end. Pulling lives here too: the commit
  // charges a wallet, so there is no guest pull to fall back to.
  {
    element: (
      <AuthGuard>
        <AppShell>
          <Suspense fallback={<SplashScreen />}>
            <Outlet />
          </Suspense>
        </AppShell>
      </AuthGuard>
    ),
    children: [
      { path: '/pack/:id/pull', element: <PullPage /> },
      { path: '/vault', element: <VaultPage /> },
      { path: '/wallet', element: <WalletPage /> },
      { path: '/wallet/transactions', element: <TransactionsPage /> },
      { path: '/wallet/topup/return', element: <TopupReturnPage /> },
      { path: '/delivery', element: <DeliveryPage /> },
      { path: '/delivery/addresses', element: <AddressesPage /> },
      { path: '/account', element: <AccountPage /> },
    ],
  },

  // Public — no shell, no guard.
  //
  // A fairness receipt that only its owner can open proves nothing to anyone
  // else. The whole value of this page is that a sceptic can be handed the link
  // and check the pull themselves, against a beacon they fetch from drand.
  {
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: [{ path: '/verify/:ticketId', element: <VerifyPage /> }],
  },

  // Home used to live at `/home`; keep old links and bookmarks working.
  { path: '/home', element: <Navigate to="/" replace /> },

  // No match
  { path: '*', element: <Page404 /> },
];
