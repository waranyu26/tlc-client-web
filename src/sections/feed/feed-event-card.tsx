import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RarityBadge } from 'src/components/vault';

import { getInitials, getAvatarColor } from './utils';

// ----------------------------------------------------------------------

export type FeedEventCardProps = {
  userId: string;
  cardName: string;
  rarity: string;
  timeLabel: string;
  pulledLabel: string;
};

export function FeedEventCard({
  userId,
  cardName,
  rarity,
  timeLabel,
  pulledLabel,
}: FeedEventCardProps) {
  const initials = getInitials(userId);
  const color = getAvatarColor(userId);

  return (
    <Stack
      direction="row"
      spacing="12px"
      sx={{
        alignItems: 'center',
        padding: '12px 14px',
        borderRadius: '14px',
        background: '#17161B',
        border: '1px solid rgba(231,206,146,0.10)',
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: `${color}22`,
          border: `1px solid ${color}55`,
          color,
          fontWeight: 700,
          fontSize: '13px',
        }}
      >
        {initials}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ color: '#9A9285', fontSize: '12px' }}>{pulledLabel}</Typography>
        <Stack
          direction="row"
          spacing="8px"
          sx={{ alignItems: 'center', mt: '3px', flexWrap: 'wrap', rowGap: '4px' }}
        >
          <Typography sx={{ color: '#F4ECDD', fontWeight: 600, fontSize: '14px' }} noWrap>
            {cardName}
          </Typography>
          <RarityBadge rarity={rarity} />
        </Stack>
      </Box>

      <Typography sx={{ color: '#5A5550', fontSize: '11px', flexShrink: 0 }}>
        {timeLabel}
      </Typography>
    </Stack>
  );
}
