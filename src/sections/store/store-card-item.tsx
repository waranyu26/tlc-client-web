import type { StoreCard } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import { FadeUp, ThbAmount, CardFrame, STORE_FRAME_TONE } from 'src/components/vault';

// ----------------------------------------------------------------------
// Every tile is the same size, whatever it holds.
//
// Slabs, raw cards and sealed packs arrive in different aspect ratios and with
// names of one line or three, so a tile that sized itself to its content made a
// ragged grid. Instead the media area is a fixed 5:7 box (the art is drawn
// `contain`, centred on the frame's own backdrop) and each text row has a fixed
// height. The skeleton is built from the same constants, so loading never jumps.
// ----------------------------------------------------------------------

const MEDIA_ASPECT_RATIO = '5 / 7';

const NAME_LINE_HEIGHT_PX = 17;
const NAME_LINES = 2;
const SET_ROW_HEIGHT_PX = 16;
const FOOTER_ROW_HEIGHT_PX = 24;

export type StoreCardItemProps = {
  card: StoreCard;
  index?: number;
  onSelect: (card: StoreCard) => void;
};

export function StoreCardItem({ card, index = 0, onSelect }: StoreCardItemProps) {
  const { t } = useTranslation('store');

  return (
    <FadeUp delay={Math.min(index, 8) * 0.04} style={{ height: '100%' }}>
      <ButtonBase
        onClick={() => onSelect(card)}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          textAlign: 'left',
          borderRadius: '4px',
        }}
      >
        <CardFrame
          thumbUrl={card.thumb_url}
          imageUrl={card.image_url}
          rarity={STORE_FRAME_TONE}
          alt={card.name}
          sx={{ aspectRatio: MEDIA_ASPECT_RATIO, flexShrink: 0 }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', pt: '8px' }}>
          <Typography
            title={card.name}
            sx={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#F4ECDD',
              lineHeight: `${NAME_LINE_HEIGHT_PX}px`,
              height: `${NAME_LINE_HEIGHT_PX * NAME_LINES}px`,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: NAME_LINES,
              wordBreak: 'break-word',
            }}
          >
            {card.name}
          </Typography>

          <Typography
            noWrap
            sx={{
              fontSize: '11px',
              color: '#9A9285',
              lineHeight: `${SET_ROW_HEIGHT_PX}px`,
              height: `${SET_ROW_HEIGHT_PX}px`,
            }}
          >
            {card.set_name}
          </Typography>

          {/* Pinned to the bottom so price lines up across a row. Only a unique
              slab has a grade; the other kinds say what they are. */}
          <Box
            sx={{
              mt: 'auto',
              pt: '6px',
              height: `${FOOTER_ROW_HEIGHT_PX + 6}px`,
              boxSizing: 'content-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <Typography
              noWrap
              sx={{
                minWidth: 0,
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
                flexShrink: 0,
                fontSize: '16px',
                fontWeight: 700,
                lineHeight: 1,
                color: '#E7CE92',
              }}
            />
          </Box>
        </Box>
      </ButtonBase>
    </FadeUp>
  );
}

/** Placeholder with exactly a real tile's dimensions. */
export function StoreCardSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Skeleton
        variant="rectangular"
        sx={{ width: '100%', height: 'auto', aspectRatio: MEDIA_ASPECT_RATIO, borderRadius: '4px' }}
      />
      <Box sx={{ pt: '8px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Skeleton
          variant="rectangular"
          sx={{ width: '85%', height: `${NAME_LINE_HEIGHT_PX * NAME_LINES}px`, borderRadius: '2px' }}
        />
        <Skeleton
          variant="rectangular"
          sx={{ my: '2px', width: '55%', height: `${SET_ROW_HEIGHT_PX - 4}px`, borderRadius: '2px' }}
        />
        <Box sx={{ mt: 'auto', pt: '6px', height: `${FOOTER_ROW_HEIGHT_PX + 6}px`, boxSizing: 'content-box' }}>
          <Skeleton
            variant="rectangular"
            sx={{ width: '45%', height: '100%', borderRadius: '2px' }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default StoreCardItem;
