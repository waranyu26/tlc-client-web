import type { PackCardItem, PackRarityOdds } from 'src/api/types';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import { usePackRarityCards } from 'src/api/pack.api';
import { gridGap, cardGridColumns } from 'src/layouts/vault/layout-config';

import { CardFrame, SectionHeading, CARD_ASPECT_RATIO } from 'src/components/vault';

import { PackRarityTiles } from './pack-rarity-tiles';
import { PackCardDetailDialog } from './pack-card-detail-dialog';

// ----------------------------------------------------------------------

type Props = {
  packId: string;
  rarityOdds: PackRarityOdds[];
  selectedRarity: string;
  onSelectRarity: (rarityCode: string) => void;
};

/**
 * Odds and the cards behind them, on the page rather than behind a tap.
 *
 * A tier's card list used to open in a bottom drawer, which meant comparing two
 * tiers was a sequence of modals and the page itself carried a separate "chase"
 * strip duplicating the rarest one. Selecting a tile now just swaps the grid
 * below it, so the odds and what they buy are read in one place.
 *
 * The grid is the full manifest — everything the tier was stocked with,
 * including cards someone has already pulled. There is deliberately no sold-out
 * marker and no surviving count: a buyer should see what they could win without
 * being handed a map of what is left to win.
 */
export function PackRarityBrowser({ packId, rarityOdds, selectedRarity, onSelectRarity }: Props) {
  const { t } = useTranslation('pack');
  const query = usePackRarityCards(packId, selectedRarity);

  // One dialog for the whole manifest — a modal per tile would put dozens in
  // the tree for a pack with a large pool.
  const [inspecting, setInspecting] = useState<PackCardItem | null>(null);

  const tier = rarityOdds.find((odds) => odds.rarity_code === selectedRarity);
  const tierName = query.data?.display_name || tier?.display_name || selectedRarity;
  const cards = query.data?.cards ?? [];

  return (
    <Box>
      <SectionHeading sx={{ mb: '4px' }}>
        {t('odds.title', { defaultValue: 'Pull rates' })}
      </SectionHeading>

      <Typography sx={{ fontSize: '11.5px', color: '#9A9285', mb: '16px' }}>
        {/* Disclosed, not buried: if a tier empties, its share is redistributed
            over the tiers that still have cards, so the published numbers stay
            a whole. Saying so is the difference between a rule and a surprise. */}
        {t('odds.redistribution', {
          defaultValue:
            'If a tier sells out, its share is split proportionally across the tiers that still have cards.',
        })}
      </Typography>

      <PackRarityTiles
        rarityOdds={rarityOdds}
        selectedRarity={selectedRarity}
        onSelectRarity={onSelectRarity}
      />

      <Box
        sx={{
          mt: { xs: 3, md: 4 },
          mb: '14px',
          display: 'flex',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <SectionHeading sx={{ fontSize: '22px' }}>
          {t('manifest.title', { defaultValue: 'Cards in this pack' })}
        </SectionHeading>

        <Typography sx={{ fontSize: '12px', color: '#9A9285' }}>
          {t('manifest.scope', {
            tier: tierName,
            count: tier?.card_count ?? cards.length,
            defaultValue: '{{tier}} · {{count}} cards',
          })}
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: gridGap, gridTemplateColumns: cardGridColumns }}>
        {query.isPending
          ? [...Array(10)].map((_, index) => (
              <Skeleton
                key={index}
                variant="rounded"
                sx={{ width: '100%', aspectRatio: CARD_ASPECT_RATIO }}
              />
            ))
          : cards.map((card) => (
              <ButtonBase
                key={card.card_id}
                onClick={() => setInspecting(card)}
                aria-label={card.name}
                sx={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  borderRadius: '8px',
                  transition: 'transform 160ms ease',
                  '&:hover': { transform: 'translateY(-3px)' },
                }}
              >
                <CardFrame
                  thumbUrl={card.thumb_url}
                  imageUrl={card.image_url}
                  rarity={card.rarity_code}
                  alt={card.name}
                />

                <Typography
                  noWrap
                  sx={{ mt: '8px', fontSize: '12px', fontWeight: 600, color: '#F4ECDD' }}
                >
                  {card.name}
                </Typography>

                <Typography noWrap sx={{ fontSize: '10.5px', color: '#9A9285' }}>
                  {card.psa_cert_number
                    ? t('rarity.graded', {
                        grade: card.psa_grade || '—',
                        defaultValue: 'PSA {{grade}}',
                      })
                    : card.set_name}
                </Typography>
              </ButtonBase>
            ))}
      </Box>

      <PackCardDetailDialog
        card={inspecting}
        rarityName={tierName}
        onClose={() => setInspecting(null)}
      />
    </Box>
  );
}

export default PackRarityBrowser;
