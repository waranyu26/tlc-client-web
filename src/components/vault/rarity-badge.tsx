import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

export const RARITY_COLORS = {
  legendary: '#E7CE92',
  mythic: '#C77DFF',
  epic: '#18E0D0',
  rare: '#7C8CFF',
  common: '#4A4844',
} as const;

export type RarityKey = keyof typeof RARITY_COLORS;

export function getRarityColor(rarity?: string | null): string {
  const key = (rarity ?? '').toLowerCase() as RarityKey;
  return RARITY_COLORS[key] ?? RARITY_COLORS.common;
}

export type RarityBadgeProps = BoxProps<'span'> & {
  rarity: string;
};

export function RarityBadge({ rarity, sx, ...other }: RarityBadgeProps) {
  const color = getRarityColor(rarity);

  return (
    <Box
      component="span"
      sx={[
        {
          display: 'inline-flex',
          alignItems: 'center',
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
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {rarity}
    </Box>
  );
}

export default RarityBadge;
