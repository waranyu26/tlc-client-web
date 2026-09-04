import type { BoxProps } from '@mui/material/Box';
import type { PackListItem } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { usePack } from 'src/api/pack.api';
import { typeScale } from 'src/theme/type-scale';

import { Iconify } from 'src/components/iconify';
import { ThbAmount, PrimaryButton, CARD_ASPECT_RATIO } from 'src/components/vault';

// ----------------------------------------------------------------------
// A pack is a destination, not a tile.
//
// The catalogue this page was built for never arrived: the shop runs one to
// three boxes at a time. A grid sized for a dozen packs left most of the column
// empty, so each pack now gets a full-width row it can actually fill — cover
// art, the description the list response was already carrying and nothing ever
// rendered, and the published odds that are the whole selling point.
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

/** Cover height per breakpoint; the width follows from CARD_ASPECT_RATIO. */
const coverHeight = { xs: 128, sm: 164, md: 196, lg: 220 };

/** Only the steep end of the odds sells the box — the rest is on the pack page. */
const MAX_ODDS_CHIPS = 3;

/** 150 bps -> "1.5", 1700 bps -> "17". Never "17.0". */
function formatOddsPercent(oddsBps: number) {
  const pct = oddsBps / 100;
  return Number.isInteger(pct) ? String(pct) : pct.toFixed(1);
}

export type PackShelfCardProps = Omit<BoxProps, 'children' | 'onClick'> & {
  pack: PackListItem;
  onOpen: () => void;
};

export function PackShelfCard({ pack, onOpen, sx, ...other }: PackShelfCardProps) {
  const { t } = useTranslation('home');
  const accent = accentForPack(pack.id);
  const soldOut = pack.sold_out;

  // Odds live on the detail response, not the list one. The row is complete
  // without them, so a pending or failed fetch degrades to a still-correct row
  // rather than holding the whole thing back — and fetching here warms the
  // cache that /pack/:id reads next.
  const detailQuery = usePack(pack.id);
  const odds = [...(detailQuery.data?.rarity_odds ?? [])]
    .sort((a, b) => b.rank - a.rank)
    .slice(0, MAX_ODDS_CHIPS);

  return (
    <Box
      onClick={onOpen}
      sx={[
        {
          display: 'grid',
          gridTemplateColumns: { xs: 'auto minmax(0, 1fr)', md: 'auto minmax(0, 1fr) auto' },
          columnGap: { xs: 1.5, md: 2.5 },
          rowGap: { xs: 1.5, md: 0 },
          alignItems: 'center',
          padding: { xs: '12px', md: '16px' },
          borderRadius: '15px',
          border: '1px solid rgba(231,206,146,0.16)',
          backgroundColor: '#17161B',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {/* Cover — card proportions, so a pack reads as a card and not a banner. */}
      <Box
        sx={{
          position: 'relative',
          height: coverHeight,
          aspectRatio: CARD_ASPECT_RATIO,
          flexShrink: 0,
          borderRadius: '10px',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
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
              // `contain`, not `cover`: the box art is a designed panel with a
              // ruled border a hair inside its own edge, and its aspect is not
              // exactly CARD_ASPECT_RATIO — cropping to fill shaves that rule
              // off. The letterbox is invisible against the near-black art.
              objectFit: 'contain',
              backgroundColor: '#0A0808',
            }}
          />
        ) : (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '13px',
              border: `1.5px solid ${accent.ring}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0,0,0,0.25)',
            }}
          >
            <Iconify icon="solar:box-minimalistic-bold" width={22} sx={{ color: accent.icon }} />
          </Box>
        )}

        {soldOut && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
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

      {/* Body */}
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ ...typeScale.cardTitle, color: '#F4ECDD' }}>{pack.name}</Typography>

        {pack.description && (
          <Typography
            sx={{
              ...typeScale.label,
              mt: '6px',
              color: '#9A9285',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
            }}
          >
            {pack.description}
          </Typography>
        )}

        {odds.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px', mt: '10px' }}>
            {odds.map((tier) => (
              <Box
                key={tier.tier_id}
                sx={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '5px',
                  padding: '3px 9px',
                  borderRadius: '999px',
                  border: `1px solid ${tier.color_hex}40`,
                  backgroundColor: `${tier.color_hex}14`,
                }}
              >
                <Typography
                  sx={{ fontSize: '10px', fontWeight: 600, color: tier.color_hex }}
                  component="span"
                >
                  {tier.display_name}
                </Typography>
                <Typography
                  sx={{ fontSize: '10px', color: '#9A9285', fontVariantNumeric: 'tabular-nums' }}
                  component="span"
                >
                  {formatOddsPercent(tier.odds_bps)}%
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {!soldOut && pack.pull_count > 0 && (
          <Typography sx={{ mt: '8px', fontSize: '10px', color: '#6F6A60' }}>
            {t('opened', { count: pack.pull_count, defaultValue: '{{count}} opened' })}
          </Typography>
        )}
      </Box>

      {/* Price + CTA. Drops beneath the text below `md`, where there is no room
          for a third column. */}
      <Box
        sx={{
          gridColumn: { xs: '1 / -1', md: 'auto' },
          textAlign: { xs: 'left', md: 'right' },
          minWidth: { md: 150 },
        }}
      >
        <Typography sx={{ ...typeScale.micro, color: '#6F6A60' }}>
          {t('perPull', { defaultValue: 'Price / pull' })}
        </Typography>
        <ThbAmount
          satang={pack.price_satang}
          sx={{
            display: 'block',
            mt: '2px',
            fontSize: { xs: '22px', md: '26px' },
            fontWeight: 700,
            lineHeight: 1.1,
            color: '#E7CE92',
          }}
        />
        <PrimaryButton
          fullWidth
          disabled={soldOut}
          // The row itself navigates, so without this the click lands twice.
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
          sx={{ mt: '12px' }}
        >
          {soldOut
            ? t('outOfStock', { defaultValue: 'Sold out' })
            : t('packCta', { defaultValue: 'Open pack' })}
        </PrimaryButton>
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

/**
 * Placeholder at the real row's geometry.
 *
 * The page used to answer a pending fetch with a single line of text, which
 * collapsed the layout to nothing and then snapped it back. Holding the shape
 * costs one component and removes the jump.
 */
export function PackShelfCardSkeleton() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'auto minmax(0, 1fr)', md: 'auto minmax(0, 1fr) auto' },
        columnGap: { xs: 1.5, md: 2.5 },
        alignItems: 'center',
        padding: { xs: '12px', md: '16px' },
        borderRadius: '15px',
        border: '1px solid rgba(231,206,146,0.08)',
        backgroundColor: '#17161B',
      }}
    >
      <Skeleton
        variant="rectangular"
        sx={{ height: coverHeight, aspectRatio: CARD_ASPECT_RATIO, borderRadius: '10px' }}
      />

      <Box sx={{ minWidth: 0 }}>
        <Skeleton variant="text" width="55%" height={28} />
        <Skeleton variant="text" width="90%" height={16} />
        <Skeleton variant="text" width="70%" height={16} />
      </Box>

      <Box sx={{ display: { xs: 'none', md: 'block' }, minWidth: 150 }}>
        <Skeleton variant="text" width={110} height={34} sx={{ ml: 'auto' }} />
        <Skeleton variant="rounded" width={150} height={44} sx={{ mt: '12px' }} />
      </Box>
    </Box>
  );
}

export default PackShelfCard;
