import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useCards, useRarities } from 'src/api/catalog.api';

import { ThbAmount, getRarityColor } from 'src/components/vault';

// ----------------------------------------------------------------------
// Audited pull-rate table shown on the idle pull screen: rarity, probability %,
// and an average buyback value sampled from the current catalog (legal requirement
// — pull rates must be disclosed alongside buyback value, see DESIGN.md "Trust Signals").
// ----------------------------------------------------------------------

/** bps (basis points, 10000 = 100%) -> a trimmed percent string, e.g. 250 -> "2.5%". */
function formatOdds(bps: number): string {
  const percent = bps / 100;
  const rounded = Math.round(percent * 100) / 100;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2)}%`;
}

export function PullRateTable() {
  const { t } = useTranslation('pull');
  const raritiesQuery = useRarities();
  // Sample a slice of the catalog to derive an average buyback value per rarity.
  const cardsQuery = useCards({ pageSize: 100 });

  const rarities = (raritiesQuery.data ?? [])
    .filter((tier) => tier.active)
    .slice()
    .sort((a, b) => a.probability_bps - b.probability_bps);

  const avgBuybackByRarity = new Map<string, number>();
  if (cardsQuery.data?.data) {
    const grouped = new Map<string, number[]>();
    cardsQuery.data.data.forEach((card) => {
      const key = card.rarity.toLowerCase();
      const list = grouped.get(key) ?? [];
      list.push(card.buyback_price_satang);
      grouped.set(key, list);
    });
    grouped.forEach((prices, key) => {
      const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      avgBuybackByRarity.set(key, Math.round(avg));
    });
  }

  const isLoading = raritiesQuery.isPending;

  return (
    <Box
      sx={{
        borderRadius: '14px',
        border: '1px solid rgba(231,206,146,0.16)',
        bgcolor: '#17161B',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          padding: '13px 16px',
          borderBottom: '1px solid rgba(231,206,146,0.08)',
        }}
      >
        <Typography
          sx={{
            fontFamily: `'Space Grotesk Variable', sans-serif`,
            fontSize: '10.5px',
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#9A9285',
          }}
        >
          {t('rateTable.heading')}
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
          <CircularProgress size={20} sx={{ color: '#E7CE92' }} />
        </Box>
      ) : rarities.length === 0 ? (
        <Typography sx={{ padding: '16px', fontSize: '12.5px', color: '#9A9285' }}>
          {t('rateTable.empty')}
        </Typography>
      ) : (
        <Box>
          {rarities.map((tier, index) => {
            const avgBuyback = avgBuybackByRarity.get(tier.code.toLowerCase());
            const color = getRarityColor(tier.code);
            return (
              <Box
                key={tier.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  padding: '11px 16px',
                  borderTop: index === 0 ? 'none' : '1px solid rgba(231,206,146,0.06)',
                }}
              >
                {/* Rarity pill: mirrors RarityBadge styling but shows the tier's
                    display_name (RarityBadge always renders its `rarity` prop verbatim,
                    which we need to keep separate from `code` for color lookup). */}
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    borderRadius: '999px',
                    padding: '4px 12px',
                    bgcolor: `${color}1A`,
                    border: `1px solid ${color}47`,
                    color,
                    fontSize: '9.5px',
                    fontWeight: 600,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    lineHeight: 1.6,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tier.display_name}
                </Box>

                <Typography
                  sx={{
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#F4ECDD',
                    flexShrink: 0,
                  }}
                >
                  {formatOdds(tier.probability_bps)}
                </Typography>

                <Box sx={{ flex: 1, textAlign: 'right', minWidth: 0 }}>
                  {avgBuyback !== undefined ? (
                    <ThbAmount satang={avgBuyback} sx={{ fontSize: '12.5px', color: '#9A9285' }} />
                  ) : (
                    <Typography sx={{ fontSize: '12.5px', color: '#5A5550' }}>—</Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export default PullRateTable;
