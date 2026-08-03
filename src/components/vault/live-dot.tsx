import type { BoxProps } from '@mui/material/Box';

import { keyframes } from '@emotion/react';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

const dotPulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .35; transform: scale(.65); }
`;

export type LiveDotProps = BoxProps & {
  size?: number;
};

export function LiveDot({ size = 6, sx, ...other }: LiveDotProps) {
  return (
    <Box
      sx={[
        {
          width: size,
          height: size,
          flexShrink: 0,
          borderRadius: '999px',
          bgcolor: '#E7CE92',
          boxShadow: '0 0 10px #E7CE92',
          animation: `${dotPulse} 1.3s ease-in-out infinite`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    />
  );
}

export default LiveDot;
