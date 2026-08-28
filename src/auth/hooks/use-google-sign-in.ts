import { useState, useCallback } from 'react';

import { signInWithGoogle } from 'src/api/auth.api';

// ----------------------------------------------------------------------
// Launches the SuperTokens ThirdParty (Google) redirect.
//
// `signInWithGoogle` does a network round-trip to the backend's
// `/api/auth/authorisationurl` *before* it navigates, so it can reject — the
// backend being down, or Google not being configured on it, both surface here.
// Call sites used to fire it and drop the promise, which turned every such
// failure into an unhandled rejection and a button that visibly did nothing.
// Callers pass `onError` to render that failure instead.
// ----------------------------------------------------------------------

type UseGoogleSignInOptions = {
  onError: (error: unknown) => void;
};

export function useGoogleSignIn({ onError }: UseGoogleSignInOptions) {
  const [pending, setPending] = useState(false);

  const start = useCallback(async () => {
    setPending(true);

    try {
      await signInWithGoogle();
      // On success the browser is navigating to Google, so `pending` is left
      // true on purpose: the button stays disabled for this document's
      // remaining life rather than flickering back to enabled mid-redirect.
    } catch (error) {
      setPending(false);
      onError(error);
    }
  }, [onError]);

  return { start, pending };
}
