import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { formatThb } from 'src/utils/format-currency';

import { Iconify } from 'src/components/iconify';
import { FadeUp, TrustBadge, PrimaryButton } from 'src/components/vault';

import { PullRateTable } from './pull-rate-table';

// ----------------------------------------------------------------------
// Note: FadeUp only forwards framer-motion `HTMLMotionProps<'div'>` (it does not
// understand MUI's `sx` prop), so every FadeUp below wraps a plain <Box sx={...}>
// rather than taking `sx` directly.
// ----------------------------------------------------------------------

export type PullIdleViewProps = {
  priceSatang?: number;
  canAfford: boolean;
  disabled?: boolean;
  onPull: () => void;
};

export function PullIdleView({ priceSatang, canAfford, disabled, onPull }: PullIdleViewProps) {
  const { t } = useTranslation('pull');

  return (
    <Box sx={{ padding: '20px 16px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <FadeUp>
        <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              margin: '0 auto',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #E7CE92, #8A6D2F)',
              boxShadow: '0 8px 26px rgba(231,206,146,0.25)',
            }}
          >
            <Iconify icon="solar:cup-star-bold" width={30} sx={{ color: '#0B0B0D' }} />
          </Box>

          <Typography
            sx={{
              fontFamily: `'Cormorant Garamond', serif`,
              fontSize: '27px',
              fontWeight: 600,
              color: '#F4ECDD',
            }}
          >
            {t('title')}
          </Typography>
          <Typography sx={{ fontSize: '13px', color: '#9A9285' }}>{t('subtitle')}</Typography>
        </Box>
      </FadeUp>

      <FadeUp delay={0.08}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <PrimaryButton
            fullWidth
            disabled={disabled || !canAfford}
            onClick={onPull}
            sx={{ fontSize: '16px', padding: '15px 20px' }}
          >
            {priceSatang !== undefined
              ? t('pullCta', { price: formatThb(priceSatang) })
              : t('pullCta', { price: '…' })}
          </PrimaryButton>

          {!canAfford && priceSatang !== undefined ? (
            <Typography sx={{ fontSize: '11.5px', color: '#C9605B', textAlign: 'center' }}>
              {t('insufficientBalance')}
            </Typography>
          ) : null}
        </Box>
      </FadeUp>

      <FadeUp delay={0.14}>
        <PullRateTable />
      </FadeUp>

      <FadeUp delay={0.2}>
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '0 8px' }}>
          <TrustBadge />
        </Box>
      </FadeUp>
    </Box>
  );
}

export default PullIdleView;
