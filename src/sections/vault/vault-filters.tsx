import type { CollectionCategory } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import { PillGroup, countedPillOptions } from 'src/components/vault';

import { fieldSx } from 'src/sections/account/dialog-style';

// ----------------------------------------------------------------------

/** The value the "All" pills stand for; every real option is a uuid. */
export const VAULT_FILTER_ALL = '';

export type VaultFiltersProps = {
  /** The tree over the customer's own cards; the rows hide while it is empty. */
  tree: CollectionCategory[] | undefined;
  categoryId: string;
  seriesId: string;
  onCategoryChange: (id: string) => void;
  onSeriesChange: (id: string) => void;
  /** What is in the box right now; the caller debounces it into the query. */
  search: string;
  onSearchChange: (value: string) => void;
};

/**
 * The vault's category and collection rows and its search box. The same rows
 * as the store: the collection row only appears once a category is picked,
 * and every pill carries its card count.
 */
export function VaultFilters({
  tree,
  categoryId,
  seriesId,
  onCategoryChange,
  onSeriesChange,
  search,
  onSearchChange,
}: VaultFiltersProps) {
  const { t } = useTranslation('vault');

  const category = tree?.find((node) => node.id === categoryId);

  const categoryOptions = countedPillOptions(
    { value: VAULT_FILTER_ALL, label: t('category.all', { defaultValue: 'All' }) },
    tree ?? []
  );
  const seriesOptions = countedPillOptions(
    { value: VAULT_FILTER_ALL, label: t('series.all', { defaultValue: 'All collections' }) },
    category?.series ?? []
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
      {!!tree?.length && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
          <PillGroup
            options={categoryOptions}
            value={category?.id ?? VAULT_FILTER_ALL}
            onChange={onCategoryChange}
            label={t('category.label', { defaultValue: 'Categories' })}
          />
          {category && (
            <PillGroup
              options={seriesOptions}
              value={seriesId}
              onChange={onSeriesChange}
              label={t('series.label', { defaultValue: 'Collections' })}
            />
          )}
        </Box>
      )}

      <TextField
        size="small"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={t('search.placeholder', { defaultValue: 'Search cards, sets or collections' })}
        slotProps={{
          htmlInput: { 'aria-label': t('search.label', { defaultValue: 'Search your vault' }) },
        }}
        sx={fieldSx}
      />
    </Box>
  );
}

export default VaultFilters;
