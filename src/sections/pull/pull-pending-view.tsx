import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { FadeUp, GhostButton, PrimaryButton } from 'src/components/vault';

// ----------------------------------------------------------------------
// Interrupted / pending pull state (Journey 2): shown when the pull request
// errors or the network drops mid-flight. The mutation was fired with a fixed
// Idempotency-Key, so retrying is always safe — never double-charges the user.
// ----------------------------------------------------------------------

export type PullPendingViewProps = {
  isChecking: boolean;
  onCheckStatus: () => void;
  onRetry: () => void;
  message?: string | null;
  messageTone?: 'neutral' | 'success' | 'error';
};

export function PullPendingView({
  isChecking,
  onCheckStatus,
  onRetry,
  message,
  messageTone = 'neutral',
}: PullPendingViewProps) {
  const { t } = useTranslation('pull');

  const messageColor =
    messageTone === 'success' ? '#6FBF8E' : messageTone === 'error' ? '#C9605B' : '#9A9285';

  return (
    <Box
      sx={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '18px',
        padding: '32px 20px',
      }}
    >
      <FadeUp>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(231,206,146,0.10)',
            border: '1px solid rgba(231,206,146,0.28)',
          }}
        >
          <Iconify icon="solar:clock-circle-bold" width={30} sx={{ color: '#E7CE92' }} />
        </Box>
      </FadeUp>

      <FadeUp delay={0.06}>
        <Box
          sx={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            maxWidth: 300,
          }}
        >
          <Typography
            sx={{
              fontFamily: `'Cormorant Garamond', serif`,
              fontSize: '22px',
              fontWeight: 600,
              color: '#F4ECDD',
            }}
          >
            {t('pending.title')}
          </Typography>
          <Typography sx={{ fontSize: '12.5px', color: '#9A9285', lineHeight: 1.6 }}>
            {t('pending.body')}
          </Typography>
        </Box>
      </FadeUp>

      {message ? (
        <Typography sx={{ fontSize: '12px', color: messageColor, textAlign: 'center' }}>
          {message}
        </Typography>
      ) : null}

      <Box
        sx={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        <PrimaryButton
          fullWidth
          onClick={onCheckStatus}
          disabled={isChecking}
          startIcon={
            isChecking ? <CircularProgress size={16} sx={{ color: '#0B0B0D' }} /> : undefined
          }
        >
          {isChecking ? t('pending.checking') : t('pending.checkStatus')}
        </PrimaryButton>
        <GhostButton fullWidth onClick={onRetry} disabled={isChecking}>
          {t('pending.retry')}
        </GhostButton>
      </Box>
    </Box>
  );
}

export default PullPendingView;
