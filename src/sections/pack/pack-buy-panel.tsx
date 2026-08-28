import type { PackDetail } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { ThbAmount, TrustBadge, PrimaryButton } from 'src/components/vault';

// ----------------------------------------------------------------------

type Props = {
  pack: PackDetail;
  /** False only when the wallet is known to be short — never a loading state. */
  canAfford: boolean;
  onPull: () => void;
};

/**
 * The product card: everything needed to decide to pay, and nothing else.
 *
 * Price and lifetime opens sit side by side as the panel's only figures. There
 * is deliberately no "N left" beside them — the odds are published and fixed,
 * so a remaining count would add nothing except a map of the box's contents.
 */
export function PackBuyPanel({ pack, canAfford, onPull }: Props) {
  const { t } = useTranslation('pack');

  const soldOut = pack.sold_out;
  const cardCount = pack.rarity_odds.reduce((total, tier) => total + tier.card_count, 0);

  return (
    <Box
      sx={{
        minWidth: 0,
        padding: { xs: '20px', md: '24px' },
        borderRadius: '20px',
        border: '1px solid rgba(231,206,146,0.16)',
        backgroundColor: '#141219',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        sx={{
          fontFamily: `'Cormorant Garamond', serif`,
          fontSize: { xs: '28px', md: '32px' },
          fontWeight: 600,
          lineHeight: 1.12,
          color: '#F4ECDD',
        }}
      >
        {pack.name}
      </Typography>

      {pack.description && (
        <Typography
          sx={{
            mt: '10px',
            fontSize: '12px',
            lineHeight: 1.6,
            color: '#9A9285',
            // Long copy pushed the CTA below the fold on a laptop; four lines
            // is enough to sell the box, and the manifest below tells the rest.
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 4,
            overflow: 'hidden',
          }}
        >
          {pack.description}
        </Typography>
      )}

      <Divider sx={{ my: '18px', borderColor: 'rgba(231,206,146,0.14)' }} />

      <Box
        sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#6F6A60',
            }}
          >
            {t('perPull', { defaultValue: 'Price / pull' })}
          </Typography>
          <ThbAmount
            satang={pack.price_satang}
            sx={{
              display: 'block',
              mt: '2px',
              fontSize: '30px',
              fontWeight: 700,
              lineHeight: 1.1,
              color: '#E7CE92',
            }}
          />
        </Box>

        <Box sx={{ textAlign: 'right', minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#6F6A60',
            }}
          >
            {t('stats.openedLabel', { defaultValue: 'Opened' })}
          </Typography>
          <Typography
            sx={{
              mt: '2px',
              fontSize: '30px',
              fontWeight: 700,
              lineHeight: 1.1,
              color: soldOut ? '#C9605B' : '#F4ECDD',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {pack.pull_count.toLocaleString('en-US')}
          </Typography>
        </Box>
      </Box>

      <PrimaryButton fullWidth disabled={soldOut} onClick={onPull} sx={{ mt: '20px' }}>
        {soldOut
          ? t('outOfStock', { defaultValue: 'Sold out' })
          : t('pullCta', {
              price: `฿${(pack.price_satang / 100).toLocaleString('en-US')}`,
              defaultValue: 'Pull · {{price}}',
            })}
      </PrimaryButton>

      {!canAfford && !soldOut && (
        <Typography sx={{ mt: '8px', fontSize: '11px', color: '#9A9285', textAlign: 'center' }}>
          {t('topUpHint', { defaultValue: 'Not enough balance — tap to top up.' })}
        </Typography>
      )}

      <Typography sx={{ mt: '16px', fontSize: '11px', color: '#6F6A60', textAlign: 'center' }}>
        {t('stats.summary', {
          cards: cardCount,
          tiers: pack.rarity_odds.length,
          defaultValue: '{{cards}} graded slabs · {{tiers}} rarity tiers',
        })}
      </Typography>

      <Divider sx={{ my: '16px', borderColor: 'rgba(231,206,146,0.1)' }} />

      <TrustBadge sx={{ alignItems: 'flex-start' }} />
    </Box>
  );
}

export default PackBuyPanel;
