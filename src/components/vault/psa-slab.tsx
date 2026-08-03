import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { CardFrame } from './card-frame';

// ----------------------------------------------------------------------

/** Deterministic 8-digit fake cert number derived from the card name. */
function certNumberFromName(cardName: string): string {
  let hash = 0;
  for (let i = 0; i < cardName.length; i += 1) {
    hash = (hash * 31 + cardName.charCodeAt(i)) % 4294967296;
  }
  const digits = (hash % 100000000).toString().padStart(8, '0');
  return digits;
}

export type PsaSlabProps = Omit<BoxProps, 'children'> & {
  imageUrl?: string | null;
  rarity: string;
  cardName: string;
  grade?: number;
  certNumber?: string;
  alt?: string;
};

export function PsaSlab({
  imageUrl,
  rarity,
  cardName,
  grade = 10,
  certNumber,
  alt,
  sx,
  ...other
}: PsaSlabProps) {
  const cert = certNumber ?? certNumberFromName(cardName);
  const barGradient = 'linear-gradient(90deg,#201D15,#2E2A1E,#201D15)';

  return (
    <Box
      sx={[
        {
          borderRadius: '4px',
          border: '2.5px solid #2A2820',
          boxShadow: '0 18px 52px rgba(0,0,0,0.65), 0 0 38px rgba(231,206,146,0.09)',
          overflow: 'hidden',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {/* Header bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '7px 12px',
          background: barGradient,
          borderBottom: '2px solid #3A3624',
        }}
      >
        <Typography
          sx={{
            fontFamily: `'Space Grotesk Variable', sans-serif`,
            fontSize: '7.5px',
            fontWeight: 700,
            letterSpacing: '0.22em',
            color: '#E7CE92',
            whiteSpace: 'nowrap',
          }}
        >
          TOKYO LUCKY
        </Typography>

        <Box sx={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
          <Box sx={{ width: '8px', height: '3px', bgcolor: '#C9605B' }} />
          <Box sx={{ width: '8px', height: '3px', bgcolor: '#6FBF8E' }} />
          <Box sx={{ width: '8px', height: '3px', bgcolor: '#7C8CFF' }} />
        </Box>

        <Typography
          sx={{
            fontFamily: `'Space Grotesk Variable', sans-serif`,
            fontSize: '7.5px',
            fontWeight: 600,
            letterSpacing: '0.18em',
            color: '#9A9285',
            whiteSpace: 'nowrap',
          }}
        >
          VAULT AUTH
        </Typography>
      </Box>

      {/* Card area */}
      <Box sx={{ bgcolor: '#0A0808', padding: '10px' }}>
        <CardFrame imageUrl={imageUrl} rarity={rarity} alt={alt ?? cardName} />
      </Box>

      {/* Footer bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '8px 12px',
          background: barGradient,
          borderTop: '2px solid #3A3624',
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: `'Space Grotesk Variable', sans-serif`,
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#F4ECDD',
            }}
          >
            GEM MINT
          </Typography>
          <Typography
            sx={{
              fontFamily: `'Space Grotesk Variable', sans-serif`,
              fontSize: '8px',
              color: '#9A9285',
            }}
          >
            #{cert}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontFamily: `'Space Grotesk Variable', sans-serif`,
            fontSize: '32px',
            fontWeight: 700,
            color: '#E7CE92',
            lineHeight: 1,
          }}
        >
          {grade}
        </Typography>
      </Box>
    </Box>
  );
}

export default PsaSlab;
