import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTransactions } from 'src/api/transaction.api';

import { Iconify } from 'src/components/iconify';
import { SectionHeading } from 'src/components/vault';

import { TransactionRow } from './transaction-row';

// ----------------------------------------------------------------------

const PREVIEW_LIMIT = 5;

export function WalletTransactionsPreview() {
  const { t } = useTranslation('wallet');
  const router = useRouter();
  const { data, isPending } = useTransactions({ page: 1, limit: PREVIEW_LIMIT });

  const items = data?.data ?? [];

  return (
    <Box
      sx={{
        borderRadius: '15px',
        border: '1px solid rgba(231,206,146,0.16)',
        background: '#17161B',
        padding: '18px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SectionHeading sx={{ fontSize: '20px' }}>
          {t('recentActivity', { defaultValue: 'Recent Activity' })}
        </SectionHeading>

        <Box
          component="button"
          type="button"
          onClick={() => router.push(paths.transactions)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#E7CE92',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          {t('viewAll', { defaultValue: 'View all' })}
          <Iconify icon="carbon:chevron-right" width={14} />
        </Box>
      </Box>

      <Box sx={{ marginTop: '4px' }}>
        {isPending &&
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              height={58}
              sx={{ bgcolor: 'rgba(231,206,146,0.06)', borderRadius: '8px', marginTop: '10px' }}
            />
          ))}

        {!isPending && items.length === 0 && (
          <Typography sx={{ fontSize: '13px', color: '#9A9285', padding: '16px 0' }}>
            {t('empty', { defaultValue: 'No transactions yet' })}
          </Typography>
        )}

        {!isPending &&
          items.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
      </Box>
    </Box>
  );
}

export default WalletTransactionsPreview;
