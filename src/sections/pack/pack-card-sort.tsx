import type { PackCardItem } from 'src/api/types';
import type { PillOption } from 'src/components/vault';

import { useTranslation } from 'react-i18next';

import { PillGroup } from 'src/components/vault';

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

  const options: PillOption<PackCardSortKey>[] = [
    { value: 'value', label: t('sort.value', { defaultValue: 'Value ↓' }) },
    { value: 'name', label: t('sort.name', { defaultValue: 'A–Z' }) },
  ];

  // Two short pills always fit, so the row stays a plain flex row and keeps
  // its place on the heading's baseline.
  return (
    <PillGroup
      options={options}
      value={value}
      onChange={onChange}
      label={t('sort.label', { defaultValue: 'Sort cards' })}
      scroll={false}
    />
  );
}

export default PackCardSort;
