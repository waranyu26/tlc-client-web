import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';

// ----------------------------------------------------------------------

const PORT = 5173;

/**
 * Dev serves over TLS on a real hostname rather than `localhost`, because the
 * Google OAuth client's authorised redirect URI is registered against
 * `https://dev.tokyoluckycard.com:5173/auth/callback/google` — Google matches
 * redirect URIs exactly, so the dev origin has to be the registered one.
 *
 * Requires `dev.tokyoluckycard.com` to resolve to 127.0.0.1 (Cloudflare DNS-only
 * A record, or an /etc/hosts entry) and a cert from `yarn certs`.
 */
const DEV_HOST = process.env.VITE_DEV_HOST ?? 'dev.tokyoluckycard.com';

/**
 * Origin the dev server proxies `/api` to.
 *
 * The browser is never pointed straight at the Go service: an https page may
 * not call `http://localhost:3000` at all — Chrome blocks it as mixed content.
 * Proxying keeps every request same-origin, which also removes the CORS
 * preflight and makes SuperTokens' session cookies first-party, matching how
 * app.tokyoluckycard.com will behave against the deployed API.
 */
const API_TARGET = process.env.VITE_DEV_API_TARGET ?? 'http://127.0.0.1:3000';

/**
 * Origin the dev server proxies `/bucket` to — MinIO, standing in for Railway
 * Bucket.
 *
 * Same mixed-content problem as the API, and it bites harder here: a blocked
 * `<audio>` source fails silently, with no request in the network panel and no
 * error anyone would connect to the music not playing. Prod needs none of this
 * because Railway Bucket is already https, so VITE_BUCKET_URL points straight
 * at it there.
 */
const BUCKET_TARGET = process.env.VITE_DEV_BUCKET_TARGET ?? 'http://127.0.0.1:9000';

/**
 * TLS material from `yarn certs` (mkcert). Deliberately optional: a fresh
 * clone, a CI job, or anyone without the local mkcert CA still gets a working
 * plain-http dev server instead of a hard startup failure. Google sign-in is
 * the part that won't work there, hence the warning.
 */
function devHttps() {
  const cert = path.resolve(process.cwd(), 'certs', `${DEV_HOST}.pem`);
  const key = path.resolve(process.cwd(), 'certs', `${DEV_HOST}-key.pem`);

  if (!fs.existsSync(cert) || !fs.existsSync(key)) {
    console.warn(
      `[vite] No TLS cert for ${DEV_HOST} in ./certs — serving over http.\n` +
        `[vite] Run \`yarn certs\` to enable https (Google sign-in needs it).`
    );
    return undefined;
  }

  return { cert: fs.readFileSync(cert), key: fs.readFileSync(key) };
}

const server = {
  port: PORT,
  host: true,
  https: devHttps(),
  // Vite rejects requests whose Host header it doesn't recognise; the dev
  // hostname is not localhost, so it has to be allowed explicitly.
  allowedHosts: [DEV_HOST],
  proxy: {
    '/api': {
      target: API_TARGET,
      // Left false on purpose. The Go service is configured with
      // API_DOMAIN=https://dev.tokyoluckycard.com:5173, so forwarding the
      // browser's original Host header keeps SuperTokens' view of the request
      // origin consistent with that; `changeOrigin: true` would rewrite it to
      // 127.0.0.1:3000 and desync the two.
      changeOrigin: false,
    },
    '/bucket': {
      target: BUCKET_TARGET,
      // Unlike /api, the origin must be rewritten: MinIO checks the Host header
      // when it signs and routes bucket requests, and dev.tokyoluckycard.com
      // means nothing to it.
      changeOrigin: true,
      rewrite: (requestPath: string) => requestPath.replace(/^\/bucket/, '/card-images'),
    },
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
      },
      overlay: {
        position: 'tl',
        initialIsOpen: false,
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^src(.+)/,
        replacement: path.resolve(process.cwd(), 'src/$1'),
      },
    ],
  },
  server,
  // Same origin/TLS/proxy shape for `yarn start`, so a production build can be
  // smoke-tested against the registered OAuth redirect URI too.
  preview: server,
});
