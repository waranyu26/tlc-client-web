import Session from 'supertokens-web-js/recipe/session';
import ThirdParty from 'supertokens-web-js/recipe/thirdparty';
import EmailPassword from 'supertokens-web-js/recipe/emailpassword';

import axiosInstance from 'src/lib/axios';

// ----------------------------------------------------------------------
// Thin wrappers around the supertokens-web-js recipe functions. Callers should treat
// a thrown Error / non-OK `status` as a failed auth attempt.
// ----------------------------------------------------------------------

export type SignUpParams = {
  email: string;
  password: string;
  fullName: string;
};

export type SignInParams = {
  email: string;
  password: string;
};

export async function signUpWithEmail({ email, password, fullName }: SignUpParams) {
  return EmailPassword.signUp({
    formFields: [
      { id: 'email', value: email },
      { id: 'password', value: password },
      { id: 'pdpaConsent', value: 'true' },
      { id: 'fullName', value: fullName },
    ],
  });
}

export async function signInWithEmail({ email, password }: SignInParams) {
  return EmailPassword.signIn({
    formFields: [
      { id: 'email', value: email },
      { id: 'password', value: password },
    ],
  });
}

export async function signInWithGoogle() {
  const authUrl = await ThirdParty.getAuthorisationURLWithQueryParamsAndSetState({
    thirdPartyId: 'google',
    frontendRedirectURI: `${window.location.origin}/auth/callback`,
  });
  window.location.assign(authUrl);
}

export async function handleGoogleCallback() {
  return ThirdParty.signInAndUp();
}

export async function signOut() {
  await Session.signOut();
}

export async function deleteAccount(): Promise<void> {
  await axiosInstance.delete('/api/v1/auth/me');
}

// ----------------------------------------------------------------------

export async function checkSessionExists(): Promise<boolean> {
  return Session.doesSessionExist();
}
