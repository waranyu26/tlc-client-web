// ----------------------------------------------------------------------
// Recovering a tab that outlived its deploy.
//
// Every route is a `lazy(() => import(...))`, so the chunk it lives in is
// fetched the moment the customer first navigates there — not at page load. A
// deploy replaces every file under /assets with a new content hash, so a tab
// opened before the deploy is holding an index.html that names files the server
// no longer has: the next route change asks for `transactions-WvCQrKoh.js`,
// gets nothing, and React Router shows the raw "Failed to fetch dynamically
// imported module" error. Nothing is wrong with the app or the customer's
// session — their copy of the page is simply one version behind, and a reload
// fixes it completely.
//
// So the recovery is a reload, and the only real design question is how not to
// loop: if the fresh page fails the same way, reloading again would spin
// forever on a blank screen. Hence the one-shot guard below — recovery is
// attempted once, and a second failure hands the customer a screen with a
// button instead.
// ----------------------------------------------------------------------

/**
 * Timestamp of the last reload we triggered, kept in `sessionStorage` so it
 * survives the reload itself (which is the whole point) but not the tab.
 */
const RELOAD_MARK_KEY = 'tlc:stale-deploy-reload-at';

/**
 * How long a reload mark suppresses another one.
 *
 * Long enough to cover the fresh page's own boot and first navigation — if it
 * is going to fail the same way, it does so within a second or two — and short
 * enough that a tab left open across *two* deploys can still self-heal on the
 * second one rather than being stuck on the manual screen for the rest of the
 * session.
 */
const RELOAD_SUPPRESS_MS = 15_000;

/**
 * What a browser says when a dynamic `import()` doesn't arrive. The wording is
 * per-engine and none of it is standardised, so all four spellings are matched;
 * a missed one means a customer sees a stack trace instead of a reload, which
 * is exactly the failure this module exists to prevent.
 */
const CHUNK_ERROR_PATTERNS = [
  'failed to fetch dynamically imported module', // Chromium
  'error loading dynamically imported module', // Firefox
  'importing a module script failed', // Safari
  'unable to preload css', // Vite's own preload helper, for a chunk's stylesheet
];

/** Whether `error` is a dynamic-import failure — i.e. a chunk that didn't load. */
export function isStaleChunkError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : undefined;

  if (!message) return false;

  const haystack = message.toLowerCase();

  return CHUNK_ERROR_PATTERNS.some((pattern) => haystack.includes(pattern));
}

/**
 * `sessionStorage` throws rather than degrading when storage is blocked (Safari
 * with cookies denied, some embedded webviews). Treating a throw as "no mark"
 * makes the reload unguarded there, which is the safe direction to fail: worst
 * case is a second reload, versus never recovering at all.
 */
function readReloadMark(): number | undefined {
  try {
    const mark = Number(window.sessionStorage.getItem(RELOAD_MARK_KEY));
    return Number.isFinite(mark) && mark > 0 ? mark : undefined;
  } catch {
    return undefined;
  }
}

function writeReloadMark() {
  try {
    window.sessionStorage.setItem(RELOAD_MARK_KEY, String(Date.now()));
  } catch {
    // Storage blocked — see readReloadMark.
  }
}

/** A reload this page-load has already started; the navigation is just pending. */
let reloadInFlight = false;

/**
 * Reload to pick up the current `index.html`, at most once.
 *
 * Returns whether a reload is happening, so the caller can show "updating"
 * rather than an error when it is — and an actionable screen when it is not.
 */
export function reloadForStaleDeploy(): boolean {
  if (reloadInFlight) return true;

  // Offline is the other way a dynamic import fails, and it looks identical
  // from here. Reloading an offline tab replaces the app — which could still
  // explain itself — with the browser's own error page, so don't.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;

  const mark = readReloadMark();

  // Already reloaded and still broken: the deploy is not the problem, so stop.
  if (mark !== undefined && Date.now() - mark < RELOAD_SUPPRESS_MS) return false;

  reloadInFlight = true;
  writeReloadMark();
  window.location.reload();

  return true;
}

/**
 * Reload unconditionally, for the button on the manual screen. An explicit tap
 * is not a loop, and the customer is owed the attempt they asked for.
 */
export function forceReload() {
  reloadInFlight = true;
  writeReloadMark();
  window.location.reload();
}
