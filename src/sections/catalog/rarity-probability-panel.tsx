import type { BoxProps } from '@mui/material/Box';
import type { RarityTier } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { TrustBadge, getRarityColor } from 'src/components/vault';

// ----------------------------------------------------------------------

export type RarityProbabilityPanelProps = BoxProps & {
  rarities: RarityTier[];
};

export function RarityProbabilityPanel({ rarities, sx, ...other }: RarityProbabilityPanelProps) {
  const { t } = useTranslation('catalog');
  const active = rarities
    .filter((r) => r.active)
    .sort((a, b) => b.probability_bps - a.probability_bps);

  return (
    <Box
      sx={[
        {
          borderRadius: '14px',
          border: '1px solid rgba(231,206,146,0.16)',
          bgcolor: '#111019',
          padding: '14px 16px',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Typography
        sx={{
          fontFamily: `'Cormorant Garamond', serif`,
          fontSize: '18px',
          fontWeight: 600,
          color: '#F4ECDD',
        }}
      >
        {t('probabilityPanel.title', { defaultValue: 'Pull probability' })}
      </Typography>
      <Typography sx={{ fontSize: '11.5px', color: '#9A9285', mt: '2px', mb: '12px' }}>
        {t('probabilityPanel.subtitle', {
          defaultValue: 'Audited monthly and disclosed for every rarity tier.',
        })}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {active.map((rarity) => {
          const pct = (rarity.probability_bps / 100).toFixed(2);
          const color = getRarityColor(rarity.code);

          return (
            <Box
              key={rarity.id}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '999px',
                    bgcolor: color,
                    boxShadow: `0 0 8px ${color}88`,
                  }}
                />
                <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: '#F4ECDD' }}>
                  {rarity.display_name}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#F4ECDD' }}>
                {pct}%
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ mt: '14px', pt: '12px', borderTop: '1px solid rgba(231,206,146,0.08)' }}>
        <TrustBadge />
      </Box>
    </Box>
  );
}

export default RarityProbabilityPanel;
