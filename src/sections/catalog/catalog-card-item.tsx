import type { BoxProps } from '@mui/material/Box';
import type { Card } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { CardFrame, ThbAmount, RarityBadge } from 'src/components/vault';

// ----------------------------------------------------------------------

export type CatalogCardItemProps = Omit<BoxProps, 'children'> & {
  card: Card;
};

export function CatalogCardItem({ card, sx, ...other }: CatalogCardItemProps) {
  const { t } = useTranslation('catalog');
  const outOfStock = card.stock_count <= 0;

  return (
    <Box
      sx={[
        {
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <CardFrame imageUrl={card.image_url} rarity={card.rarity} alt={card.name} />

      <Typography
        sx={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#F4ECDD',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {card.name}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <RarityBadge rarity={card.rarity} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: '9px', color: '#9A9285', textTransform: 'uppercase' }}>
            {t('card.buyback', { defaultValue: 'Buyback' })}
          </Typography>
          <ThbAmount
            satang={card.buyback_price_satang}
            tone="success"
            sx={{ fontSize: '12px', fontWeight: 700 }}
          />
        </Box>

        <Typography
          sx={{
            fontSize: '10px',
            color: outOfStock ? '#C9605B' : '#9A9285',
            textAlign: 'right',
          }}
        >
          {outOfStock
            ? t('card.outOfStock', { defaultValue: 'Out of stock' })
            : t('card.stock', { count: card.stock_count, defaultValue: '{{count}} in stock' })}
        </Typography>
      </Box>
    </Box>
  );
}

export default CatalogCardItem;
