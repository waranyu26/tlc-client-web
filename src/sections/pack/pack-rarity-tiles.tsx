import type { BoxProps } from '@mui/material/Box';
import type { PackRarityOdds } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

/** Basis points to a human percentage: 250 -> "2.50%". */
export function formatOddsBps(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

export type PackRarityTilesProps = BoxProps & {
  rarityOdds: PackRarityOdds[];
  /** Highlighted tier, when the tiles drive a card list. */
  selectedRarity?: string | null;
  /** Omit to render the odds as a read-only summary. */
  onSelectRarity?: (rarityCode: string) => void;
};

/**
 * The pack's published odds, one tile per rarity, on a single row.
 *
 * These are fixed numbers the seller committed to, not a calculation over what
 * happens to be left in the box. That distinction is the whole point: odds
 * inferred from remaining stock would both reveal the pack's contents and drift
 * as other people pull, so the rate you are quoted would not be the rate you
 * were quoted a minute ago.
 *
 * The tiles used to be wide two-across rows, which left an odd tier stranded
 * beside a gap and buried the percentage — the only number anyone came for —
 * at the end of a long line. Equal auto-fit columns keep the row whole at any
 * tier count and put the rate on its own line at display size.
 */
export function PackRarityTiles({
  rarityOdds,
  selectedRarity,
  onSelectRarity,
  sx,
  ...other
}: PackRarityTilesProps) {
  const { t } = useTranslation('pack');

  return (
    <Box
      sx={[
        {
          display: 'grid',
          gap: '12px',
          // auto-fit, not auto-fill: leftover space is absorbed by the tiles
          // themselves, so a five-tier pack never trails an empty track.
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(auto-fit, minmax(170px, 1fr))',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {rarityOdds.map((odds) => {
        const accent = odds.color_hex || '#E7CE92';
        const selected = selectedRarity === odds.rarity_code;
        const interactive = Boolean(onSelectRarity);

        return (
          <ButtonBase
            key={odds.rarity_code}
            component={interactive ? 'button' : 'div'}
            disableRipple={!interactive}
            onClick={interactive ? () => onSelectRarity!(odds.rarity_code) : undefined}
            aria-pressed={interactive ? selected : undefined}
            sx={{
              p: '14px 16px 16px',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left',
              cursor: interactive ? 'pointer' : 'default',
              border: `1px solid ${selected ? accent : `${accent}2E`}`,
              backgroundColor: selected ? `${accent}14` : '#17161B',
              transition: 'border-color 160ms ease, background-color 160ms ease',
              ...(interactive && { '&:hover': { borderColor: `${accent}8C` } }),
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                px: '8px',
                py: '3px',
                borderRadius: '999px',
                border: `1px solid ${accent}3D`,
                backgroundColor: `${accent}14`,
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: accent }} />
              <Typography
                noWrap
                sx={{ fontSize: '11px', fontWeight: 700, color: accent, letterSpacing: '0.01em' }}
              >
                {odds.display_name || odds.rarity_code}
              </Typography>
            </Box>

            <Typography
              sx={{
                mt: '12px',
                fontSize: { xs: '22px', md: '26px' },
                fontWeight: 800,
                lineHeight: 1,
                color: '#F4ECDD',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatOddsBps(odds.odds_bps)}
            </Typography>

            {/* How many designs the rarity holds is fixed marketing copy; how
                many survive is not published. */}
            <Typography sx={{ mt: '6px', fontSize: '11px', color: '#9A9285' }}>
              {t('odds.cardCount', {
                count: odds.card_count,
                defaultValue: '{{count}} cards in this tier',
              })}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

export default PackRarityTiles;
