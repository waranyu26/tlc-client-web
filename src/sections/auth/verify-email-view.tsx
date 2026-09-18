import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { ApiError } from 'src/lib/axios';
import en from 'src/i18n/locales/en/auth.json';
import th from 'src/i18n/locales/th/auth.json';
import { typeScale } from 'src/theme/type-scale';
import { registerNamespace } from 'src/i18n/register';
import { verifyEmailToken, resendVerificationEmail } from 'src/api/auth.api';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { GhostButton, PrimaryButton } from 'src/components/vault';

import { useAuthContext } from 'src/auth/hooks/use-auth-context';

import { AuthShell } from './auth-shell';

registerNamespace('auth', en, th);

// ----------------------------------------------------------------------

type Status = 'pending' | 'verifying' | 'verified' | 'invalid';

// `as const` so the union survives the lookup — the Iconify `icon` prop is
// typed to the registered set, and a widened `string` would not satisfy it.
const ICONS = {
  pending: 'solar:letter-bold',
  verifying: 'solar:letter-bold',
  verified: 'solar:check-circle-bold',
  invalid: 'solar:danger-triangle-bold',
} as const;

/**
 * Two screens in one route, chosen by whether the URL carries a token.
 *
 * With a token this consumes it. Without one it is the "check your inbox"
 * screen a customer lands on straight after signing up — the same place, so
 * the resend button lives in one component and the customer who gave up on the
 * first mail can come back to the same URL.
 */
export function VerifyEmailView() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkUserSession } = useAuthContext();

  const hasToken = Boolean(searchParams.get('token'));

  const [status, setStatus] = useState<Status>(hasToken ? 'verifying' : 'pending');
  const [message, setMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!hasToken) {
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        const response = await verifyEmailToken();

        if (cancelled) return;

        if (response.status !== 'OK') {
          setStatus('invalid');
          return;
        }

        // Refresh the app user so the banner and the money routes agree with
        // what just happened. A no-op when the link was opened in a browser
        // with no session, which is the ordinary case.
        await checkUserSession?.();
        setStatus('verified');
      } catch (error) {
        if (cancelled) return;
        setStatus('invalid');
        setMessage(error instanceof ApiError ? error.message : null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasToken, checkUserSession]);

  const handleResend = useCallback(async () => {
    setResending(true);
    setMessage(null);
    try {
      await resendVerificationEmail();
      setResent(true);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t('errors.generic'));
    } finally {
      setResending(false);
    }
  }, [t]);

  const icon = ICONS[status];

  const tone = status === 'invalid' ? '#C9605B' : '#E7CE92';

  return (
    <AuthShell>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
        <Logo sx={{ display: { md: 'none' }, width: 44, height: 44 }} />

        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: status === 'invalid' ? 'rgba(201,96,91,0.12)' : 'rgba(231,206,146,0.12)',
          }}
        >
          {status === 'verifying' ? (
            <CircularProgress size={26} sx={{ color: tone }} />
          ) : (
            <Iconify icon={icon} width={30} sx={{ color: tone }} />
          )}
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ ...typeScale.sectionHeading, color: '#F4ECDD' }}>
            {t(`verifyEmail.${status}.title`)}
          </Typography>
          <Typography sx={{ ...typeScale.body, color: '#9A9285', mt: 1 }}>
            {t(`verifyEmail.${status}.body`)}
          </Typography>
        </Box>

        {message && (
          <Alert
            severity="error"
            sx={{
              width: '100%',
              bgcolor: 'rgba(201,96,91,0.1)',
              color: '#C9605B',
              border: '1px solid rgba(201,96,91,0.35)',
              '& .MuiAlert-icon': { color: '#C9605B' },
            }}
          >
            {message}
          </Alert>
        )}

        {resent && (
          <Alert
            severity="success"
            sx={{
              width: '100%',
              bgcolor: 'rgba(231,206,146,0.1)',
              color: '#E7CE92',
              border: '1px solid rgba(231,206,146,0.35)',
              '& .MuiAlert-icon': { color: '#E7CE92' },
            }}
          >
            {t('verifyEmail.resent')}
          </Alert>
        )}

        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {status === 'verified' ? (
            <PrimaryButton fullWidth size="large" onClick={() => router.push(paths.home)}>
              {t('verifyEmail.continue')}
            </PrimaryButton>
          ) : (
            <>
              {/* Resending needs a session, so it is only offered where the
                  customer plausibly has one. Someone who opened an expired
                  link on a device they never signed in on is sent to sign in
                  first, where the banner will offer it again. */}
              <PrimaryButton fullWidth size="large" disabled={resending} onClick={handleResend}>
                {t('verifyEmail.resend')}
              </PrimaryButton>
              <GhostButton fullWidth size="large" onClick={() => router.push(paths.auth.signIn)}>
                {t('verifyEmail.backToSignIn')}
              </GhostButton>
            </>
          )}
        </Box>
      </Box>
    </AuthShell>
  );
}

export default VerifyEmailView;
