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
  music: {
    trackUrl: string;
    volume: number;
  };
};

// ----------------------------------------------------------------------

/**
 * Public base URL of the asset bucket — Railway Bucket in prod, MinIO locally.
 *
 * The same bucket already serves every card image, and the Go service writes
 * those URLs against this exact base (`BUCKET_PUBLIC_URL`). Audio joins them
 * rather than being bundled: a five-megabyte track in the JS build would be
 * downloaded by every visitor before the app could render, including the ones
 * who have music muted, and it would be re-downloaded on every deploy because
 * the bundle hash changes. From the bucket it is a separate, cacheable,
 * range-servable request that only happens if playback actually starts.
 *
 * The fallback is the dev proxy, and deliberately nothing else. It used to be
 * an absolute `http://localhost:9000`, which shipped to production the first
 * time the variable was forgotten and left an https page requesting audio and
 * images over http — blocked as mixed content, silent in every log. A relative
 * path cannot do that: it resolves against whatever origin is serving the app,
 * so at worst it 404s somewhere visible. And it cannot reach production at all
 * now, because the build refuses to run without VITE_BUCKET_URL set
 * (see vite.config.ts).
 */
const BUCKET_URL = import.meta.env.VITE_BUCKET_URL ?? '/bucket';

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
  /**
   * Looping background track, at a fixed key in the asset bucket. Swapping the
   * track means replacing that object, which is also what keeps every
   * environment on the same URL.
   */
  music: {
    trackUrl: `${BUCKET_URL}/music/main-theme.mp3`,
    // Background, not foreground: it has to sit under the pull effects, which
    // play at full volume and are the sound the user actually asked for. At
    // 0.35 it did not — the loop was still competing with the moment it is
    // supposed to be behind.
    //
    // This is linear amplitude, not perceived loudness, so halving the number
    // is rather less than halving how loud it sounds. Worth knowing before
    // reaching for a smaller one: the next useful step down is roughly another
    // third off, not another half.
    volume: 0.18,
  },
};
