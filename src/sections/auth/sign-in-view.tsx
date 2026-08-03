import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { ApiError } from 'src/lib/axios';
import en from 'src/i18n/locales/en/auth.json';
import th from 'src/i18n/locales/th/auth.json';
import { typeScale } from 'src/theme/type-scale';
import { registerNamespace } from 'src/i18n/register';
import { signInWithEmail, signInWithGoogle } from 'src/api/auth.api';

import { Iconify } from 'src/components/iconify';
import { GhostButton, PrimaryButton } from 'src/components/vault';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks/use-auth-context';

import { AuthShell } from './auth-shell';
import { LogoMark, Wordmark } from './logo-mark';

registerNamespace('auth', en, th);

// ----------------------------------------------------------------------

const SignInSchema = zod.object({
  email: schemaUtils.email(),
  password: zod.string().min(1, { error: 'Password is required' }),
});

type SignInSchemaType = zod.infer<typeof SignInSchema>;

export function SignInView() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkUserSession } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams.get('error') === 'google' ? t('callback.error') : null
  );

  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: '', password: '' },
  });

  const {
    setError,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setErrorMessage(null);

    try {
      const response = await signInWithEmail(data);

      if (response.status === 'FIELD_ERROR') {
        response.formFields.forEach((field) => {
          if (field.id === 'email' || field.id === 'password') {
            setError(field.id, { message: field.error });
          }
        });
        return;
      }

      if (response.status === 'WRONG_CREDENTIALS_ERROR') {
        setErrorMessage(t('errors.wrongCredentials'));
        return;
      }

      if (response.status === 'SIGN_IN_NOT_ALLOWED') {
        setErrorMessage(response.reason || t('errors.generic'));
        return;
      }

      await checkUserSession?.();
      router.push(paths.home);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : t('errors.generic'));
    }
  });

  return (
    <AuthShell>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            // The desktop brand panel already carries the lockup.
            alignItems: { xs: 'center', md: 'flex-start' },
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Box sx={{ display: { md: 'none' }, alignSelf: 'center' }}>
            <LogoMark size={44} />
          </Box>
          <Box sx={{ display: { md: 'none' }, alignSelf: 'center' }}>
            <Wordmark size={19} />
          </Box>
          <Typography sx={{ ...typeScale.sectionHeading, color: '#F4ECDD', mt: 1 }}>
            {t('signIn.title')}
          </Typography>
          <Typography sx={{ ...typeScale.body, color: '#9A9285' }}>
            {t('signIn.subtitle')}
          </Typography>
        </Box>

        {errorMessage && (
          <Alert
            severity="error"
            sx={{
              bgcolor: 'rgba(201,96,91,0.1)',
              color: '#C9605B',
              border: '1px solid rgba(201,96,91,0.35)',
              '& .MuiAlert-icon': { color: '#C9605B' },
            }}
          >
            {errorMessage}
          </Alert>
        )}

        <Form methods={methods} onSubmit={onSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Field.Text name="email" label={t('signIn.email')} autoComplete="email" />
            <Field.Text
              name="password"
              label={t('signIn.password')}
              type="password"
              autoComplete="current-password"
            />
            <PrimaryButton type="submit" fullWidth size="large" disabled={isSubmitting}>
              {t('signIn.submit')}
            </PrimaryButton>
          </Box>
        </Form>

        <Divider sx={{ borderColor: 'rgba(231,206,146,0.08)', color: '#4A4844', fontSize: 11 }}>
          OR
        </Divider>

        <GhostButton
          fullWidth
          size="large"
          startIcon={<Iconify icon="socials:google" width={18} />}
          onClick={() => signInWithGoogle()}
        >
          {t('signIn.google')}
        </GhostButton>

        <Typography sx={{ textAlign: 'center', fontSize: 13, color: '#9A9285' }}>
          {t('signIn.noAccount')}{' '}
          <Link
            component={RouterLink}
            href={paths.auth.signUp}
            sx={{ color: '#E7CE92', fontWeight: 600 }}
          >
            {t('signIn.signUpLink')}
          </Link>
        </Typography>
      </Box>
    </AuthShell>
  );
}

export default SignInView;
