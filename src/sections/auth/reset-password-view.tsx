import { z as zod } from 'zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { ApiError } from 'src/lib/axios';
import en from 'src/i18n/locales/en/auth.json';
import th from 'src/i18n/locales/th/auth.json';
import { typeScale } from 'src/theme/type-scale';
import { submitNewPassword } from 'src/api/auth.api';
import { registerNamespace } from 'src/i18n/register';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { GhostButton, PrimaryButton } from 'src/components/vault';

import { passwordField } from 'src/auth/password-policy';
import { PasswordStrength } from 'src/auth/components/password-strength';

import { AuthShell } from './auth-shell';

registerNamespace('auth', en, th);

// ----------------------------------------------------------------------

export function ResetPasswordView() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasToken = Boolean(searchParams.get('token'));

  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ResetPasswordSchema = useMemo(
    () =>
      zod
        .object({
          password: passwordField(t),
          confirmPassword: zod.string(),
        })
        // Confirmation is checked here rather than trusted to the customer's
        // eyes: a mistyped new password on this screen is unrecoverable
        // without starting the whole reset again from a fresh email.
        .refine((data) => data.password === data.confirmPassword, {
          message: t('errors.passwordsDoNotMatch'),
          path: ['confirmPassword'],
        }),
    [t]
  );

  type ResetPasswordSchemaType = zod.infer<typeof ResetPasswordSchema>;

  const methods = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const {
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const password = watch('password');

  const onSubmit = handleSubmit(async (data) => {
    setErrorMessage(null);
    try {
      const response = await submitNewPassword(data.password);

      if (response.status === 'RESET_PASSWORD_INVALID_TOKEN_ERROR') {
        setErrorMessage(t('resetPassword.invalidToken'));
        return;
      }
      if (response.status === 'FIELD_ERROR') {
        setErrorMessage(response.formFields[0]?.error ?? t('errors.generic'));
        return;
      }

      setDone(true);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : t('errors.generic'));
    }
  });

  // No token means the link was mangled or the page was opened directly. Say so
  // rather than showing a form whose submit can only ever fail.
  if (!hasToken) {
    return (
      <AuthShell>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
          <Iconify icon="solar:danger-triangle-bold" width={30} sx={{ color: '#C9605B' }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ ...typeScale.sectionHeading, color: '#F4ECDD' }}>
              {t('resetPassword.missingTokenTitle')}
            </Typography>
            <Typography sx={{ ...typeScale.body, color: '#9A9285', mt: 1 }}>
              {t('resetPassword.missingTokenBody')}
            </Typography>
          </Box>
          <GhostButton
            fullWidth
            size="large"
            onClick={() => router.push(paths.auth.forgotPassword)}
          >
            {t('resetPassword.requestAnother')}
          </GhostButton>
        </Box>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '999px',
              bgcolor: 'rgba(231,206,146,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="solar:check-circle-bold" width={30} sx={{ color: '#E7CE92' }} />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ ...typeScale.sectionHeading, color: '#F4ECDD' }}>
              {t('resetPassword.doneTitle')}
            </Typography>
            {/* Every session was revoked server-side, including any the person
                who forced the reset was holding. Saying so is the reassurance
                somebody recovering a compromised account came for. */}
            <Typography sx={{ ...typeScale.body, color: '#9A9285', mt: 1 }}>
              {t('resetPassword.doneBody')}
            </Typography>
          </Box>
          <PrimaryButton fullWidth size="large" onClick={() => router.push(paths.auth.signIn)}>
            {t('resetPassword.signIn')}
          </PrimaryButton>
        </Box>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            alignItems: { xs: 'center', md: 'flex-start' },
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Logo sx={{ display: { md: 'none' }, width: 44, height: 44 }} />
          <Typography sx={{ ...typeScale.sectionHeading, color: '#F4ECDD' }}>
            {t('resetPassword.title')}
          </Typography>
          <Typography sx={{ ...typeScale.body, color: '#9A9285' }}>
            {t('resetPassword.subtitle')}
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
            <Field.Text
              name="password"
              label={t('resetPassword.newPassword')}
              type="password"
              autoComplete="new-password"
            />
            <PasswordStrength password={password} />
            <Field.Text
              name="confirmPassword"
              label={t('resetPassword.confirmPassword')}
              type="password"
              autoComplete="new-password"
            />
            <PrimaryButton type="submit" fullWidth size="large" disabled={isSubmitting}>
              {t('resetPassword.submit')}
            </PrimaryButton>
          </Box>
        </Form>

        <Typography sx={{ textAlign: 'center', fontSize: 13, color: '#9A9285' }}>
          <Link
            component={RouterLink}
            href={paths.auth.signIn}
            sx={{ color: '#E7CE92', fontWeight: 600 }}
          >
            {t('forgotPassword.backToSignIn')}
          </Link>
        </Typography>
      </Box>
    </AuthShell>
  );
}

export default ResetPasswordView;
