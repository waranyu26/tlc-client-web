import type { Transaction } from 'src/api/types';

import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { useTransactions } from 'src/api/transaction.api';

import { GhostButton } from 'src/components/vault';

import { TransactionRow } from './transaction-row';

// ----------------------------------------------------------------------

const PAGE_SIZE = 20;

const FILTER_TYPES = ['topup', 'buyback', 'pull', 'pack_purchase', 'promo_credit'] as const;

/** Group transactions by calendar day, preserving server order within each group. */
function groupByDate(items: Transaction[]) {
  const groups = new Map<string, Transaction[]>();

  items.forEach((tx) => {
    const key = new Date(tx.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const existing = groups.get(key);
    if (existing) {
      existing.push(tx);
    } else {
      groups.set(key, [tx]);
    }
  });

  return Array.from(groups.entries());
}

export function TransactionsList() {
  const { t } = useTranslation('wallet');
  const [type, setType] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Transaction[]>([]);
  const [totalRecord, setTotalRecord] = useState(0);

  const { data, isPending, isFetching } = useTransactions({ type, page, limit: PAGE_SIZE });

  // Append (or replace, for page 1) whenever a new page of results lands.
  useEffect(() => {
    if (!data) return;
    setTotalRecord(data.totalRecord);
    setItems((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const grouped = useMemo(() => groupByDate(items), [items]);
  const hasMore = items.length < totalRecord;

  const handleFilter = (nextType: string | undefined) => {
    setType(nextType);
    setPage(1);
    setItems([]);
  };

  const handleLoadMore = () => setPage((prev) => prev + 1);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        <Chip
          label={t('transactions.filterAll', { defaultValue: 'All' })}
          onClick={() => handleFilter(undefined)}
          sx={{
            bgcolor: !type ? 'rgba(231,206,146,0.16)' : 'transparent',
            border: '1px solid rgba(231,206,146,0.16)',
            color: !type ? '#E7CE92' : '#9A9285',
            fontWeight: 600,
          }}
        />
        {FILTER_TYPES.map((filterType) => (
          <Chip
            key={filterType}
            label={t(`transactions.type.${filterType}`, { defaultValue: filterType })}
            onClick={() => handleFilter(filterType)}
            sx={{
              bgcolor: type === filterType ? 'rgba(231,206,146,0.16)' : 'transparent',
              border: '1px solid rgba(231,206,146,0.16)',
              color: type === filterType ? '#E7CE92' : '#9A9285',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          />
        ))}
      </Box>

      <Box sx={{ marginTop: '14px' }}>
        {isPending &&
          Array.from({ length: 6 }).map((_, index) => (
             
            <Skeleton
              key={index}
              variant="rectangular"
              height={58}
              sx={{ bgcolor: 'rgba(231,206,146,0.06)', borderRadius: '8px', marginTop: '10px' }}
            />
          ))}

        {!isPending && items.length === 0 && (
          <Typography
            sx={{ fontSize: '13px', color: '#9A9285', padding: '32px 0', textAlign: 'center' }}
          >
            {t('transactions.empty', { defaultValue: 'No transactions found' })}
          </Typography>
        )}

        {!isPending &&
          grouped.map(([dateLabel, txs]) => (
            <Box key={dateLabel} sx={{ marginBottom: '18px' }}>
              <Typography
                sx={{
                  fontSize: '10.5px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: '#4A4844',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                {dateLabel}
              </Typography>
              {txs.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </Box>
          ))}

        {hasMore && (
          <GhostButton
            fullWidth
            onClick={handleLoadMore}
            disabled={isFetching}
            sx={{ marginTop: '8px' }}
          >
            {t('transactions.loadMore', { defaultValue: 'Load more' })}
          </GhostButton>
        )}
      </Box>
    </Box>
  );
}

export default TransactionsList;
