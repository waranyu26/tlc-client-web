import type { BoxProps } from '@mui/material/Box';
import type { PackDetail, PackListItem } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { ThbAmount, CARD_ASPECT_RATIO } from 'src/components/vault';

// ----------------------------------------------------------------------

/** Accepts either shape — the list item and the detail share these fields. */
export type PackHeroProps = BoxProps & {
  pack: Pick<
    PackDetail & PackListItem,
    'id' | 'name' | 'description' | 'image_url' | 'price_satang' | 'cards_remaining' | 'cards_total'
  >;
};

export function PackHero({ pack, sx, ...other }: PackHeroProps) {
  const { t } = useTranslation('pack');
  const soldOut = pack.cards_remaining <= 0;

  return (
    <Box
      sx={[
        {
          position: 'relative',
          borderRadius: '16px',
          border: '1px solid rgba(231,206,146,0.2)',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, #2A2416, #0F0D08)',
          padding: '32px 20px 24px',
          textAlign: 'center',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {pack.image_url ? (
        <Box
          component="img"
          src={pack.image_url}
          alt={pack.name}
          sx={{
            width: '100%',
            maxWidth: 220,
            aspectRatio: CARD_ASPECT_RATIO,
            objectFit: 'cover',
            margin: '0 auto 16px',
            display: 'block',
            borderRadius: '12px',
            border: '1.5px solid rgba(231,206,146,0.4)',
          }}
        />
      ) : (
        <Box
          sx={{
            width: 72,
            height: 72,
            margin: '0 auto 16px',
            borderRadius: '16px',
            border: '1.5px solid rgba(231,206,146,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0,0,0,0.25)',
          }}
        >
          <Iconify icon="solar:cart-3-bold" width={36} sx={{ color: '#E7CE92' }} />
        </Box>
      )}

      <Typography
        sx={{
          fontFamily: `'Cormorant Garamond', serif`,
          fontSize: '27px',
          fontWeight: 600,
          color: '#F4ECDD',
        }}
      >
        {pack.name}
      </Typography>

      {pack.description && (
        <Typography sx={{ fontSize: '12px', mt: '6px', color: '#9A9285' }}>
          {pack.description}
        </Typography>
      )}

      <ThbAmount
        satang={pack.price_satang}
        sx={{ display: 'block', mt: '8px', fontSize: '22px', fontWeight: 700, color: '#E7CE92' }}
      />

      <Typography sx={{ fontSize: '10px', color: '#5A5550', mt: '2px' }}>
        {t('perPull', { defaultValue: 'per pull' })}
      </Typography>

      <Typography
        sx={{
          fontSize: '11px',
          mt: '6px',
          color: soldOut ? '#C9605B' : '#9A9285',
          fontWeight: 600,
        }}
      >
        {soldOut
          ? t('outOfStock', { defaultValue: 'Sold out' })
          : t('remaining', {
              remaining: pack.cards_remaining,
              total: pack.cards_total,
              defaultValue: '{{remaining}} of {{total}} cards left',
            })}
      </Typography>
    </Box>
  );
}

export default PackHero;
