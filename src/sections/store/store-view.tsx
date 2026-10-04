import './i18n';

import type { StoreCard } from 'src/api/types';
import type { StoreSort } from 'src/api/store.api';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';

import { useStoreCards } from 'src/api/store.api';
import { useFeatures } from 'src/api/features.api';
import { gridGap, sectionGap, cardGridColumns } from 'src/layouts/vault/layout-config';

import { GhostButton, SectionHeading, FeatureDisabledView } from 'src/components/vault';

import { fieldSx } from 'src/sections/account/dialog-style';

import { StoreCardItem } from './store-card-item';
import { StoreBuyDialog } from './store-buy-dialog';

// ----------------------------------------------------------------------

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;
const SORTS: StoreSort[] = ['newest', 'price_asc', 'price_desc'];

// Roughly a screen's worth of tiles, so the grid holds its shape while loading.
const SKELETON_COUNT = 10;

// ----------------------------------------------------------------------

export function StoreView() {
  const { t } = useTranslation('store');
  const { features, isLoading: featuresLoading } = useFeatures();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<StoreSort>('newest');
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<StoreCard | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const cardsQuery = useStoreCards({
    page,
    pageSize: PAGE_SIZE,
    sort,
    search: search || undefined,
  });

  // Typing should not fire a request per keystroke, and a new search starts
  // from the first page.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Held back until the switches are known: the fallback says the store is
  // off, and flashing the closed sign at someone about to shop is worse than
  // a moment of skeletons.
  if (!featuresLoading && !features.store) {
    return <FeatureDisabledView feature="store" />;
  }

  const cards = cardsQuery.data?.data ?? [];
  const totalPages = Math.ceil((cardsQuery.data?.totalRecord ?? 0) / PAGE_SIZE);

  const handleSelect = (card: StoreCard) => {
    setSelected(card);
    setDialogOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>
      <Box>
        <SectionHeading>{t('title')}</SectionHeading>
        <Typography sx={{ color: '#9A9285', fontSize: '13px', mt: '4px' }}>
          {t('subtitle')}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
        <TextField
          size="small"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder={t('search.placeholder')}
          slotProps={{ htmlInput: { 'aria-label': t('search.label') } }}
          sx={{ ...fieldSx, flex: 1 }}
        />

        <TextField
          select
          size="small"
          label={t('sort.label')}
          value={sort}
          onChange={(event) => {
            setSort(event.target.value as StoreSort);
            setPage(1);
          }}
          sx={{ ...fieldSx, minWidth: { sm: 200 } }}
        >
          {SORTS.map((option) => (
            <MenuItem key={option} value={option}>
              {t(`sort.${option}`)}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {cardsQuery.isError && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '48px 18px',
          }}
        >
          <Typography sx={{ fontSize: '14px', color: '#9A9285' }}>{t('error.title')}</Typography>
          <GhostButton onClick={() => cardsQuery.refetch()}>{t('error.retry')}</GhostButton>
        </Box>
      )}

      {cardsQuery.isPending && (
        <Box sx={{ display: 'grid', gridTemplateColumns: cardGridColumns, gap: gridGap }}>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              sx={{ width: '100%', aspectRatio: '52 / 105', borderRadius: '4px' }}
            />
          ))}
        </Box>
      )}

      {cardsQuery.isSuccess && cards.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            padding: '48px 18px',
            borderRadius: '15px',
            border: '1px solid rgba(231,206,146,0.16)',
            background: '#17161B',
          }}
        >
          <Typography
            sx={{
              fontFamily: `'Cormorant Garamond', serif`,
              fontSize: '22px',
              fontWeight: 600,
              color: '#F4ECDD',
            }}
          >
            {t('empty.title')}
          </Typography>
          <Typography sx={{ mt: '8px', fontSize: '13px', color: '#9A9285' }}>
            {t('empty.subtitle')}
          </Typography>
        </Box>
      )}

      {cards.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: cardGridColumns, gap: gridGap }}>
          {cards.map((card, index) => (
            <StoreCardItem key={card.id} card={card} index={index} onSelect={handleSelect} />
          ))}
        </Box>
      )}

      {totalPages > 1 && (
        <Pagination
          page={page}
          count={totalPages}
          onChange={(_, value) => setPage(value)}
          sx={{ alignSelf: 'center' }}
        />
      )}

      <StoreBuyDialog card={selected} open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}

export default StoreView;
