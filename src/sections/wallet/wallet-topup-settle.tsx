import type { IconifyName } from 'src/components/iconify';
import type { TopupStatus, TopupLedgerStatus } from 'src/api/types';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useTopupStatus } from 'src/api/wallet.api';

import { Iconify } from 'src/components/iconify';
import { ThbAmount, GhostButton, PrimaryButton } from 'src/components/vault';

// ----------------------------------------------------------------------

/**
 * What the customer sees from the moment they have been shown a QR code until
 * their wallet is credited — or until we can tell them plainly that it was
 * not.
 *
 * Everything here is driven by the server's view of the top-up. Stripe.js can
 * report an error for a payment that actually succeeded (pay in your banking
 * app, then close the QR sheet), so the only trustworthy answer to "did the
 * money arrive" is our own ledger.
 */
export type WalletTopupSettleProps = {
  intentId: string;
  /** Back to the amount step, keeping the dialog open. */
  onRetry: () => void;
  onClose: () => void;
  /** Cancel this top-up and close. */
  onCancel: () => void;
  /** Reports the outcome up, so closing the dialog knows not to void a paid top-up. */
  onSettled: (status: TopupLedgerStatus) => void;
};

export function WalletTopupSettle({
  intentId,
  onRetry,
  onClose,
  onCancel,
  onSettled,
}: WalletTopupSettleProps) {
  const { t } = useTranslation('wallet');
  const { data } = useTopupStatus(intentId);

  const status = data?.status ?? 'pending';

  useEffect(() => {
    if (status !== 'pending') onSettled(status);
    // onSettled is a setter; re-running on its identity would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '12px',
        padding: '28px 8px 8px',
      }}
    >
      {status === 'pending' && <PendingBadge />}
      {status !== 'pending' && <SettledBadge status={status} reason={data?.reason} />}

      <Typography
        sx={{
          fontFamily: `'Cormorant Garamond', serif`,
          fontSize: '21px',
          fontWeight: 600,
          color: '#F4ECDD',
        }}
      >
        {t(`topup.settle.${copyKey(status, data)}.title`)}
      </Typography>

      <Typography sx={{ fontSize: '13px', color: '#9A9285', maxWidth: '300px', lineHeight: 1.6 }}>
        {t(`topup.settle.${copyKey(status, data)}.body`)}
      </Typography>

      {status === 'completed' && data && (
        <ThbAmount
          satang={data.amount_satang}
          signed
          tone="success"
          sx={{ fontSize: '20px', fontWeight: 600, marginTop: '2px' }}
        />
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '100%',
          maxWidth: '260px',
          marginTop: '12px',
        }}
      >
        {status === 'pending' && (
          <GhostButton fullWidth onClick={onCancel}>
            {t('topup.settle.cancelCta')}
          </GhostButton>
        )}

        {status === 'completed' && (
          <PrimaryButton fullWidth onClick={onClose}>
            {t('topup.settle.doneCta')}
          </PrimaryButton>
        )}

        {status === 'failed' && (
          <>
            <PrimaryButton fullWidth onClick={onRetry}>
              {t('topup.settle.retryCta')}
            </PrimaryButton>
            <GhostButton fullWidth onClick={onClose} sx={{ border: 'none' }}>
              {t('topup.settle.closeCta')}
            </GhostButton>
          </>
        )}
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

/**
 * Which copy a state gets. A failed top-up is split by reason because the
 * three cases call for different things from the customer: scan the new QR,
 * try another method, or nothing at all because they cancelled it themselves.
 */
function copyKey(status: TopupLedgerStatus, data: TopupStatus | undefined): string {
  if (status === 'pending') return 'waiting';
  if (status === 'completed') return 'credited';
  return data?.reason === 'expired' || data?.reason === 'canceled' ? data.reason : 'failed';
}

function PendingBadge() {
  return (
    <Box sx={{ position: 'relative', display: 'flex' }}>
      <CircularProgress size={56} thickness={2} sx={{ color: 'rgba(231,206,146,0.55)' }} />
      <Box
        sx={{
          inset: 0,
          display: 'flex',
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Iconify icon="solar:clock-circle-bold" width={24} sx={{ color: '#E7CE92' }} />
      </Box>
    </Box>
  );
}

function SettledBadge({ status, reason }: { status: TopupLedgerStatus; reason?: string }) {
  const credited = status === 'completed';
  // A top-up the customer walked away from is not an error, so it does not get
  // the red treatment — nothing went wrong and nothing was charged.
  const benign = reason === 'canceled' || reason === 'expired';

  const icon: IconifyName = credited
    ? 'solar:check-circle-bold'
    : benign
      ? 'solar:clock-circle-bold'
      : 'solar:close-circle-bold';
  const color = credited ? '#6FBF8E' : benign ? '#9A9285' : '#C9605B';

  return (
    <Box
      sx={{
        width: '56px',
        height: '56px',
        display: 'flex',
        borderRadius: '999px',
        alignItems: 'center',
        justifyContent: 'center',
        background: `${color}1A`,
        border: `1px solid ${color}55`,
      }}
    >
      <Iconify icon={icon} width={28} sx={{ color }} />
    </Box>
  );
}

export default WalletTopupSettle;
