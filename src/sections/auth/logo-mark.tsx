import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------
// Brand mark: star/sparkle glyph on a gold->bronze gradient square (DESIGN.md
// "Mark"). Original SVG glyph — no third-party trademarks.
// ----------------------------------------------------------------------

const SPARKLE_PATH =
  'M12 2c.6 5 2.9 7.4 8 8-5.1.6-7.4 2.9-8 8-.6-5.1-2.9-7.4-8-8 5.1-.6 7.4-2.9 8-8z';

export type LogoMarkProps = {
  size?: number;
};

export function LogoMark({ size = 56 }: LogoMarkProps) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #E7CE92, #8A6D2F)',
        boxShadow: '0 8px 26px rgba(231,206,146,0.25)',
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 24 24"
        sx={{ width: size * 0.5, height: size * 0.5, fill: '#0B0B0D' }}
      >
        <path d={SPARKLE_PATH} />
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

export type WordmarkProps = {
  size?: number;
};

/** Wordmark "Tokyo **Lucky** Card", Lucky in gold. */
export function Wordmark({ size = 21 }: WordmarkProps) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography
        sx={{
          fontFamily: `'Cormorant Garamond', serif`,
          fontWeight: 600,
          fontSize: size,
          color: '#F4ECDD',
          lineHeight: 1.1,
        }}
      >
        Tokyo{' '}
        <Box component="span" sx={{ color: '#E7CE92' }}>
          Lucky
        </Box>{' '}
        Card
      </Typography>
    </Box>
  );
}

export default LogoMark;
