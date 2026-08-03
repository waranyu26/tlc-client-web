import type { CollectionItem } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import { FadeUp, ThbAmount, CardFrame, RarityBadge, getRarityColor } from 'src/components/vault';

// ----------------------------------------------------------------------

const GRADE = 10;

export type VaultCardItemProps = {
  item: CollectionItem;
  index?: number;
  onSelect: (item: CollectionItem) => void;
};

export function VaultCardItem({ item, index = 0, onSelect }: VaultCardItemProps) {
  const { t } = useTranslation('vault');
  const color = getRarityColor(item.rarity);

  return (
    <FadeUp delay={Math.min(index, 8) * 0.04}>
      <ButtonBase
        onClick={() => onSelect(item)}
        sx={{
          width: '100%',
          display: 'block',
          textAlign: 'left',
          borderRadius: '4px',
        }}
      >
        <Box sx={{ position: 'relative', width: '100%' }}>
          <CardFrame imageUrl={item.image_url} rarity={item.rarity} alt={item.name} />

          <Box
            sx={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              borderRadius: '999px',
              background: 'rgba(11,11,13,0.78)',
              border: `1px solid ${color}`,
              boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            <Typography
              sx={{
                fontFamily: `'Space Grotesk Variable', sans-serif`,
                fontSize: '12px',
                fontWeight: 700,
                lineHeight: 1,
                color: '#E7CE92',
              }}
            >
              {GRADE}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ paddingTop: '8px' }}>
          <Typography noWrap sx={{ fontSize: '13px', fontWeight: 600, color: '#F4ECDD' }}>
            {item.name}
          </Typography>

          <RarityBadge rarity={item.rarity} sx={{ marginTop: '4px' }} />

          <Box sx={{ marginTop: '6px' }}>
            <Typography sx={{ fontSize: '10px', color: '#9A9285' }}>
              {t('buybackValue', { defaultValue: 'Buyback value' })}
            </Typography>
            <ThbAmount
              satang={item.buyback_price_satang}
              sx={{ fontSize: '14px', fontWeight: 600 }}
            />
          </Box>
        </Box>
      </ButtonBase>
    </FadeUp>
  );
}

export default VaultCardItem;
