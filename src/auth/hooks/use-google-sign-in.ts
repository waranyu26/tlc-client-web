import { useState, useCallback } from 'react';

import { signInWithGoogle } from 'src/api/auth.api';

import { stashReturnTo } from '../utils/return-to';

// ----------------------------------------------------------------------
// Launches the SuperTokens ThirdParty (Google) redirect.
//
// `signInWithGoogle` does a network round-trip to the backend's
// `/api/auth/authorisationurl` *before* it navigates, so it can reject — the
// backend being down, or Google not being configured on it, both surface here.
// Call sites used to fire it and drop the promise, which turned every such
// failure into an unhandled rejection and a button that visibly did nothing.
// Callers pass `onError` to render that failure instead.
//
// `returnTo` is stashed rather than appended to the redirect URI: Google matches
// that URI exactly against the one registered on the OAuth client, so a query
// string of ours on the way back is not an option. @see auth/utils/return-to.
// ----------------------------------------------------------------------

type UseGoogleSignInOptions = {
  onError: (error: unknown) => void;
  /** Same-origin path to land on afterwards. Defaults to wherever the app sends a fresh sign-in. */
  returnTo?: string | null;
};

export function useGoogleSignIn({ onError, returnTo }: UseGoogleSignInOptions) {
  const [pending, setPending] = useState(false);

  const start = useCallback(async () => {
    setPending(true);

    try {
      stashReturnTo(returnTo);
      await signInWithGoogle();
      // On success the browser is navigating to Google, so `pending` is left
      // true on purpose: the button stays disabled for this document's
      // remaining life rather than flickering back to enabled mid-redirect.
    } catch (error) {
      setPending(false);
      onError(error);
    }
  }, [onError, returnTo]);

  return { start, pending };
}
