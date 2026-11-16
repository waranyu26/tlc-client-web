import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type ActiveFilter = {
  key: string;
  label: string;
  onRemove: () => void;
};

type Props = {
  filters: ActiveFilter[];
  onClearAll: () => void;
};

/**
 * What is narrowing the shelf right now, one removable chip per filter. The
 * remove control is a real button with its own name, so it can be reached and
 * understood without seeing the ×.
 */
export function StoreActiveFilters({ filters, onClearAll }: Props) {
  const { t } = useTranslation('store');

  if (filters.length === 0) return null;

  return (
    <Box
      role="group"
      aria-label={t('filter.chips.label')}
      sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}
    >
      {filters.map((filter) => (
        <Box
          key={filter.key}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            maxWidth: '100%',
            pl: '12px',
            pr: '2px',
            borderRadius: '999px',
            border: '1px solid rgba(231,206,146,0.22)',
            backgroundColor: 'rgba(231,206,146,0.06)',
          }}
        >
          <Typography
            noWrap
            sx={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.02em', color: '#F4ECDD' }}
          >
            {filter.label}
          </Typography>
          <IconButton
            size="small"
            onClick={filter.onRemove}
            aria-label={t('filter.chips.remove', { label: filter.label })}
            sx={{
              color: '#9A9285',
              p: '4px',
              '&:hover': { color: '#E7CE92' },
              '&.Mui-focusVisible': { outline: '2px solid #E7CE92', outlineOffset: 2 },
            }}
          >
            <Iconify icon="mingcute:close-line" width={14} />
          </IconButton>
        </Box>
      ))}

      <ButtonBase
        onClick={onClearAll}
        sx={{
          px: '8px',
          py: '4px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#E7CE92',
          '&:hover': { textDecoration: 'underline' },
          // A bare ButtonBase draws no focus of its own.
          '&.Mui-focusVisible': { outline: '2px solid #E7CE92', outlineOffset: 2 },
        }}
      >
        {t('filter.chips.clearAll')}
      </ButtonBase>
    </Box>
  );
}

export default StoreActiveFilters;
