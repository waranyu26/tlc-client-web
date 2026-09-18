import type { UserProfile } from 'src/api/types';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import { useAccountSecurity } from 'src/api/auth.api';

import { Iconify } from 'src/components/iconify';

import { EditNameDialog } from './edit-name-dialog';
import { ChangeEmailDialog } from './change-email-dialog';
import { ChangePasswordDialog } from './change-password-dialog';

// ----------------------------------------------------------------------

const PANEL_SX = {
  bgcolor: '#17161B',
  border: '1px solid rgba(231,206,146,0.16)',
  borderRadius: '15px',
} as const;

const LABEL_SX = {
  fontSize: 9.5,
  letterSpacing: '0.18em',
  color: '#9A9285',
  textTransform: 'uppercase' as const,
};

const METHOD_ICONS = {
  emailpassword: 'solar:lock-password-outline',
  google: 'socials:google',
} as const;

type Props = {
  profile: UserProfile;
};

type OpenDialog = 'name' | 'email' | 'password' | null;

/**
 * The editable half of the account page: name, email, password, and the list
 * of ways this account can be signed in to.
 *
 * Sign-in methods are shown rather than merely implied, because on this product
 * one account can genuinely hold two — an email/password identity and a Google
 * identity resolving to the same wallet — and a customer who cannot see that
 * has no way to know why "sign in with Google" lands on the balance they built
 * up with a password.
 */
export function SecurityPanel({ profile }: Props) {
  const { t } = useTranslation('account');
  const { data: security } = useAccountSecurity();

  const [open, setOpen] = useState<OpenDialog>(null);
  const close = useCallback(() => setOpen(null), []);

  const hasPassword = security?.has_password ?? false;
  const pendingEmail = security?.pending_email ?? '';

  return (
    <>
      <Box sx={{ ...PANEL_SX, p: 2.5, mb: 2.5 }}>
        <Typography sx={{ ...LABEL_SX, mb: 2 }}>{t('security.heading')}</Typography>

        <Row
          label={t('security.name')}
          value={profile.full_name}
          action={t('security.edit')}
          onClick={() => setOpen('name')}
        />

        <Divider sx={{ borderColor: 'rgba(231,206,146,0.08)', my: 1.75 }} />

        <Row
          label={t('security.email')}
          value={profile.email}
          // A Google-only account has no password to re-authenticate with, and
          // a live session is not proof enough to hand somebody's address to
          // whoever finds an unattended browser. The dialog explains; the row
          // stays reachable so the explanation is findable.
          action={t('security.edit')}
          onClick={() => setOpen('email')}
          badge={
            profile.email_verified ? undefined : (
              <Chip
                size="small"
                label={t('security.unverified')}
                sx={{
                  height: 18,
                  fontSize: 10,
                  fontWeight: 600,
                  bgcolor: 'rgba(201,143,91,0.14)',
                  color: '#C98F5B',
                }}
              />
            )
          }
          note={pendingEmail ? t('security.pendingEmail', { email: pendingEmail }) : undefined}
        />

        <Divider sx={{ borderColor: 'rgba(231,206,146,0.08)', my: 1.75 }} />

        <Row
          label={t('security.password')}
          value={hasPassword ? '••••••••••' : t('security.noPassword')}
          action={hasPassword ? t('security.change') : t('security.setPassword')}
          onClick={() => setOpen('password')}
        />

        {!!security?.auth_methods.length && (
          <>
            <Divider sx={{ borderColor: 'rgba(231,206,146,0.08)', my: 1.75 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={LABEL_SX}>{t('security.methods')}</Typography>
              <Box sx={{ display: 'flex', gap: 0.75 }}>
                {security.auth_methods.map((method) => (
                  <Chip
                    key={method}
                    size="small"
                    icon={
                      <Iconify
                        icon={METHOD_ICONS[method]}
                        width={13}
                        sx={{ color: '#E7CE92 !important' }}
                      />
                    }
                    label={t(`security.method.${method}`)}
                    sx={{
                      height: 24,
                      fontSize: 11.5,
                      fontWeight: 600,
                      bgcolor: 'rgba(231,206,146,0.1)',
                      color: '#E7CE92',
                    }}
                  />
                ))}
              </Box>
            </Box>
          </>
        )}
      </Box>

      <EditNameDialog open={open === 'name'} onClose={close} currentName={profile.full_name} />
      <ChangeEmailDialog
        open={open === 'email'}
        onClose={close}
        currentEmail={profile.email}
        pendingEmail={pendingEmail}
        hasPassword={hasPassword}
      />
      <ChangePasswordDialog open={open === 'password'} onClose={close} hasPassword={hasPassword} />
    </>
  );
}

// ----------------------------------------------------------------------

type RowProps = {
  label: string;
  value: string;
  action: string;
  onClick: () => void;
  badge?: React.ReactNode;
  note?: string;
};

function Row({ label, value, action, onClick, badge, note }: RowProps) {
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
          <Typography sx={LABEL_SX}>{label}</Typography>
          {badge}
        </Box>
        <Typography sx={{ color: '#F4ECDD', fontSize: 14 }} noWrap>
          {value}
        </Typography>
        {note && (
          <Typography sx={{ color: '#C98F5B', fontSize: 11.5, mt: 0.5, lineHeight: 1.5 }}>
            {note}
          </Typography>
        )}
      </Box>

      <ButtonBase
        onClick={onClick}
        sx={{
          flexShrink: 0,
          px: 1.25,
          py: 0.5,
          borderRadius: '8px',
          fontSize: 12,
          fontWeight: 600,
          color: '#E7CE92',
          border: '1px solid rgba(231,206,146,0.28)',
        }}
      >
        {action}
      </ButtonBase>
    </Box>
  );
}
