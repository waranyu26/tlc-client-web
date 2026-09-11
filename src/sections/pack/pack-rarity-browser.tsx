import type { PackCardSortKey } from './pack-card-sort';
import type { PackCardItem, PackRarityOdds } from 'src/api/types';

import { useMemo, useState } from 'react';
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
import { PackCardSort, sortPackCards, DEFAULT_PACK_CARD_SORT } from './pack-card-sort';

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
 *
 * It opens on the dearest card, because that is the one a customer came to see;
 * A–Z is there for the other reading, looking up whether a particular card is
 * in the box. Either way a sold-out entry sorts to the end. The card's value is
 * in its dialog rather than under its thumbnail — a grid of prices reads as a
 * shop, and this is a manifest of what a pull can give you.
 */
export function PackRarityBrowser({ packId, rarityOdds, selectedRarity, onSelectRarity }: Props) {
  const { t } = useTranslation('pack');
  const query = usePackRarityCards(packId, selectedRarity);

  // One dialog for the whole manifest — a modal per tile would put dozens in
  // the tree for a pack with a large pool.
  const [inspecting, setInspecting] = useState<PackCardItem | null>(null);

  const [sortKey, setSortKey] = useState<PackCardSortKey>(DEFAULT_PACK_CARD_SORT);

  const tier = rarityOdds.find((odds) => odds.rarity_code === selectedRarity);
  const tierName = query.data?.display_name || tier?.display_name || selectedRarity;

  const cards = useMemo(
    () => sortPackCards(query.data?.cards ?? [], sortKey),
    [query.data?.cards, sortKey]
  );

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

        {/* Pushed to the end of the row so the heading keeps the left edge the
            rest of the page is aligned to, and wraps under it on a phone. */}
        <Box sx={{ ml: 'auto' }}>
          <PackCardSort value={sortKey} onChange={setSortKey} />
        </Box>
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
                  // A sold-out card stays tappable — the dialog is provenance,
                  // and people want to look at what came out of a box — but it
                  // does not lift, because the lift is an affordance for
                  // something you can still get.
                  '&:hover': { transform: card.sold_out ? 'none' : 'translateY(-3px)' },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardFrame
                    thumbUrl={card.thumb_url}
                    imageUrl={card.image_url}
                    rarity={card.rarity_code}
                    alt={card.name}
                    soldOut={card.sold_out}
                  />

                  {card.sold_out && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%) rotate(-7deg)',
                        px: '8px',
                        py: '3px',
                        borderRadius: '4px',
                        border: '1px solid rgba(244,236,221,0.45)',
                        backgroundColor: 'rgba(11,11,13,0.82)',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#F4ECDD',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t('rarity.soldOut', { defaultValue: 'Sold out' })}
                    </Box>
                  )}
                </Box>

                <Typography
                  noWrap
                  sx={{
                    mt: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: card.sold_out ? '#9A9285' : '#F4ECDD',
                  }}
                >
                  {card.name}
                </Typography>

                <Typography noWrap sx={{ fontSize: '10.5px', color: '#9A9285' }}>
                  {/* A sealed pack or a raw card has no certificate to show,
                      and saying "PSA —" would read as a missing grade rather
                      than as a different kind of thing. */}
                  {card.kind !== 'unique'
                    ? t(`rarity.kind.${card.kind}`)
                    : card.psa_cert_number
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
