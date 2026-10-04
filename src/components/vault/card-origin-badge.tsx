import type { BoxProps } from '@mui/material/Box';
import type { CollectionItem } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import en from 'src/i18n/locales/en/vault.json';
import th from 'src/i18n/locales/th/vault.json';
import { registerNamespace } from 'src/i18n/register';

import { RarityBadge } from './rarity-badge';

// ----------------------------------------------------------------------

// The badge is shown on delivery and home as well as the vault, so it carries
// the namespace it reads rather than relying on the vault page having loaded.
registerNamespace('vault', en, th);

/**
 * A store card has no rarity — a tier belongs to a pack, and these cards were
 * never in one — so its frame takes the brand gold instead of implying a tier.
 * Same tone the store itself uses for every tile.
 */
export const STORE_FRAME_TONE = 'legendary';

type Origin = Pick<CollectionItem, 'rarity' | 'acquired_via'>;

/** The `rarity` to hand a `CardFrame` for a vault card. */
export function frameRarity(item: Origin): string {
  return item.acquired_via === 'store' ? STORE_FRAME_TONE : item.rarity;
}

export type CardOriginBadgeProps = Omit<BoxProps<'span'>, 'children'> & {
  item: Origin;
};

/** The rarity badge for a pulled card; a "Store" badge for a bought one. */
export function CardOriginBadge({ item, ...other }: CardOriginBadgeProps) {
  const { t } = useTranslation('vault');

  if (item.acquired_via === 'store') {
    return (
      <RarityBadge
        rarity={t('storeBadge', { defaultValue: 'Store' })}
        tone={STORE_FRAME_TONE}
        {...other}
      />
    );
  }

  return <RarityBadge rarity={item.rarity} {...other} />;
}

export default CardOriginBadge;
