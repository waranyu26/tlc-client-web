import type { IconifyName } from 'src/components/iconify';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import en from 'src/i18n/locales/en/wallet.json';
import th from 'src/i18n/locales/th/wallet.json';
import { useTopupStatus } from 'src/api/wallet.api';
import { registerNamespace } from 'src/i18n/register';

import { Iconify } from 'src/components/iconify';
import { ThbAmount, GhostButton, PrimaryButton } from 'src/components/vault';

registerNamespace('wallet', en, th);

// ----------------------------------------------------------------------
// Where a redirect-based payment method comes back to.
//
// The page deliberately ignores Stripe's `redirect_status` parameter. That
// parameter describes the browser navigation, not the money: it was the reason
// this screen could congratulate someone who had just closed a QR code without
// paying. What it uses instead is `payment_intent`, which names the top-up, and
// then asks our own ledger — the only place that knows whether a wallet was
// credited. While the answer is still pending the poll keeps running, so the
// balance appears here by itself rather than after a manual reload.
// ----------------------------------------------------------------------

type ReturnState = 'success' | 'processing' | 'canceled' | 'expired' | 'failed' | 'unknown';

const STATE_CONFIG: Record<ReturnState, { icon: IconifyName; color: string; key: string }> = {
  success: { icon: 'solar:check-circle-bold', color: '#6FBF8E', key: 'success' },
  processing: { icon: 'solar:clock-circle-bold', color: '#E7CE92', key: 'processing' },
  // Nothing went wrong in these two, and nothing was charged, so they get the
  // muted treatment rather than an alarming red one.
  canceled: { icon: 'solar:clock-circle-bold', color: '#9A9285', key: 'canceled' },
  expired: { icon: 'solar:clock-circle-bold', color: '#9A9285', key: 'expired' },
  failed: { icon: 'solar:close-circle-bold', color: '#C9605B', key: 'failed' },
  unknown: { icon: 'solar:danger-triangle-bold', color: '#9A9285', key: 'unknown' },
};

export default function Page() {
  const { t } = useTranslation('wallet');
  const router = useRouter();
  const searchParams = useSearchParams();

  const intentId = searchParams.get('payment_intent') ?? undefined;
  const { data, isError } = useTopupStatus(intentId);

  const state = resolveState(intentId, data?.status, data?.reason, isError);
  const config = STATE_CONFIG[state];

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
        {t(`return.${config.key}Title`, { defaultValue: 'Payment status' })}
      </Typography>

      <Typography sx={{ fontSize: '13.5px', color: '#9A9285', maxWidth: '300px', lineHeight: 1.6 }}>
        {t(`return.${config.key}Body`, { defaultValue: '' })}
      </Typography>

      {state === 'success' && data && (
        <ThbAmount
          satang={data.amount_satang}
          signed
          tone="success"
          sx={{ fontSize: '20px', fontWeight: 600 }}
        />
      )}

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

// ----------------------------------------------------------------------

/**
 * Turns the ledger's answer into a screen.
 *
 * An unknown state is reserved for the two cases where we genuinely cannot
 * tell: a return with no intent to look up, and a top-up this account does not
 * own. Everything else, including "still waiting", is something we can say
 * honestly — and none of it claims success without the ledger saying so.
 */
function resolveState(
  intentId: string | undefined,
  status: string | undefined,
  reason: string | undefined,
  isError: boolean
): ReturnState {
  if (!intentId || isError) return 'unknown';
  if (status === 'completed') return 'success';
  if (status === 'failed') {
    if (reason === 'canceled') return 'canceled';
    if (reason === 'expired') return 'expired';
    return 'failed';
  }
  // No answer yet, or a genuinely pending payment: both mean "we are checking".
  return 'processing';
}
