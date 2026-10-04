import type { StoreCard } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import { FadeUp, ThbAmount, CardFrame } from 'src/components/vault';

// ----------------------------------------------------------------------

/**
 * The store has no rarity tiers — a tier belongs to a pack, and these cards
 * are sold outside one — so every frame takes the brand gold rather than
 * implying a rarity the card was never given here.
 */
export const STORE_FRAME_TONE = 'legendary';

export type StoreCardItemProps = {
  card: StoreCard;
  index?: number;
  onSelect: (card: StoreCard) => void;
};

export function StoreCardItem({ card, index = 0, onSelect }: StoreCardItemProps) {
  const { t } = useTranslation('store');

  return (
    <FadeUp delay={Math.min(index, 8) * 0.04}>
      <ButtonBase
        onClick={() => onSelect(card)}
        sx={{ width: '100%', display: 'block', textAlign: 'left', borderRadius: '4px' }}
      >
        <CardFrame
          thumbUrl={card.thumb_url}
          imageUrl={card.image_url}
          rarity={STORE_FRAME_TONE}
          alt={card.name}
        />

        <Box sx={{ paddingTop: '8px' }}>
          <Typography noWrap sx={{ fontSize: '13px', fontWeight: 600, color: '#F4ECDD' }}>
            {card.name}
          </Typography>
          <Typography noWrap sx={{ fontSize: '11px', color: '#9A9285', mt: '2px' }}>
            {card.set_name}
          </Typography>

          {/* Only a unique slab has a grade; the other kinds say what they are. */}
          <Typography
            sx={{
              mt: '4px',
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#6F6A60',
            }}
          >
            {card.kind === 'unique' && card.psa_grade
              ? t('grade', { grade: card.psa_grade })
              : t(`kind.${card.kind}`)}
          </Typography>

          <ThbAmount
            satang={card.price_satang}
            sx={{
              display: 'block',
              mt: '6px',
              fontSize: '16px',
              fontWeight: 700,
              color: '#E7CE92',
            }}
          />
        </Box>
      </ButtonBase>
    </FadeUp>
  );
}

export default StoreCardItem;
