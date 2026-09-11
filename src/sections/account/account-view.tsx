import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useMe } from 'src/api/user.api';
import en from 'src/i18n/locales/en/account.json';
import th from 'src/i18n/locales/th/account.json';
import { registerNamespace } from 'src/i18n/register';
import { signOut, deleteAccount } from 'src/api/auth.api';
import { useMusicPrefsStore } from 'src/store/music-prefs-store';

import { Iconify } from 'src/components/iconify';
import { ThbAmount, GhostButton, SectionHeading } from 'src/components/vault';

import { useAuthContext } from 'src/auth/hooks/use-auth-context';

import { DeleteAccountDialog } from './delete-account-dialog';

registerNamespace('account', en, th);

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

const ROW_SX = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
} as const;

const LANGUAGES = ['en', 'th'] as const;

export function AccountView() {
  const { t, i18n } = useTranslation('account');
  const router = useRouter();
  const { checkUserSession } = useAuthContext();
  const { data: profile, isLoading } = useMe();
  const musicEnabled = useMusicPrefsStore((state) => state.musicEnabled);
  const toggleMusic = useMusicPrefsStore((state) => state.toggleMusic);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleChangeLanguage = useCallback(
    (lng: (typeof LANGUAGES)[number]) => {
      i18n.changeLanguage(lng);
    },
    [i18n]
  );

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await signOut();
      await checkUserSession?.();
      router.push(paths.onboarding);
    } finally {
      setSigningOut(false);
    }
  }, [checkUserSession, router]);

  const handleDeleteAccount = useCallback(async () => {
    await deleteAccount();
    await signOut();
    await checkUserSession?.();
    router.push(paths.onboarding);
  }, [checkUserSession, router]);

  return (
    <Box sx={{ width: '100%', maxWidth: 720, mx: { md: 'auto' } }}>
      <SectionHeading sx={{ mb: 3 }}>{t('title')}</SectionHeading>

      <Box sx={{ ...PANEL_SX, p: 2.5, mb: 2.5 }}>
        {isLoading || !profile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Skeleton variant="text" width="60%" sx={{ bgcolor: 'rgba(231,206,146,0.08)' }} />
            <Skeleton variant="text" width="40%" sx={{ bgcolor: 'rgba(231,206,146,0.08)' }} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  borderRadius: '999px',
                  bgcolor: 'rgba(231,206,146,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:user-rounded-bold" width={24} sx={{ color: '#E7CE92' }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, color: '#F4ECDD', fontSize: 16 }} noWrap>
                  {profile.full_name}
                </Typography>
                <Typography sx={{ color: '#9A9285', fontSize: 12.5 }} noWrap>
                  {profile.email}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(231,206,146,0.08)' }} />

            <Box sx={ROW_SX}>
              <Typography sx={LABEL_SX}>{t('role')}</Typography>
              <Chip
                label={profile.role}
                size="small"
                sx={{
                  bgcolor: 'rgba(231,206,146,0.1)',
                  color: '#E7CE92',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              />
            </Box>

            <Box sx={ROW_SX}>
              <Typography sx={LABEL_SX}>{t('balance')}</Typography>
              <ThbAmount
                satang={profile.balance_satang}
                sx={{ fontWeight: 700, color: '#E7CE92', fontSize: 16 }}
              />
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ ...PANEL_SX, p: 2, mb: 2.5 }}>
        <Typography sx={{ ...LABEL_SX, mb: 1.5 }}>{t('language.label')}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {LANGUAGES.map((lng) => {
            const active = i18n.resolvedLanguage === lng;
            return (
              <ButtonBase
                key={lng}
                onClick={() => handleChangeLanguage(lng)}
                sx={{
                  flex: 1,
                  py: 1,
                  borderRadius: '10px',
                  fontSize: 13,
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: active ? '#E7CE92' : 'rgba(231,206,146,0.16)',
                  color: active ? '#E7CE92' : '#9A9285',
                  bgcolor: active ? 'rgba(231,206,146,0.08)' : 'transparent',
                }}
              >
                {t(`language.${lng}`)}
              </ButtonBase>
            );
          })}
        </Box>
      </Box>

      {/* Mirrors the top bar's music button. The bar is where you reach for it
          mid-session; this is where you look when you want to know what the
          site is allowed to do, so the setting has to be in both. */}
      <Box sx={{ ...PANEL_SX, p: 2, mb: 2.5 }}>
        <Typography sx={{ ...LABEL_SX, mb: 1.5 }}>{t('music.label')}</Typography>
        <Box sx={ROW_SX}>
          <Box sx={{ pr: 2 }}>
            <Typography sx={{ color: '#F4ECDD', fontSize: 13.5, fontWeight: 500 }}>
              {t('music.toggle')}
            </Typography>
            <Typography sx={{ color: '#9A9285', fontSize: 12, lineHeight: 1.5, mt: 0.25 }}>
              {t('music.description')}
            </Typography>
          </Box>
          <Switch
            checked={musicEnabled}
            onChange={toggleMusic}
            slotProps={{ input: { 'aria-label': t('music.toggle') } }}
          />
        </Box>
      </Box>

      <GhostButton
        fullWidth
        size="large"
        onClick={handleSignOut}
        disabled={signingOut}
        startIcon={
          signingOut ? (
            <CircularProgress size={16} sx={{ color: '#9A9285' }} />
          ) : (
            <Iconify icon="ic:round-power-settings-new" width={18} />
          )
        }
        sx={{ mb: 3 }}
      >
        {t('actions.signOut', { ns: 'common' })}
      </GhostButton>

      <Box
        sx={{
          border: '1px solid rgba(201,96,91,0.35)',
          borderRadius: '15px',
          p: 2.5,
          bgcolor: 'rgba(201,96,91,0.06)',
        }}
      >
        <Typography sx={{ ...LABEL_SX, color: '#C9605B', mb: 1 }}>{t('danger.heading')}</Typography>
        <Typography sx={{ color: '#9A9285', fontSize: 12.5, lineHeight: 1.6, mb: 2 }}>
          {t('danger.deleteBody')}
        </Typography>
        <ButtonBase
          onClick={() => setDeleteDialogOpen(true)}
          sx={{
            width: '100%',
            py: 1.4,
            borderRadius: '10px',
            fontSize: 13.5,
            fontWeight: 600,
            border: '1px solid rgba(201,96,91,0.45)',
            color: '#C9605B',
            '&:hover': { bgcolor: 'rgba(201,96,91,0.1)' },
          }}
        >
          {t('danger.deleteTitle')}
        </ButtonBase>
      </Box>

      <Typography sx={{ fontSize: 11, color: '#4A4844', mt: 3, lineHeight: 1.6 }}>
        {t('privacyNote')}
      </Typography>

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </Box>
  );
}

export default AccountView;
