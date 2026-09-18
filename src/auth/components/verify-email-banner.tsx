import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import { useMe } from 'src/api/user.api';
import en from 'src/i18n/locales/en/auth.json';
import th from 'src/i18n/locales/th/auth.json';
import { registerNamespace } from 'src/i18n/register';
import { resendVerificationEmail } from 'src/api/auth.api';

import { Iconify } from 'src/components/iconify';

registerNamespace('auth', en, th);

// ----------------------------------------------------------------------

/**
 * Sits above the app while the account's email is unproved.
 *
 * Deliberately not dismissible. It is not a nag — it is the explanation for
 * why four things in the app return 403, and hiding it would leave the
 * customer to discover that at the moment they try to spend money. It
 * disappears on its own the instant `email_verified` flips.
 *
 * It renders nothing for a signed-out visitor, because `useMe` has no profile
 * to read and a guest has no email of ours to confirm.
 */
export function VerifyEmailBanner() {
  const { t } = useTranslation('auth');
  const { data: profile } = useMe();

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = useCallback(async () => {
    setSending(true);
    try {
      await resendVerificationEmail();
      setSent(true);
    } catch {
      // Swallowed on purpose: the rate limiter answers 429 here once somebody
      // leans on the button, and surfacing that as an error on a banner they
      // cannot dismiss reads as the app being broken. The inbox is the real
      // feedback channel.
      setSent(true);
    } finally {
      setSending(false);
    }
  }, []);

  if (!profile || profile.email_verified) return null;

  return (
    <Box
      role="status"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: { xs: 2, md: 3 },
        py: 1.25,
        bgcolor: 'rgba(201,143,91,0.12)',
        borderBottom: '1px solid rgba(201,143,91,0.28)',
      }}
    >
      <Iconify
        icon="solar:letter-bold"
        width={18}
        sx={{ color: '#C98F5B', flexShrink: 0 }}
      />

      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#F4ECDD', lineHeight: 1.4 }}>
          {t('banner.title')}
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#9A9285', lineHeight: 1.5 }}>
          {sent ? t('banner.sent') : t('banner.body')}
        </Typography>
      </Box>

      {!sent && (
        <ButtonBase
          onClick={handleResend}
          disabled={sending}
          sx={{
            flexShrink: 0,
            px: 1.5,
            py: 0.75,
            borderRadius: '8px',
            fontSize: 12,
            fontWeight: 600,
            color: '#C98F5B',
            border: '1px solid rgba(201,143,91,0.4)',
          }}
        >
          {t('banner.action')}
        </ButtonBase>
      )}
    </Box>
  );
}
