import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import en from 'src/i18n/locales/en/auth.json';
import th from 'src/i18n/locales/th/auth.json';
import { registerNamespace } from 'src/i18n/register';
import { handleGoogleCallback } from 'src/api/auth.api';

import { useAuthContext } from 'src/auth/hooks/use-auth-context';

import { AuthShell } from './auth-shell';

registerNamespace('auth', en, th);

// ----------------------------------------------------------------------
// Resolves the SuperTokens ThirdParty (Google) redirect. Runs once on mount;
// success routes home, any failure bounces back to sign-in with an inline
// error flag (this repo has no global toast provider — sign-in reads `?error`).
// ----------------------------------------------------------------------

export function AuthCallbackView() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const { checkUserSession } = useAuthContext();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const resolve = async () => {
      try {
        const response = await handleGoogleCallback();

        if (response.status !== 'OK') {
          router.replace(`${paths.auth.signIn}?error=google`);
          return;
        }

        await checkUserSession?.();
        router.push(paths.home);
      } catch {
        router.replace(`${paths.auth.signIn}?error=google`);
      }
    };

    resolve();
  }, [checkUserSession, router]);

  return (
    <AuthShell>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={32} sx={{ color: '#E7CE92' }} />
        <Typography sx={{ color: '#9A9285', fontSize: 13 }}>{t('callback.loading')}</Typography>
      </Box>
    </AuthShell>
  );
}

export default AuthCallbackView;
