import type { CollectionItem } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import {
  FadeUp,
  ThbAmount,
  CardFrame,
  frameRarity,
  getRarityColor,
  CardOriginBadge,
} from 'src/components/vault';

// ----------------------------------------------------------------------

const GRADE = 10;

export type VaultCardItemProps = {
  item: CollectionItem;
  index?: number;
  onSelect: (item: CollectionItem) => void;
};

export function VaultCardItem({ item, index = 0, onSelect }: VaultCardItemProps) {
  const { t } = useTranslation('vault');
  const tone = frameRarity(item);
  const color = getRarityColor(tone);

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
          <CardFrame
            thumbUrl={item.thumb_url}
            imageUrl={item.image_url}
            rarity={tone}
            alt={item.name}
          />

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
            {/* Only a unique slab has a grade. A raw card or a sealed pack is
                a real thing in the vault with no certificate behind it, so the
                badge says what it is instead of implying a grade it never had. */}
            <Typography
              sx={{
                fontFamily: `'Space Grotesk Variable', sans-serif`,
                fontSize: item.kind === 'unique' ? '12px' : '7.5px',
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: item.kind === 'unique' ? 0 : '0.03em',
                color: '#E7CE92',
              }}
            >
              {item.kind === 'unique' ? GRADE : t(`kind.${item.kind}`)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ paddingTop: '8px' }}>
          <Typography noWrap sx={{ fontSize: '13px', fontWeight: 600, color: '#F4ECDD' }}>
            {item.name}
          </Typography>

          <CardOriginBadge item={item} sx={{ marginTop: '4px' }} />

          {/* A store card has no buyback value; its badge already says where
              it came from, so there is nothing to caption here. */}
          {item.buyback_eligible && (
            <Box sx={{ marginTop: '6px' }}>
              <Typography sx={{ fontSize: '10px', color: '#9A9285' }}>
                {t('buybackValue', { defaultValue: 'Buyback value' })}
              </Typography>
              <ThbAmount
                satang={item.buyback_price_satang}
                sx={{ fontSize: '14px', fontWeight: 600 }}
              />
            </Box>
          )}
        </Box>
      </ButtonBase>
    </FadeUp>
  );
}

export default VaultCardItem;
