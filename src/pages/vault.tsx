import type { CollectionItem } from 'src/api/types';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Pagination from '@mui/material/Pagination';

import en from 'src/i18n/locales/en/vault.json';
import th from 'src/i18n/locales/th/vault.json';
import { registerNamespace } from 'src/i18n/register';
import { sectionGap } from 'src/layouts/vault/layout-config';
import { useCollection, useWholeCollection, useCollectionCategories } from 'src/api/catalog.api';

import { GhostButton } from 'src/components/vault';
import { LoadingScreen } from 'src/components/loading-screen';

import { VaultGrid } from 'src/sections/vault/vault-grid';
import { VaultActionsSheet } from 'src/sections/vault/vault-actions-sheet';
import { VaultPortfolioHero } from 'src/sections/vault/vault-portfolio-hero';
import { VaultFilters, VAULT_FILTER_ALL } from 'src/sections/vault/vault-filters';
import { VaultEmptyState, VaultFilteredEmptyState } from 'src/sections/vault/vault-empty-state';

registerNamespace('vault', en, th);

// ----------------------------------------------------------------------

/** The same page size as the store grid. */
const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useTranslation('vault');

  const [categoryChoice, setCategoryChoice] = useState(VAULT_FILTER_ALL);
  const [seriesChoice, setSeriesChoice] = useState(VAULT_FILTER_ALL);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // The hero values the whole vault, whatever the grid is filtered to.
  const wholeQuery = useWholeCollection();
  const tree = useCollectionCategories().data;

  // A category or collection the tree no longer lists (its last card was just
  // sold or shipped) is dropped rather than left as an invisible filter.
  const category = tree?.find((node) => node.id === categoryChoice);
  const series = category?.series.find((node) => node.id === seriesChoice);

  const pageQuery = useCollection({
    page,
    pageSize: PAGE_SIZE,
    category_id: category?.id,
    series_id: series?.id,
    search: search || undefined,
  });

  const [selected, setSelected] = useState<CollectionItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  // Typing should not fire a request per keystroke; only the settled text
  // reaches the query, and a new search starts from page one.
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = searchInput.trim();
      if (next !== search) {
        setSearch(next);
        setPage(1);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, search]);

  // Selling or shipping the last card on the last page would leave an empty
  // page that reads as an empty vault; step back to the last real one.
  const totalPages = Math.ceil((pageQuery.data?.totalRecord ?? 0) / PAGE_SIZE);
  const settled = pageQuery.isSuccess && !pageQuery.isPlaceholderData;
  useEffect(() => {
    if (settled && page > 1 && page > totalPages) setPage(Math.max(totalPages, 1));
  }, [settled, page, totalPages]);

  const allItems = wholeQuery.data ?? [];
  const items = pageQuery.data?.data ?? [];
  const filtered = !!category || !!search;

  // A new category has its own collections, so the old one cannot carry over.
  const selectCategory = (id: string) => {
    if (id === (category?.id ?? VAULT_FILTER_ALL)) return;
    setCategoryChoice(id);
    setSeriesChoice(VAULT_FILTER_ALL);
    setPage(1);
  };
  const selectSeries = (id: string) => {
    if (id === (series?.id ?? VAULT_FILTER_ALL)) return;
    setSeriesChoice(id);
    setPage(1);
  };
  const clearFilters = () => {
    setCategoryChoice(VAULT_FILTER_ALL);
    setSeriesChoice(VAULT_FILTER_ALL);
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

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

  if (wholeQuery.isPending || pageQuery.isPending) {
    return <LoadingScreen sx={{ minHeight: '60vh' }} />;
  }

  if (wholeQuery.isError || pageQuery.isError) {
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
        <GhostButton
          onClick={() => {
            wholeQuery.refetch();
            pageQuery.refetch();
          }}
        >
          {t('error.retry', { defaultValue: 'Retry' })}
        </GhostButton>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>
      <VaultPortfolioHero items={allItems} />

      {allItems.length === 0 ? (
        <VaultEmptyState />
      ) : (
        <>
          <VaultFilters
            tree={tree}
            categoryId={category?.id ?? VAULT_FILTER_ALL}
            seriesId={series?.id ?? VAULT_FILTER_ALL}
            onCategoryChange={selectCategory}
            onSeriesChange={selectSeries}
            search={searchInput}
            onSearchChange={setSearchInput}
          />

          {items.length > 0 && <VaultGrid items={items} onSelect={handleSelect} />}

          {items.length === 0 && filtered && <VaultFilteredEmptyState onClear={clearFilters} />}

          {totalPages > 1 && (
            <Pagination
              page={page}
              count={totalPages}
              onChange={(_, value) => setPage(value)}
              sx={{ alignSelf: 'center' }}
            />
          )}
        </>
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
