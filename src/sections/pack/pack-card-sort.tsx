import type { PackCardItem } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export type PackCardSortKey = 'value' | 'name';

export const DEFAULT_PACK_CARD_SORT: PackCardSortKey = 'value';

/**
 * Order a rarity's manifest, sold-out entries last whichever key is picked.
 *
 * Sold-out is always the first key rather than one of the options: a card
 * nobody can win any more is a different kind of thing from an expensive one,
 * and letting it head the grid would advertise what the box no longer holds.
 * Within each half the chosen key decides, with the other as the tiebreak so
 * the order is total and cannot shuffle between renders.
 *
 * The server already returns value order, so this re-sorts rather than sorts —
 * but it is the same rule either way, which is what stops the default view and
 * a tapped-then-untapped view disagreeing.
 */
export function sortPackCards(cards: PackCardItem[], key: PackCardSortKey): PackCardItem[] {
  return [...cards].sort((a, b) => {
    if (a.sold_out !== b.sold_out) return a.sold_out ? 1 : -1;

    const byValue = b.buyback_price_satang - a.buyback_price_satang;
    const byName = a.name.localeCompare(b.name);

    return key === 'value' ? byValue || byName : byName || byValue;
  });
}

type Props = {
  value: PackCardSortKey;
  onChange: (key: PackCardSortKey) => void;
};

/**
 * Two chips, not a dropdown: there are exactly two orders worth offering, and a
 * select would hide the one you are not in behind a tap.
 */
export function PackCardSort({ value, onChange }: Props) {
  const { t } = useTranslation('pack');

  const options: { key: PackCardSortKey; label: string }[] = [
    { key: 'value', label: t('sort.value', { defaultValue: 'Value ↓' }) },
    { key: 'name', label: t('sort.name', { defaultValue: 'A–Z' }) },
  ];

  return (
    <Box
      role="group"
      aria-label={t('sort.label', { defaultValue: 'Sort cards' })}
      sx={{ display: 'flex', gap: '6px' }}
    >
      {options.map((option) => {
        const selected = value === option.key;

        return (
          <ButtonBase
            key={option.key}
            onClick={() => onChange(option.key)}
            aria-pressed={selected}
            sx={{
              px: '12px',
              py: '5px',
              borderRadius: '999px',
              border: `1px solid ${selected ? '#E7CE92' : 'rgba(231,206,146,0.22)'}`,
              backgroundColor: selected ? 'rgba(231,206,146,0.12)' : 'transparent',
              transition: 'border-color 160ms ease, background-color 160ms ease',
              '&:hover': { borderColor: 'rgba(231,206,146,0.55)' },
            }}
          >
            <Typography
              noWrap
              sx={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: selected ? '#E7CE92' : '#9A9285',
              }}
            >
              {option.label}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

export default PackCardSort;
