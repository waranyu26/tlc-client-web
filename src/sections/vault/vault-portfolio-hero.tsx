import type { CollectionItem } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { typeScale } from 'src/theme/type-scale';

import { FadeUp, ThbAmount, SectionHeading } from 'src/components/vault';

// ----------------------------------------------------------------------

export type VaultPortfolioHeroProps = {
  items: CollectionItem[];
  loading?: boolean;
};

export function VaultPortfolioHero({ items, loading = false }: VaultPortfolioHeroProps) {
  const { t } = useTranslation('vault');

  const totalSatang = items.reduce((sum, item) => sum + item.buyback_price_satang, 0);

  return (
    <FadeUp>
      <Box
        sx={{
          borderRadius: '15px',
          border: '1px solid rgba(231,206,146,0.16)',
          background: '#17161B',
          p: { xs: 2.5, md: 3.5 },
          // Desktop reads as a stat bar: title left, figures right.
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'flex-end' },
          justifyContent: 'space-between',
          gap: { xs: 1.5, md: 4 },
        }}
      >
        <SectionHeading sx={{ mb: 0 }}>{t('title', { defaultValue: 'The Vault' })}</SectionHeading>

        <Box sx={{ textAlign: { md: 'right' } }}>
          <Typography sx={{ ...typeScale.micro, color: '#9A9285', letterSpacing: '0.2em' }}>
            {t('portfolioLabel', { defaultValue: 'PORTFOLIO VALUE' })}
          </Typography>

          {loading ? (
            <Skeleton
              variant="text"
              width={180}
              height={58}
              sx={{ bgcolor: 'rgba(231,206,146,0.08)', ml: { md: 'auto' } }}
            />
          ) : (
            <ThbAmount hero satang={totalSatang} sx={{ display: 'block', mt: '2px' }} />
          )}

          <Typography sx={{ ...typeScale.label, color: '#9A9285', mt: '6px' }}>
            {t('cardCount', { count: items.length, defaultValue: `${items.length} cards` })}
          </Typography>
        </Box>
      </Box>
    </FadeUp>
  );
}

export default VaultPortfolioHero;
