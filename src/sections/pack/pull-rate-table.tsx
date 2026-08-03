import type { BoxProps } from '@mui/material/Box';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { formatThb } from 'src/utils/format-currency';

import { TrustBadge, getRarityColor } from 'src/components/vault';

// ----------------------------------------------------------------------

export type PullRateRow = {
  code: string;
  display_name: string;
  probability_bps: number;
  avg_buyback_satang: number;
};

export type PullRateTableProps = BoxProps & {
  rows: PullRateRow[];
};

/** Audited pull-rate disclosure — rarity, probability, and buyback value (FR9/FR10). */
export function PullRateTable({ rows, sx, ...other }: PullRateTableProps) {
  const { t } = useTranslation('pack');

  return (
    <Box
      sx={[
        {
          borderRadius: '14px',
          border: '1px solid rgba(231,206,146,0.16)',
          bgcolor: '#111019',
          overflow: 'hidden',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box sx={{ padding: '14px 16px 10px' }}>
        <Typography
          sx={{
            fontFamily: `'Cormorant Garamond', serif`,
            fontSize: '18px',
            fontWeight: 600,
            color: '#F4ECDD',
          }}
        >
          {t('pullRates.title', { defaultValue: 'Audited pull rates' })}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 0.8fr 1fr',
          padding: '0 16px 8px',
        }}
      >
        <Typography sx={{ fontSize: '9.5px', color: '#9A9285', textTransform: 'uppercase' }}>
          {t('pullRates.rarity', { defaultValue: 'Rarity' })}
        </Typography>
        <Typography
          sx={{
            fontSize: '9.5px',
            color: '#9A9285',
            textTransform: 'uppercase',
            textAlign: 'right',
          }}
        >
          {t('pullRates.probability', { defaultValue: 'Probability' })}
        </Typography>
        <Typography
          sx={{
            fontSize: '9.5px',
            color: '#9A9285',
            textTransform: 'uppercase',
            textAlign: 'right',
          }}
        >
          {t('pullRates.buyback', { defaultValue: 'Avg. buyback' })}
        </Typography>
      </Box>

      {rows.map((row) => {
        const color = getRarityColor(row.code);
        return (
          <Box
            key={row.code}
            sx={{
              display: 'grid',
              gridTemplateColumns: '1.6fr 0.8fr 1fr',
              alignItems: 'center',
              padding: '9px 16px',
              borderTop: '1px solid rgba(231,206,146,0.06)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  flexShrink: 0,
                  borderRadius: '999px',
                  bgcolor: color,
                  boxShadow: `0 0 8px ${color}88`,
                }}
              />
              <Typography
                sx={{
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#F4ECDD',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {row.display_name}
              </Typography>
            </Box>
            <Typography
              sx={{ fontSize: '13px', fontWeight: 700, color: '#F4ECDD', textAlign: 'right' }}
            >
              {(row.probability_bps / 100).toFixed(2)}%
            </Typography>
            <Typography
              sx={{ fontSize: '12px', fontWeight: 600, color: '#6FBF8E', textAlign: 'right' }}
            >
              {formatThb(row.avg_buyback_satang)}
            </Typography>
          </Box>
        );
      })}

      <Box sx={{ padding: '12px 16px 14px', borderTop: '1px solid rgba(231,206,146,0.08)' }}>
        <TrustBadge />
      </Box>
    </Box>
  );
}

export default PullRateTable;
