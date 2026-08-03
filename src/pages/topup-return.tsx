import type { IconifyName } from 'src/components/iconify';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import en from 'src/i18n/locales/en/wallet.json';
import th from 'src/i18n/locales/th/wallet.json';
import { queryClient } from 'src/lib/query-client';
import { useWalletBalance } from 'src/api/wallet.api';
import { registerNamespace } from 'src/i18n/register';

import { Iconify } from 'src/components/iconify';
import { GhostButton, PrimaryButton } from 'src/components/vault';

registerNamespace('wallet', en, th);

// ----------------------------------------------------------------------

type ReturnState = 'success' | 'processing' | 'failed' | 'unknown';

const STATE_CONFIG: Record<
  ReturnState,
  { icon: IconifyName; color: string; titleKey: string; bodyKey: string }
> = {
  success: {
    icon: 'solar:check-circle-bold',
    color: '#6FBF8E',
    titleKey: 'return.successTitle',
    bodyKey: 'return.successBody',
  },
  processing: {
    icon: 'solar:clock-circle-bold',
    color: '#E7CE92',
    titleKey: 'return.processingTitle',
    bodyKey: 'return.processingBody',
  },
  failed: {
    icon: 'solar:close-circle-bold',
    color: '#C9605B',
    titleKey: 'return.failedTitle',
    bodyKey: 'return.failedBody',
  },
  unknown: {
    icon: 'solar:danger-triangle-bold',
    color: '#9A9285',
    titleKey: 'return.unknownTitle',
    bodyKey: 'return.unknownBody',
  },
};

function resolveState(redirectStatus: string | null): ReturnState {
  if (redirectStatus === 'succeeded') return 'success';
  if (redirectStatus === 'processing') return 'processing';
  if (redirectStatus === 'requires_payment_method' || redirectStatus === 'canceled')
    return 'failed';
  return 'unknown';
}

export default function Page() {
  const { t } = useTranslation('wallet');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetch } = useWalletBalance();

  const redirectStatus = searchParams.get('redirect_status');
  const state = resolveState(redirectStatus);
  const config = STATE_CONFIG[state];

  useEffect(() => {
    // Refresh balance + history so the wallet/transactions screens reflect the new payment.
    refetch();
    queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '14px',
        padding: '64px 24px',
        minHeight: { md: '60vh' },
        justifyContent: { md: 'center' },
      }}
    >
      <Box
        sx={{
          width: '64px',
          height: '64px',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${config.color}1A`,
          border: `1px solid ${config.color}55`,
        }}
      >
        <Iconify icon={config.icon} width={32} sx={{ color: config.color }} />
      </Box>

      <Typography
        sx={{
          fontFamily: `'Cormorant Garamond', serif`,
          fontSize: '24px',
          fontWeight: 600,
          color: '#F4ECDD',
        }}
      >
        {t(config.titleKey, { defaultValue: 'Payment status' })}
      </Typography>

      <Typography sx={{ fontSize: '13.5px', color: '#9A9285', maxWidth: '300px', lineHeight: 1.6 }}>
        {t(config.bodyKey, { defaultValue: '' })}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '100%',
          maxWidth: '280px',
          marginTop: '10px',
        }}
      >
        <PrimaryButton fullWidth onClick={() => router.push(paths.home)}>
          {t('return.goHome', { defaultValue: 'Go home' })}
        </PrimaryButton>
        <GhostButton fullWidth onClick={() => router.push(paths.wallet)}>
          {t('return.goWallet', { defaultValue: 'Back to wallet' })}
        </GhostButton>
      </Box>
    </Box>
  );
}
