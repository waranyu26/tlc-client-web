import type { BoxProps } from '@mui/material/Box';

import { keyframes } from '@emotion/react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { LiveDot } from './live-dot';

// ----------------------------------------------------------------------

const marquee = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

const ITEM_GAP = 32;

/**
 * With only a couple of live events the rendered strip is narrower than the
 * bar, so translating it by -50% of its own width moves the text a short
 * distance and snaps back mid-screen. Repeating the items until there are
 * enough of them keeps each group wider than any realistic viewport, so the
 * scroll always runs edge to edge.
 */
const MIN_ITEMS_PER_GROUP = 12;

/** Seconds per item, so a longer feed scrolls for longer rather than faster. */
const SECONDS_PER_ITEM = 2.5;

export type TickerStripProps = Omit<BoxProps, 'children'> & {
  items: string[];
};

export function TickerStrip({ items, sx, ...other }: TickerStripProps) {
  const hasItems = items.length > 0;
  const content = hasItems ? items : ['Live activity will appear here.'];

  const group: string[] = [];
  while (group.length < MIN_ITEMS_PER_GROUP) {
    group.push(...content);
  }

  return (
    <Box
      sx={[
        {
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 16px',
          bgcolor: '#111019',
          borderBottom: '1px solid rgba(231,206,146,0.08)',
          overflow: 'hidden',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <LiveDot size={6} />
        <Typography
          sx={{
            fontFamily: `'Space Grotesk Variable', sans-serif`,
            fontSize: '9.5px',
            fontWeight: 600,
            letterSpacing: '0.18em',
            color: '#E7CE92',
          }}
        >
          LIVE
        </Typography>
      </Box>

      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          maskImage: 'linear-gradient(90deg, transparent, #000 7%, #000 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 7%, #000 90%, transparent)',
        }}
      >
        {/*
          Two identical groups, each carrying its own trailing gap, so the track
          is exactly twice one group wide and -50% lands precisely on the start
          of the second copy. Putting the gap on the track instead leaves the
          seam half a gap short, which reads as a jolt on every loop.
        */}
        <Box
          sx={{
            display: 'flex',
            width: 'max-content',
            animation: hasItems
              ? `${marquee} ${group.length * SECONDS_PER_ITEM}s linear infinite`
              : 'none',
          }}
        >
          {[0, 1].map((copy) => (
            <Box
              key={copy}
              aria-hidden={copy === 1}
              sx={{
                display: 'flex',
                flexShrink: 0,
                gap: `${ITEM_GAP}px`,
                paddingRight: `${ITEM_GAP}px`,
              }}
            >
              {group.map((item, index) => (
                <Typography
                  key={`${copy}-${index}-${item}`}
                  sx={{ fontSize: '12px', color: '#9A9285', whiteSpace: 'nowrap' }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default TickerStrip;
