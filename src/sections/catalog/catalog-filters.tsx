import type { BoxProps } from '@mui/material/Box';
import type { RarityTier } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

const ALL = 'all';

export type CatalogFiltersProps = BoxProps & {
  sets: string[];
  selectedSet: string;
  onSetChange: (value: string) => void;
  rarities: RarityTier[];
  selectedRarity: string;
  onRarityChange: (value: string) => void;
};

export function CatalogFilters({
  sets,
  selectedSet,
  onSetChange,
  rarities,
  selectedRarity,
  onRarityChange,
  sx,
  ...other
}: CatalogFiltersProps) {
  const { t } = useTranslation('catalog');

  return (
    <Box
      sx={[
        { display: 'flex', flexDirection: 'column', gap: '10px' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <TextField
        select
        size="small"
        label={t('filters.setLabel', { defaultValue: 'Set' })}
        value={selectedSet}
        onChange={(event) => onSetChange(event.target.value)}
        sx={{
          '& .MuiOutlinedInput-root': { borderRadius: '10px' },
        }}
      >
        <MenuItem value={ALL}>{t('filters.allSets', { defaultValue: 'All sets' })}</MenuItem>
        {sets.map((set) => (
          <MenuItem key={set} value={set}>
            {set}
          </MenuItem>
        ))}
      </TextField>

      <Box sx={{ display: 'flex', gap: '8px', overflowX: 'auto', pb: '2px' }}>
        <Chip
          label={t('filters.allRarities', { defaultValue: 'All' })}
          onClick={() => onRarityChange(ALL)}
          color={selectedRarity === ALL ? 'primary' : 'default'}
          variant={selectedRarity === ALL ? 'filled' : 'outlined'}
          size="small"
        />
        {rarities.map((rarity) => (
          <Chip
            key={rarity.id}
            label={rarity.display_name}
            onClick={() => onRarityChange(rarity.code)}
            color={selectedRarity === rarity.code ? 'primary' : 'default'}
            variant={selectedRarity === rarity.code ? 'filled' : 'outlined'}
            size="small"
            sx={{ flexShrink: 0 }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default CatalogFilters;
export { ALL as ALL_FILTER_VALUE };
