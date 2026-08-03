import type { CollectionItem } from 'src/api/types';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import en from 'src/i18n/locales/en/vault.json';
import th from 'src/i18n/locales/th/vault.json';
import { useCollection } from 'src/api/catalog.api';
import { registerNamespace } from 'src/i18n/register';
import { sectionGap } from 'src/layouts/vault/layout-config';

import { GhostButton } from 'src/components/vault';
import { LoadingScreen } from 'src/components/loading-screen';

import { VaultGrid } from 'src/sections/vault/vault-grid';
import { VaultEmptyState } from 'src/sections/vault/vault-empty-state';
import { VaultActionsSheet } from 'src/sections/vault/vault-actions-sheet';
import { VaultPortfolioHero } from 'src/sections/vault/vault-portfolio-hero';

registerNamespace('vault', en, th);

// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useTranslation('vault');
  const { data, isPending, isError, refetch } = useCollection();

  const [selected, setSelected] = useState<CollectionItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const items = data ?? [];

  const handleSelect = (item: CollectionItem) => {
    setSelected(item);
    setSheetOpen(true);
  };

  const handleSold = (amountSatang: number) => {
    setSnackbar({
      open: true,
      message: t('sheet.soldBody', {
        amount: `฿${(amountSatang / 100).toLocaleString('en-US')}`,
        defaultValue: `฿${(amountSatang / 100).toLocaleString('en-US')} added to your wallet.`,
      }),
    });
  };

  if (isPending) {
    return <LoadingScreen sx={{ minHeight: '60vh' }} />;
  }

  if (isError) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          padding: '48px 18px',
        }}
      >
        <Box sx={{ fontSize: '14px', color: '#9A9285' }}>
          {t('error.title', { defaultValue: "Couldn't load your vault" })}
        </Box>
        <GhostButton onClick={() => refetch()}>
          {t('error.retry', { defaultValue: 'Retry' })}
        </GhostButton>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>
      <VaultPortfolioHero items={items} />

      {items.length === 0 ? (
        <VaultEmptyState />
      ) : (
        <VaultGrid items={items} onSelect={handleSelect} />
      )}

      <VaultActionsSheet
        item={selected}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSold={handleSold}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ background: '#6FBF8E', color: '#0B0B0D' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
