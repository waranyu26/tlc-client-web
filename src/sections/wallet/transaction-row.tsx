import type { Transaction } from 'src/api/types';
import type { IconifyName } from 'src/components/iconify';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { LiveDot, ThbAmount } from 'src/components/vault';

// ----------------------------------------------------------------------

const TYPE_ICON: Record<string, IconifyName> = {
  topup: 'solar:add-circle-bold',
  buyback: 'solar:wad-of-money-bold',
  pull: 'eva:trending-down-fill',
  pack_purchase: 'solar:cart-3-bold',
  promo_credit: 'eva:star-fill',
};

const FALLBACK_ICON: IconifyName = 'solar:bill-list-bold';

export type TransactionRowProps = {
  transaction: Transaction;
};

export function TransactionRow({ transaction }: TransactionRowProps) {
  const { t } = useTranslation('wallet');

  const isPending = transaction.status === 'pending';
  const isFailed = transaction.status === 'failed';
  const isSettled = transaction.status === 'completed';
  const isCredit = transaction.amount_satang >= 0;

  // A top-up that was cancelled or whose QR expired is not a failure: nothing
  // went wrong, and nothing was charged. Saying "Failed" in red about it is
  // what made an abandoned top-up look like a problem with the payment.
  const reason = failureReason(transaction.metadata);

  const time = new Date(transaction.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 0',
        borderBottom: '1px solid rgba(231,206,146,0.08)',
      }}
    >
      <Box
        sx={{
          width: '34px',
          height: '34px',
          flexShrink: 0,
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Muted until the entry has actually settled, for the same reason the
          // amount is: a green badge on a top-up nobody paid reads as money in.
          background: !isSettled
            ? 'rgba(154,146,133,0.10)'
            : isCredit
              ? 'rgba(111,191,142,0.10)'
              : 'rgba(201,96,91,0.10)',
          border: `1px solid ${
            !isSettled
              ? 'rgba(154,146,133,0.30)'
              : isCredit
                ? 'rgba(111,191,142,0.35)'
                : 'rgba(201,96,91,0.35)'
          }`,
        }}
      >
        <Iconify
          icon={TYPE_ICON[transaction.type] ?? FALLBACK_ICON}
          width={16}
          sx={{ color: !isSettled ? '#9A9285' : isCredit ? '#6FBF8E' : '#C9605B' }}
        />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontSize: '13.5px', fontWeight: 600, color: '#F4ECDD' }}>
          {t(`transactions.type.${transaction.type}`, { defaultValue: transaction.type })}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
          <Typography sx={{ fontSize: '11px', color: '#9A9285' }}>{time}</Typography>
          {isPending && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <LiveDot size={5} sx={{ bgcolor: '#E7CE92', boxShadow: '0 0 8px #E7CE92' }} />
              <Typography sx={{ fontSize: '11px', color: '#E7CE92', fontWeight: 600 }}>
                {t('transactions.status.pending', { defaultValue: 'Pending' })}
              </Typography>
            </Box>
          )}
          {isFailed && (
            <Typography
              sx={{
                fontSize: '11px',
                fontWeight: 600,
                color: reason === 'canceled' || reason === 'expired' ? '#9A9285' : '#C9605B',
              }}
            >
              {t(`transactions.status.${reason ?? 'failed'}`, { defaultValue: 'Failed' })}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <ThbAmount
          signed
          satang={transaction.amount_satang}
          // Only a settled entry moved money, so only a settled entry is
          // coloured like it did. A pending or abandoned top-up shown in
          // credit green reads as funds the customer does not have.
          tone={isSettled ? (isCredit ? 'success' : 'error') : 'default'}
          sx={{
            fontSize: '14px',
            fontWeight: 600,
            display: 'block',
            ...(!isSettled && { color: '#9A9285' }),
          }}
        />
        {isSettled && (
          <Typography sx={{ fontSize: '10.5px', color: '#4A4844', marginTop: '2px' }}>
            {t('transactions.balanceAfter', { defaultValue: 'Balance' })}:{' '}
            {`฿${(transaction.balance_after_satang / 100).toLocaleString('en-US')}`}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/**
 * Reads the `{"reason": …}` the server writes on a settled-unpaid top-up.
 *
 * Metadata is an opaque string on the wire, and an entry from an older row (or
 * another module) may have none or something else entirely — so anything
 * unrecognised simply yields no reason and the row falls back to "Failed".
 */
function failureReason(metadata: unknown): string | undefined {
  if (typeof metadata !== 'string' || metadata === '') return undefined;

  try {
    const parsed = JSON.parse(metadata) as { reason?: unknown };
    return typeof parsed.reason === 'string' ? parsed.reason : undefined;
  } catch {
    return undefined;
  }
}

export default TransactionRow;
