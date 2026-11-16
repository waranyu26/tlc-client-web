import './i18n';

import type { StoreCard } from 'src/api/types';
import type { StoreSort } from 'src/api/store.api';
import type { ActiveFilter } from './store-active-filters';
import type { StoreParamKey, StoreSheetFilters } from './store-filters';

import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';

import { formatThb } from 'src/utils/format-currency';

import { useFeatures } from 'src/api/features.api';
import { useStoreCards, useStoreCategories } from 'src/api/store.api';
import { gridGap, sectionGap, cardGridColumns } from 'src/layouts/vault/layout-config';

import { Iconify } from 'src/components/iconify';
import {
  PillGroup,
  GhostButton,
  SectionHeading,
  countedPillOptions,
  FeatureDisabledView,
} from 'src/components/vault';

import { fieldSx } from 'src/sections/account/dialog-style';

import { StoreBuyDialog } from './store-buy-dialog';
import { StoreFilterSheet } from './store-filter-sheet';
import { StoreActiveFilters } from './store-active-filters';
import { StoreCardItem, StoreCardSkeleton } from './store-card-item';
import {
  STORE_SORTS,
  satangToBaht,
  countSheetFilters,
  parseStoreFilters,
  DEFAULT_STORE_SORT,
} from './store-filters';

// ----------------------------------------------------------------------

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

// The value the "All" pills stand for; every real option is a uuid.
const ALL = '';

// Roughly a screen's worth of tiles, so the grid holds its shape while loading.
const SKELETON_COUNT = 10;

// Rows stretch to the tallest tile and each tile fills its cell, so a grid of
// slabs, raw cards and sealed packs reads as one even shelf.
const storeGridSx = {
  display: 'grid',
  gridTemplateColumns: cardGridColumns,
  gridAutoRows: '1fr',
  alignItems: 'stretch',
  gap: gridGap,
} as const;

const emptyPanelSx = {
  textAlign: 'center',
  padding: '48px 18px',
  borderRadius: '15px',
  border: '1px solid rgba(231,206,146,0.16)',
  background: '#17161B',
} as const;

const emptyTitleSx = {
  fontFamily: `'Cormorant Garamond', serif`,
  fontSize: '22px',
  fontWeight: 600,
  color: '#F4ECDD',
} as const;

const priceLabel = (satang: number) => formatThb(satang, { decimals: satang % 100 !== 0 });

// ----------------------------------------------------------------------

export function StoreView() {
  const { t } = useTranslation('store');
  const { features, isLoading: featuresLoading } = useFeatures();

  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseStoreFilters(searchParams), [searchParams]);

  const [searchInput, setSearchInput] = useState(filters.q);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [selected, setSelected] = useState<StoreCard | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const categoriesQuery = useStoreCategories();
  const tree = categoriesQuery.data;

  // Once the tree is in, a category or collection it doesn't list (emptied
  // since the link was shared, or never real) is dropped rather than left as
  // an invisible filter. Until then, the link's ids are trusted.
  const category = tree?.find((node) => node.id === filters.category);
  const series = category?.series.find((node) => node.id === filters.series);
  const categoryId = tree ? category?.id : filters.category;
  const seriesId = tree ? series?.id : filters.series;

  const sheetFilters = useMemo<StoreSheetFilters>(
    () => ({
      kind: filters.kind,
      graded: filters.graded,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
    }),
    [filters.kind, filters.graded, filters.minPrice, filters.maxPrice]
  );
  const sheetCount = countSheetFilters(sheetFilters);

  const cardsQuery = useStoreCards({
    page: filters.page,
    pageSize: PAGE_SIZE,
    sort: filters.sort,
    search: filters.q || undefined,
    category_id: categoryId,
    series_id: seriesId,
    kind: filters.kind,
    graded: filters.graded || undefined,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
  });

  /**
   * Writes to the query string. Any change but a page turn starts again from
   * page one. Pushes by default so Back undoes a filter; the search box
   * replaces, or every pause in typing would become a history entry.
   */
  const updateParams = useCallback(
    (changes: Partial<Record<StoreParamKey, string>>, options?: { replace?: boolean }) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        (Object.keys(changes) as StoreParamKey[]).forEach((key) => {
          const value = changes[key];
          if (value) next.set(key, value);
          else next.delete(key);
        });
        if (!('page' in changes)) next.delete('page');
        return next;
      }, options);
    },
    [setSearchParams]
  );

  // The effects below read these through refs so they fire on what they are
  // about (typing, Back) and not whenever the router hands out a new setter.
  const latest = useRef({ q: filters.q, updateParams });
  latest.current = { q: filters.q, updateParams };

  // Typing should not fire a request per keystroke; the settled text goes to
  // the URL, which is what the query reads.
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = searchInput.trim();
      if (next !== latest.current.q) latest.current.updateParams({ q: next }, { replace: true });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ...and the box follows the URL when it changes underneath it: Back, a
  // removed chip, Clear all.
  useEffect(() => {
    setSearchInput((current) => (current.trim() === filters.q ? current : filters.q));
  }, [filters.q]);

  // A link to a page past the end (the shelf shrank since) lands on the last
  // real page instead of an empty one that looks like a bare store.
  const totalRecord = cardsQuery.data?.totalRecord ?? 0;
  const totalPages = Math.ceil(totalRecord / PAGE_SIZE);
  const settled = cardsQuery.isSuccess && !cardsQuery.isPlaceholderData;
  useEffect(() => {
    if (settled && filters.page > 1 && filters.page > totalPages) {
      latest.current.updateParams(
        { page: totalPages > 1 ? String(totalPages) : '' },
        { replace: true }
      );
    }
  }, [settled, filters.page, totalPages]);

  // Held back until the switches are known: the fallback says the store is
  // off, and flashing the closed sign at someone about to shop is worse than
  // a moment of skeletons.
  if (!featuresLoading && !features.store) {
    return <FeatureDisabledView feature="store" />;
  }

  const cards = cardsQuery.data?.data ?? [];

  const handleSelect = (card: StoreCard) => {
    setSelected(card);
    setDialogOpen(true);
  };

  // A new category has its own collections, so the old one cannot carry over.
  // Re-tapping the current pill is a no-op rather than a duplicate history entry.
  const selectCategory = (id: string) => {
    if (id !== (category?.id ?? ALL)) updateParams({ category: id, series: '' });
  };
  const selectSeries = (id: string) => {
    if (id !== (series?.id ?? ALL)) updateParams({ series: id });
  };

  const applySheet = (next: StoreSheetFilters) => {
    updateParams({
      kind: next.kind ?? '',
      graded: next.graded ? 'true' : '',
      min: next.minPrice !== undefined ? satangToBaht(next.minPrice) : '',
      max: next.maxPrice !== undefined ? satangToBaht(next.maxPrice) : '',
    });
    setSheetOpen(false);
  };

  // Sort is how the shelf is ordered, not what is on it, so it survives.
  const clearAll = () => {
    setSearchInput('');
    updateParams({
      category: '',
      series: '',
      q: '',
      kind: '',
      graded: '',
      min: '',
      max: '',
    });
  };

  const activeFilters: ActiveFilter[] = [];
  if (category) {
    activeFilters.push({
      key: 'category',
      label: category.name,
      onRemove: () => selectCategory(ALL),
    });
  }
  if (series) {
    activeFilters.push({ key: 'series', label: series.name, onRemove: () => selectSeries(ALL) });
  }
  if (filters.q) {
    activeFilters.push({
      key: 'q',
      label: t('filter.chips.search', { query: filters.q }),
      onRemove: () => {
        setSearchInput('');
        updateParams({ q: '' });
      },
    });
  }
  if (filters.kind) {
    activeFilters.push({
      key: 'kind',
      label: t(`filter.kind.${filters.kind}`),
      onRemove: () => updateParams({ kind: '' }),
    });
  }
  if (filters.graded) {
    activeFilters.push({
      key: 'graded',
      label: t('filter.graded'),
      onRemove: () => updateParams({ graded: '' }),
    });
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const { minPrice, maxPrice } = filters;
    let label: string;
    if (minPrice !== undefined && maxPrice !== undefined) {
      label = t('filter.chips.priceRange', {
        min: priceLabel(minPrice),
        max: priceLabel(maxPrice),
      });
    } else if (minPrice !== undefined) {
      label = t('filter.chips.priceMin', { min: priceLabel(minPrice) });
    } else {
      label = t('filter.chips.priceMax', { max: priceLabel(maxPrice!) });
    }
    activeFilters.push({ key: 'price', label, onRemove: () => updateParams({ min: '', max: '' }) });
  }

  const filtered = !!categoryId || !!seriesId || !!filters.q || sheetCount > 0;

  const categoryOptions = countedPillOptions({ value: ALL, label: t('category.all') }, tree ?? []);
  const seriesOptions = countedPillOptions(
    { value: ALL, label: t('series.all') },
    category?.series ?? []
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>
      <Box>
        <SectionHeading>{t('title')}</SectionHeading>
        <Typography sx={{ color: '#9A9285', fontSize: '13px', mt: '4px' }}>
          {t('subtitle')}
        </Typography>
      </Box>

      {!!tree?.length && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
          <PillGroup
            options={categoryOptions}
            value={category?.id ?? ALL}
            onChange={selectCategory}
            label={t('category.label')}
          />
          {category && (
            <PillGroup
              options={seriesOptions}
              value={series?.id ?? ALL}
              onChange={selectSeries}
              label={t('series.label')}
            />
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
          <TextField
            size="small"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t('search.placeholder')}
            slotProps={{ htmlInput: { 'aria-label': t('search.label') } }}
            sx={{ ...fieldSx, flex: 1 }}
          />

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              select
              size="small"
              label={t('sort.label')}
              value={filters.sort}
              onChange={(event) => {
                const next = event.target.value as StoreSort;
                updateParams({ sort: next === DEFAULT_STORE_SORT ? '' : next });
              }}
              sx={{ ...fieldSx, flex: { xs: 1, sm: 'none' }, minWidth: { sm: 200 } }}
            >
              {STORE_SORTS.map((option) => (
                <MenuItem key={option} value={option}>
                  {t(`sort.${option}`)}
                </MenuItem>
              ))}
            </TextField>

            <GhostButton
              onClick={() => setSheetOpen(true)}
              aria-haspopup="dialog"
              aria-label={sheetCount ? t('filter.buttonActive', { count: sheetCount }) : undefined}
              startIcon={<Iconify icon="ic:round-filter-list" width={18} />}
              sx={{
                flexShrink: 0,
                py: 0,
                px: '14px',
                fontSize: '13px',
                ...(sheetCount > 0 && {
                  color: '#E7CE92',
                  borderColor: 'rgba(231,206,146,0.4)',
                }),
              }}
            >
              {t('filter.button')}
              {sheetCount > 0 && (
                <Box
                  component="span"
                  aria-hidden
                  sx={{
                    ml: '8px',
                    minWidth: 18,
                    height: 18,
                    px: '5px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#0B0B0D',
                    backgroundColor: '#E7CE92',
                  }}
                >
                  {sheetCount}
                </Box>
              )}
            </GhostButton>
          </Box>
        </Box>

        <StoreActiveFilters filters={activeFilters} onClearAll={clearAll} />
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
        <Box sx={storeGridSx}>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <StoreCardSkeleton key={index} />
          ))}
        </Box>
      )}

      {cardsQuery.isSuccess && cards.length === 0 && !filtered && (
        <Box sx={emptyPanelSx}>
          <Typography sx={emptyTitleSx}>{t('empty.title')}</Typography>
          <Typography sx={{ mt: '8px', fontSize: '13px', color: '#9A9285' }}>
            {t('empty.subtitle')}
          </Typography>
        </Box>
      )}

      {cardsQuery.isSuccess && cards.length === 0 && filtered && (
        <Box sx={emptyPanelSx}>
          <Typography sx={emptyTitleSx}>{t('empty.filteredTitle')}</Typography>
          <Typography sx={{ mt: '8px', fontSize: '13px', color: '#9A9285' }}>
            {t('empty.filteredSubtitle')}
          </Typography>
          <GhostButton onClick={clearAll} sx={{ mt: '16px', py: '9px' }}>
            {t('empty.filteredClear')}
          </GhostButton>
        </Box>
      )}

      {cards.length > 0 && (
        <Box sx={storeGridSx}>
          {cards.map((card, index) => (
            <StoreCardItem key={card.id} card={card} index={index} onSelect={handleSelect} />
          ))}
        </Box>
      )}

      {totalPages > 1 && (
        <Pagination
          page={filters.page}
          count={totalPages}
          onChange={(_, value) => updateParams({ page: value > 1 ? String(value) : '' })}
          sx={{ alignSelf: 'center' }}
        />
      )}

      <StoreFilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        value={sheetFilters}
        onApply={applySheet}
      />

      <StoreBuyDialog card={selected} open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}

export default StoreView;
