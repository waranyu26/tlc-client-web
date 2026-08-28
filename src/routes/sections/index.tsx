import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { AppShell } from 'src/layouts/vault';

import { SplashScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard/auth-guard';
import { GuestGuard } from 'src/auth/guard/guest-guard';

// ----------------------------------------------------------------------

const Page404 = lazy(() => import('src/pages/error/404'));

// Guest pages
const OnboardingPage = lazy(() => import('src/pages/onboarding'));
const SignInPage = lazy(() => import('src/pages/auth/sign-in'));
const SignUpPage = lazy(() => import('src/pages/auth/sign-up'));
const AuthCallbackPage = lazy(() => import('src/pages/auth/callback'));

// Authenticated pages
const HomePage = lazy(() => import('src/pages/home'));
const PackPage = lazy(() => import('src/pages/pack'));
const PullPage = lazy(() => import('src/pages/pull'));
const VerifyPage = lazy(() => import('src/pages/verify'));
const VaultPage = lazy(() => import('src/pages/vault'));
const WalletPage = lazy(() => import('src/pages/wallet'));
const TransactionsPage = lazy(() => import('src/pages/transactions'));
const TopupReturnPage = lazy(() => import('src/pages/topup-return'));
const FeedPage = lazy(() => import('src/pages/feed'));
const DeliveryPage = lazy(() => import('src/pages/delivery'));
const AddressesPage = lazy(() => import('src/pages/addresses'));
const AccountPage = lazy(() => import('src/pages/account'));

// ----------------------------------------------------------------------

export const routesSection: RouteObject[] = [
  // Guest
  {
    element: (
      <GuestGuard>
        <Suspense fallback={<SplashScreen />}>
          <Outlet />
        </Suspense>
      </GuestGuard>
    ),
    children: [
      { path: '/', element: <OnboardingPage /> },
      { path: '/auth/sign-in', element: <SignInPage /> },
      { path: '/auth/sign-up', element: <SignUpPage /> },
      { path: '/auth/callback', element: <AuthCallbackPage /> },
    ],
  },

  // Authenticated
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
      { path: '/home', element: <HomePage /> },
      { path: '/pack/:id', element: <PackPage /> },
      { path: '/pack/:id/pull', element: <PullPage /> },
      { path: '/vault', element: <VaultPage /> },
      { path: '/wallet', element: <WalletPage /> },
      { path: '/wallet/transactions', element: <TransactionsPage /> },
      { path: '/wallet/topup/return', element: <TopupReturnPage /> },
      { path: '/feed', element: <FeedPage /> },
      { path: '/delivery', element: <DeliveryPage /> },
      { path: '/delivery/addresses', element: <AddressesPage /> },
      { path: '/account', element: <AccountPage /> },
    ],
  },

  // Public — no guard on purpose.
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

  // No match
  { path: '*', element: <Page404 /> },
];
