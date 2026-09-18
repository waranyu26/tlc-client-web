import type { AccountSecurity } from './types';

import { useQuery } from '@tanstack/react-query';
import Session from 'supertokens-web-js/recipe/session';
import ThirdParty from 'supertokens-web-js/recipe/thirdparty';
import EmailPassword from 'supertokens-web-js/recipe/emailpassword';
import EmailVerification from 'supertokens-web-js/recipe/emailverification';

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

// ----------------------------------------------------------------------
// Email verification
// ----------------------------------------------------------------------

/**
 * Consumes the token from a verification link.
 *
 * `EmailVerification.verifyEmail()` reads the token out of the URL itself, so
 * the caller does not parse it — which also means this works when the link is
 * opened in a browser with no session, the ordinary case for someone checking
 * mail on their phone.
 */
export async function verifyEmailToken() {
  return EmailVerification.verifyEmail();
}

/**
 * Asks the service to re-send whichever confirmation is outstanding — a pending
 * address change if there is one, otherwise the account's own address.
 *
 * Deliberately our endpoint rather than the recipe's
 * `sendVerificationEmail()`: only the service knows a change is pending, and
 * the recipe would cheerfully re-send to the old address instead.
 */
export async function resendVerificationEmail(): Promise<void> {
  await axiosInstance.post('/api/v1/auth/me/verify-email/resend');
}

// ----------------------------------------------------------------------
// Password reset
// ----------------------------------------------------------------------

/**
 * Starts a reset. The response is OK whether or not the address exists —
 * SuperTokens does not disclose it, and neither should the screen that calls
 * this.
 */
export async function sendPasswordResetEmail(email: string) {
  return EmailPassword.sendPasswordResetEmail({
    formFields: [{ id: 'email', value: email }],
  });
}

/** Completes a reset. The token is read from the URL by the SDK. */
export async function submitNewPassword(password: string) {
  return EmailPassword.submitNewPassword({
    formFields: [{ id: 'password', value: password }],
  });
}

// ----------------------------------------------------------------------
// Account management
// ----------------------------------------------------------------------

export async function getAccountSecurity(): Promise<AccountSecurity> {
  const { data } = await axiosInstance.get<AccountSecurity>('/api/v1/auth/me/security');
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await axiosInstance.put('/api/v1/auth/me/password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
}

/** Gives a Google-only account its first password. */
export async function setPassword(newPassword: string): Promise<void> {
  await axiosInstance.post('/api/v1/auth/me/password', { new_password: newPassword });
}

/**
 * Requests an address change. Nothing moves until the link sent to the new
 * address is clicked, so a success here means "check the new inbox", not
 * "your email changed".
 */
export async function requestEmailChange(
  newEmail: string,
  currentPassword: string
): Promise<void> {
  await axiosInstance.post('/api/v1/auth/me/email', {
    new_email: newEmail,
    current_password: currentPassword,
  });
}

export async function cancelEmailChange(): Promise<void> {
  await axiosInstance.delete('/api/v1/auth/me/email');
}

// ----------------------------------------------------------------------

export function useAccountSecurity() {
  return useQuery({
    queryKey: ['auth', 'security'],
    queryFn: getAccountSecurity,
  });
}
