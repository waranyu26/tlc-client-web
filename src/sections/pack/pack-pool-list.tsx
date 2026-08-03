import type { BoxProps } from '@mui/material/Box';
import type { PackCardItem } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { formatThb } from 'src/utils/format-currency';

import { CardFrame, SectionHeading, getRarityColor } from 'src/components/vault';

// ----------------------------------------------------------------------

export type PackPoolListProps = BoxProps & {
  cards: PackCardItem[];
};

/**
 * Exactly what is inside the box, card by card, with how many of each are left.
 * These counts ARE the odds — a card with 2 of 10 remaining is a 20% pull — so
 * showing them is what makes the advertised rates auditable (FR8/FR9/FR10).
 */
export function PackPoolList({ cards, sx, ...other }: PackPoolListProps) {
  const { t } = useTranslation('pack');

  return (
    <Box sx={[{}, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
      <SectionHeading sx={{ mb: '12px' }}>
        {t('pool.title', { defaultValue: "What's inside" })}
      </SectionHeading>

      <Box
        sx={{
          display: 'grid',
          gap: '12px',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
        }}
      >
        {cards.map((card) => {
          const soldOut = card.remaining <= 0;

          return (
            <Box
              key={card.card_id}
              sx={{
                borderRadius: '12px',
                border: '1px solid rgba(231,206,146,0.14)',
                bgcolor: '#111019',
                padding: '10px',
                opacity: soldOut ? 0.45 : 1,
              }}
            >
              <CardFrame imageUrl={card.image_url} rarity={card.rarity} alt={card.name} />

              <Typography
                noWrap
                sx={{ fontSize: '12px', color: '#F4ECDD', fontWeight: 600, mt: '8px' }}
              >
                {card.name}
              </Typography>

              <Typography
                sx={{
                  fontSize: '10px',
                  color: getRarityColor(card.rarity),
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  mt: '2px',
                }}
              >
                {card.rarity}
              </Typography>

              <Box
                sx={{
                  mt: '6px',
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: '6px',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '11px',
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    color: soldOut ? '#C9605B' : '#E7CE92',
                  }}
                >
                  {soldOut
                    ? t('pool.gone', { defaultValue: 'All pulled' })
                    : t('pool.left', {
                        remaining: card.remaining,
                        total: card.quantity_total,
                        defaultValue: '{{remaining}}/{{total}} left',
                      })}
                </Typography>

                <Typography
                  sx={{ fontSize: '10px', color: '#9A9285', fontVariantNumeric: 'tabular-nums' }}
                >
                  {(card.odds_bps / 100).toFixed(2)}%
                </Typography>
              </Box>

              <Typography sx={{ fontSize: '10px', color: '#5A5550', mt: '2px' }}>
                {t('pool.buyback', {
                  amount: formatThb(card.buyback_price_satang),
                  defaultValue: 'Buyback {{amount}}',
                })}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default PackPoolList;
