import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  serverUrl: string;
  assetsDir: string;
  auth: {
    method: 'supertokens';
    skip: boolean;
    redirectPath: string;
  };
  supertokens: {
    apiDomain: string;
    apiBasePath: string;
    websiteDomain: string;
  };
  stripe: {
    publishableKey: string;
  };
};

// ----------------------------------------------------------------------

export const CONFIG: ConfigValue = {
  appName: 'Tokyo Lucky Card',
  appVersion: packageJson.version,
  serverUrl: import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3000',
  assetsDir: import.meta.env.VITE_ASSETS_DIR ?? '',
  /**
   * Auth — SuperTokens session (email/password + Google), verified by the Go backend.
   */
  auth: {
    method: 'supertokens',
    skip: false,
    redirectPath: paths.home,
  },
  /**
   * SuperTokens frontend SDK config. `apiBasePath` must match the backend (`/api/auth`).
   */
  supertokens: {
    apiDomain: import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3000',
    apiBasePath: import.meta.env.VITE_ST_API_BASE_PATH ?? '/api/auth',
    websiteDomain: import.meta.env.VITE_WEBSITE_URL ?? window.location.origin,
  },
  /**
   * Stripe — publishable key only; Stripe.js is loaded from the CDN, never bundled (PCI).
   */
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '',
  },
};
