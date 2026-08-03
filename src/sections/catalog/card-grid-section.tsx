import type { BoxProps } from '@mui/material/Box';
import type { Card } from 'src/api/types';

import { useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { gridGap, cardGridColumns } from 'src/layouts/vault/layout-config';

import { FadeUp, SectionHeading, getRarityColor } from 'src/components/vault';

import { CatalogCardItem } from './catalog-card-item';

// ----------------------------------------------------------------------

const RARITY_RANK: Record<string, number> = {
  legendary: 0,
  mythic: 1,
  epic: 2,
  rare: 3,
  common: 4,
};

function rarityRank(rarity: string) {
  return RARITY_RANK[rarity.toLowerCase()] ?? 99;
}

function groupBySet(cards: Card[]): Map<string, Card[]> {
  const map = new Map<string, Card[]>();
  cards.forEach((card) => {
    const bucket = map.get(card.set_name) ?? [];
    bucket.push(card);
    map.set(card.set_name, bucket);
  });
  return map;
}

function groupByRarity(cards: Card[]): [string, Card[]][] {
  const map = new Map<string, Card[]>();
  cards.forEach((card) => {
    const bucket = map.get(card.rarity) ?? [];
    bucket.push(card);
    map.set(card.rarity, bucket);
  });
  return [...map.entries()].sort((a, b) => rarityRank(a[0]) - rarityRank(b[0]));
}

export type CardGridSectionProps = BoxProps & {
  cards: Card[];
};

export function CardGridSection({ cards, sx, ...other }: CardGridSectionProps) {
  const navigate = useNavigate();
  const bySet = groupBySet(cards);

  return (
    <Box
      sx={[
        { display: 'flex', flexDirection: 'column', gap: '26px' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {[...bySet.entries()].map(([setName, setCards]) => (
        <FadeUp key={setName}>
          <SectionHeading sx={{ mb: '12px' }}>{setName}</SectionHeading>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {groupByRarity(setCards).map(([rarity, rarityCards]) => {
              const color = getRarityColor(rarity);
              return (
                <Box key={rarity}>
                  <Typography
                    sx={{
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color,
                      mb: '8px',
                    }}
                  >
                    {rarity}
                  </Typography>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: cardGridColumns,
                      gap: gridGap,
                    }}
                  >
                    {rarityCards.map((card) => (
                      <CatalogCardItem
                        key={card.id}
                        card={card}
                        onClick={() => navigate(paths.card(card.id))}
                      />
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </FadeUp>
      ))}
    </Box>
  );
}

export default CardGridSection;
