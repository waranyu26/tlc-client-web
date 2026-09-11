import Session from 'supertokens-web-js/recipe/session';
import ThirdParty from 'supertokens-web-js/recipe/thirdparty';
import EmailPassword from 'supertokens-web-js/recipe/emailpassword';

import { paths } from 'src/routes/paths';

import axiosInstance from 'src/lib/axios';
import { resume, suspend } from 'src/lib/music';

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
  const response = await EmailPassword.signUp({
    formFields: [
      { id: 'email', value: email },
      { id: 'password', value: password },
      { id: 'pdpaConsent', value: 'true' },
      { id: 'fullName', value: fullName },
    ],
  });
  if (response.status === 'OK') resume();
  return response;
}

export async function signInWithEmail({ email, password }: SignInParams) {
  const response = await EmailPassword.signIn({
    formFields: [
      { id: 'email', value: email },
      { id: 'password', value: password },
    ],
  });
  // Releases the suspend a sign-out leaves behind. Without it, signing out and
  // back in within one page load would stay silent while the toggle still read
  // "on". A no-op for anyone who never signed out.
  if (response.status === 'OK') resume();
  return response;
}

export async function signInWithGoogle() {
  const authUrl = await ThirdParty.getAuthorisationURLWithQueryParamsAndSetState({
    thirdPartyId: 'google',
    frontendRedirectURI: `${window.location.origin}${paths.auth.callback}`,
  });
  window.location.assign(authUrl);
}

export async function handleGoogleCallback() {
  const response = await ThirdParty.signInAndUp();
  // Belt and braces: Google returns via a full page load, which resets the
  // module anyway, but that is a property of the redirect rather than a
  // guarantee this function makes.
  if (response.status === 'OK') resume();
  return response;
}

export async function signOut() {
  // Here rather than in a component: sign-out is reached from the account page
  // and from an expired session alike, and a listener who has left should not
  // keep hearing the shop. Suspends rather than muting, so their own toggle
  // still reads the way they left it when they come back.
  suspend();
  await Session.signOut();
}

export async function deleteAccount(): Promise<void> {
  await axiosInstance.delete('/api/v1/auth/me');
}

// ----------------------------------------------------------------------

export async function checkSessionExists(): Promise<boolean> {
  return Session.doesSessionExist();
}
