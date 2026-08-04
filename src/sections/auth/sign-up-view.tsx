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
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { ApiError } from 'src/lib/axios';
import en from 'src/i18n/locales/en/auth.json';
import th from 'src/i18n/locales/th/auth.json';
import { typeScale } from 'src/theme/type-scale';
import { registerNamespace } from 'src/i18n/register';
import { signUpWithEmail, signInWithGoogle } from 'src/api/auth.api';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { GhostButton, PrimaryButton } from 'src/components/vault';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks/use-auth-context';

import { AuthShell } from './auth-shell';

registerNamespace('auth', en, th);

// ----------------------------------------------------------------------

const SignUpSchema = zod.object({
  fullName: zod.string().min(1, { error: 'Full name is required' }),
  email: schemaUtils.email(),
  password: zod.string().min(8, { error: 'Password must be at least 8 characters' }),
  pdpaConsent: schemaUtils.boolean({ error: 'You must accept the PDPA consent to continue' }),
});

type SignUpSchemaType = zod.infer<typeof SignUpSchema>;

const FORM_FIELD_KEYS: Array<keyof SignUpSchemaType> = [
  'fullName',
  'email',
  'password',
  'pdpaConsent',
];

export function SignUpView() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const { checkUserSession } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const methods = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { fullName: '', email: '', password: '', pdpaConsent: false },
  });

  const {
    setError,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setErrorMessage(null);

    try {
      const response = await signUpWithEmail(data);

      if (response.status === 'FIELD_ERROR') {
        response.formFields.forEach((field) => {
          if (FORM_FIELD_KEYS.includes(field.id as keyof SignUpSchemaType)) {
            setError(field.id as keyof SignUpSchemaType, { message: field.error });
          } else {
            setErrorMessage(field.error);
          }
        });
        return;
      }

      if (response.status === 'SIGN_UP_NOT_ALLOWED') {
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
          <Logo sx={{ display: { md: 'none' }, width: 44, height: 44 }} />
          <Typography sx={{ ...typeScale.sectionHeading, color: '#F4ECDD' }}>
            {t('signUp.title')}
          </Typography>
          <Typography sx={{ ...typeScale.body, color: '#9A9285' }}>
            {t('signUp.subtitle')}
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
            <Field.Text name="fullName" label={t('signUp.fullName')} autoComplete="name" />
            <Field.Text name="email" label={t('signUp.email')} autoComplete="email" />
            <Field.Text
              name="password"
              label={t('signUp.password')}
              type="password"
              autoComplete="new-password"
            />
            <Field.Checkbox
              name="pdpaConsent"
              label={
                <Typography sx={{ fontSize: 12, color: '#9A9285', lineHeight: 1.55 }}>
                  {t('signUp.pdpaLabel')}
                </Typography>
              }
            />
            <PrimaryButton type="submit" fullWidth size="large" disabled={isSubmitting}>
              {t('signUp.submit')}
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
          {t('signUp.haveAccount')}{' '}
          <Link
            component={RouterLink}
            href={paths.auth.signIn}
            sx={{ color: '#E7CE92', fontWeight: 600 }}
          >
            {t('signUp.signInLink')}
          </Link>
        </Typography>
      </Box>
    </AuthShell>
  );
}

export default SignUpView;
