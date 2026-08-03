import type { AuthState } from '../../types';

import { useSetState } from 'minimal-shared/hooks';
import Session from 'supertokens-web-js/recipe/session';
import { useMemo, useEffect, useCallback } from 'react';

import { getMe } from 'src/api/user.api';

import { AuthContext } from '../auth-context';

// ----------------------------------------------------------------------
// SuperTokens-backed auth provider. Session state lives in the SuperTokens SDK
// (httpOnly-equivalent storage + silent refresh via Session.addAxiosInterceptors,
// wired in src/auth/supertokens.ts). On mount — and whenever `checkUserSession` is
// called — we ask the SDK whether a session exists, then hydrate the app user from
// GET /api/v1/users/me.
// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const { state, setState } = useSetState<AuthState>({ user: null, loading: true });

  const checkUserSession = useCallback(async () => {
    try {
      const sessionExists = await Session.doesSessionExist();

      if (!sessionExists) {
        setState({ user: null, loading: false });
        return;
      }

      const user = await getMe();
      setState({ user, loading: false });
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext value={memoizedValue}>{children}</AuthContext>;
}
