import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import { useRouter } from 'src/routes/hooks';

import en from 'src/i18n/locales/en/wallet.json';
import th from 'src/i18n/locales/th/wallet.json';
import { registerNamespace } from 'src/i18n/register';
import { READING_MAX_WIDTH } from 'src/layouts/vault/layout-config';

import { Iconify } from 'src/components/iconify';
import { SectionHeading } from 'src/components/vault';

import { TransactionsList } from 'src/sections/wallet/transactions-list';

registerNamespace('wallet', en, th);

// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useTranslation('wallet');
  const router = useRouter();

  return (
    <Box sx={{ width: '100%', maxWidth: READING_MAX_WIDTH, mx: { md: 'auto' } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <IconButton onClick={() => router.back()} size="small" sx={{ color: '#9A9285' }}>
          <Iconify icon="eva:arrow-ios-back-fill" width={20} />
        </IconButton>
        <SectionHeading>{t('transactions.title', { defaultValue: 'Transactions' })}</SectionHeading>
      </Box>

      <TransactionsList />
    </Box>
  );
}
