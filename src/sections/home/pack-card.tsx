import type { BoxProps } from '@mui/material/Box';
import type { PackListItem } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { ThbAmount, CARD_ASPECT_RATIO } from 'src/components/vault';

// ----------------------------------------------------------------------
// PackListItem has no image_url — packs are rendered as decorative gradient
// panels (rotating through a small accent palette) instead of photography.
// ----------------------------------------------------------------------

const ACCENTS = [
  { from: '#2A2416', to: '#0F0D08', ring: 'rgba(231,206,146,0.35)', icon: '#E7CE92' },
  { from: '#1C2A28', to: '#0A1210', ring: 'rgba(24,224,208,0.30)', icon: '#18E0D0' },
  { from: '#241C2E', to: '#0D0A12', ring: 'rgba(199,125,255,0.30)', icon: '#C77DFF' },
  { from: '#1B1E2E', to: '#0A0B12', ring: 'rgba(124,140,255,0.30)', icon: '#7C8CFF' },
];

function accentForPack(packId: string) {
  let hash = 0;
  for (let i = 0; i < packId.length; i += 1) {
    hash = (hash * 31 + packId.charCodeAt(i)) % 4294967296;
  }
  return ACCENTS[hash % ACCENTS.length];
}

/** Grid tiles land near 240px wide at `lg`; the featured card stays close. */
const FEATURED_MAX_WIDTH = 300;

export type PackCardProps = Omit<BoxProps, 'children'> & {
  pack: PackListItem;
  featured?: boolean;
};

export function PackCard({ pack, featured = false, sx, ...other }: PackCardProps) {
  const { t } = useTranslation('home');
  const accent = accentForPack(pack.id);
  const outOfStock = pack.sold_out;

  return (
    <Box
      sx={[
        {
          position: 'relative',
          borderRadius: '14px',
          border: '1px solid rgba(231,206,146,0.16)',
          overflow: 'hidden',
          bgcolor: '#17161B',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
          },
        },
        // The featured pack sits outside the grid, so nothing else bounds its
        // width — without a cap, card proportions stretch it to the full column
        // height. Slightly wider than a grid tile is enough to read as featured.
        featured && { width: '100%', maxWidth: FEATURED_MAX_WIDTH },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {/* Card proportions, not a banner: a pack is merchandised as a card, so
          its cover is rendered at the same ratio as the cards inside it. */}
      <Box
        sx={{
          position: 'relative',
          aspectRatio: CARD_ASPECT_RATIO,
          background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Packs carry real cover art now; the gradient panel is only the
            fallback for a pack whose cover hasn't been uploaded yet. */}
        {pack.image_url ? (
          <Box
            component="img"
            src={pack.image_url}
            alt={pack.name}
            loading="lazy"
            decoding="async"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
              width: featured ? 56 : 40,
              height: featured ? 56 : 40,
              borderRadius: '13px',
              border: `1.5px solid ${accent.ring}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0,0,0,0.25)',
            }}
          >
            <Iconify
              icon="solar:box-minimalistic-bold"
              width={featured ? 30 : 22}
              sx={{ color: accent.icon }}
            />
          </Box>
        )}

        {outOfStock && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              padding: '3px 9px',
              borderRadius: '999px',
              bgcolor: 'rgba(11,11,13,0.7)',
              border: '1px solid rgba(201,96,91,0.4)',
            }}
          >
            <Typography sx={{ fontSize: '9px', fontWeight: 600, color: '#C9605B' }}>
              {t('outOfStock', { defaultValue: 'Sold out' })}
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ padding: featured ? '14px 16px 16px' : '10px 12px 12px' }}>
        <Typography
          sx={{
            fontFamily: `'Cormorant Garamond', serif`,
            fontSize: featured ? '21px' : '15px',
            fontWeight: 600,
            color: '#F4ECDD',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {pack.name}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: featured ? '10px' : '6px',
          }}
        >
          <ThbAmount
            satang={pack.price_satang}
            sx={{ fontWeight: 700, fontSize: featured ? '20px' : '14px', color: '#E7CE92' }}
          />
          {/* Pulls so far, not cards left: how much is in the box is the
              seller's information, and a running total reads as popularity
              rather than as a countdown. */}
          {!outOfStock && pack.pull_count > 0 && (
            <Typography sx={{ fontSize: '10px', color: '#9A9285' }}>
              {t('opened', { count: pack.pull_count, defaultValue: '{{count}} opened' })}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default PackCard;
