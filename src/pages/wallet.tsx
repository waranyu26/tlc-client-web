import { useState } from 'react';

import Box from '@mui/material/Box';

import en from 'src/i18n/locales/en/wallet.json';
import th from 'src/i18n/locales/th/wallet.json';
import { useWalletBalance } from 'src/api/wallet.api';
import { registerNamespace } from 'src/i18n/register';
import { sectionGap } from 'src/layouts/vault/layout-config';

import { WalletTopupDialog } from 'src/sections/wallet/wallet-topup-dialog';
import { WalletBalanceHero } from 'src/sections/wallet/wallet-balance-hero';
import { WalletTransactionsPreview } from 'src/sections/wallet/wallet-transactions-preview';

registerNamespace('wallet', en, th);

// ----------------------------------------------------------------------

export default function Page() {
  const { data, isPending } = useWalletBalance();
  const [topupOpen, setTopupOpen] = useState(false);

  return (
    <Box
      sx={{
        display: 'grid',
        alignItems: 'start',
        gap: sectionGap,
        // Desktop: balance and actions on the left, history alongside it.
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 5fr) minmax(0, 7fr)' },
      }}
    >
      <Box sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
        <WalletBalanceHero
          balanceSatang={data?.balance_satang}
          loading={isPending}
          onAddFunds={() => setTopupOpen(true)}
        />
      </Box>

      <WalletTransactionsPreview />

      <WalletTopupDialog open={topupOpen} onClose={() => setTopupOpen(false)} />
    </Box>
  );
}
