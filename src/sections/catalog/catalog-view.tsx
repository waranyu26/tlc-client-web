import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import { typeScale } from 'src/theme/type-scale';
import en from 'src/i18n/locales/en/catalog.json';
import th from 'src/i18n/locales/th/catalog.json';
import { registerNamespace } from 'src/i18n/register';
import { useCards, useRarities } from 'src/api/catalog.api';
import { sectionGap, FILTER_RAIL_WIDTH } from 'src/layouts/vault/layout-config';

import { SectionHeading } from 'src/components/vault';

import { CardGridSection } from './card-grid-section';
import { RarityProbabilityPanel } from './rarity-probability-panel';
import { CatalogFilters, ALL_FILTER_VALUE } from './catalog-filters';

registerNamespace('catalog', en, th);

// ----------------------------------------------------------------------
// Grouping (by set, then rarity) happens client-side over a single generous
// page (pageSize 200) rather than the paginated response, since the feature
// spec calls for grouped display rather than an infinite/paginated list.
// ----------------------------------------------------------------------

const CATALOG_PAGE_SIZE = 200;

export function CatalogView() {
  const { t } = useTranslation('catalog');

  const [selectedSet, setSelectedSet] = useState(ALL_FILTER_VALUE);
  const [selectedRarity, setSelectedRarity] = useState(ALL_FILTER_VALUE);

  const allCardsQuery = useCards({ pageSize: CATALOG_PAGE_SIZE });
  const raritiesQuery = useRarities();

  const filteredQuery = useCards({
    pageSize: CATALOG_PAGE_SIZE,
    set_name: selectedSet !== ALL_FILTER_VALUE ? selectedSet : undefined,
    rarity: selectedRarity !== ALL_FILTER_VALUE ? selectedRarity : undefined,
  });

  const sets = useMemo(() => {
    const names = new Set((allCardsQuery.data?.data ?? []).map((card) => card.set_name));
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [allCardsQuery.data]);

  const cards = filteredQuery.data?.data ?? [];
  const isLoading = filteredQuery.isPending;
  const isError = filteredQuery.isError;

  return (
    <Box>
      <SectionHeading>{t('title', { defaultValue: 'Catalog' })}</SectionHeading>
      <Typography sx={{ ...typeScale.label, color: '#9A9285', mt: '4px', mb: sectionGap }}>
        {t('subtitle', { defaultValue: 'Every card audited and vaulted before listing.' })}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          alignItems: 'start',
          gap: sectionGap,
          // Filters become a sticky left rail once there's room beside the grid.
          gridTemplateColumns: { xs: '1fr', lg: `${FILTER_RAIL_WIDTH}px minmax(0, 1fr)` },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            position: { lg: 'sticky' },
            top: { lg: 88 },
          }}
        >
          <CatalogFilters
            sets={sets}
            selectedSet={selectedSet}
            onSetChange={setSelectedSet}
            rarities={raritiesQuery.data ?? []}
            selectedRarity={selectedRarity}
            onRarityChange={setSelectedRarity}
          />

          <RarityProbabilityPanel rarities={raritiesQuery.data ?? []} />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          {isLoading && (
            <Typography sx={{ ...typeScale.body, color: '#9A9285' }}>
              {t('state.loading', { defaultValue: 'Loading catalog…' })}
            </Typography>
          )}

          {isError && (
            <Alert severity="error">
              {t('state.error', { defaultValue: "Couldn't load the catalog." })}
            </Alert>
          )}

          {!isLoading && !isError && cards.length === 0 && (
            <Typography sx={{ ...typeScale.body, color: '#9A9285' }}>
              {t('state.empty', { defaultValue: 'No cards match these filters.' })}
            </Typography>
          )}

          {!isLoading && !isError && cards.length > 0 && <CardGridSection cards={cards} />}
        </Box>
      </Box>
    </Box>
  );
}

export default CatalogView;
