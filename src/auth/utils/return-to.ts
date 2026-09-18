// ----------------------------------------------------------------------
// Where to put the customer back after they sign in.
//
// The email flow carries this in the URL (`?returnTo=…`), which survives fine
// because the whole exchange happens on our own origin. Google's does not: the
// browser leaves for accounts.google.com and comes back to a fixed redirect URI
// that Google matches character for character, so there is no query string of
// ours left to read. Session storage bridges that gap — it is per-tab, so a
// second tab signing in elsewhere cannot steer this one, and it is cleared on
// read so a stale destination cannot ambush the next sign-in.
//
// Only a same-origin *path* is ever stored, for the same reason `safeReturnUrl`
// exists: a `returnTo` that could name another origin is an open redirect.
// ----------------------------------------------------------------------

const RETURN_TO_KEY = 'tlc.auth.returnTo';

/** Remembers a destination across a redirect off-site. No-ops on a bad value. */
export function stashReturnTo(path: string | null | undefined) {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return;
  }

  try {
    sessionStorage.setItem(RETURN_TO_KEY, path);
  } catch {
    // Private-mode Safari and friends. Losing the destination costs the
    // customer a click; throwing here would cost them the sign-in.
  }
}

/** Reads and clears the stashed destination. */
export function takeReturnTo(): string | null {
  try {
    const path = sessionStorage.getItem(RETURN_TO_KEY);
    sessionStorage.removeItem(RETURN_TO_KEY);
    return path && path.startsWith('/') && !path.startsWith('//') ? path : null;
  } catch {
    return null;
  }
}
