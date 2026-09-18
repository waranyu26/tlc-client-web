import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { ApiError } from 'src/lib/axios';
import en from 'src/i18n/locales/en/auth.json';
import th from 'src/i18n/locales/th/auth.json';
import { typeScale } from 'src/theme/type-scale';
import { registerNamespace } from 'src/i18n/register';
import { sendPasswordResetEmail } from 'src/api/auth.api';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { PrimaryButton } from 'src/components/vault';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { AuthShell } from './auth-shell';

registerNamespace('auth', en, th);

// ----------------------------------------------------------------------

const ForgotPasswordSchema = zod.object({
  email: schemaUtils.email(),
});

type ForgotPasswordSchemaType = zod.infer<typeof ForgotPasswordSchema>;

export function ForgotPasswordView() {
  const { t } = useTranslation('auth');

  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const methods = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setErrorMessage(null);
    try {
      await sendPasswordResetEmail(data.email);
      // Shown regardless of what came back. The service does not disclose
      // whether an address has an account, and a screen that said "no such
      // account" would hand that back to anyone probing addresses.
      setSent(true);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : t('errors.generic'));
    }
  });

  if (sent) {
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
            <Iconify icon="solar:letter-bold" width={30} sx={{ color: '#E7CE92' }} />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ ...typeScale.sectionHeading, color: '#F4ECDD' }}>
              {t('forgotPassword.sentTitle')}
            </Typography>
            <Typography sx={{ ...typeScale.body, color: '#9A9285', mt: 1 }}>
              {t('forgotPassword.sentBody')}
            </Typography>
          </Box>
          <Link
            component={RouterLink}
            href={paths.auth.signIn}
            sx={{ color: '#E7CE92', fontWeight: 600, fontSize: 13 }}
          >
            {t('forgotPassword.backToSignIn')}
          </Link>
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
            {t('forgotPassword.title')}
          </Typography>
          <Typography sx={{ ...typeScale.body, color: '#9A9285' }}>
            {t('forgotPassword.subtitle')}
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
            <PrimaryButton type="submit" fullWidth size="large" disabled={isSubmitting}>
              {t('forgotPassword.submit')}
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

export default ForgotPasswordView;
