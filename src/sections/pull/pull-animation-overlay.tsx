import type { PullStage } from 'src/store/pull-flow-store';

import { keyframes } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { m, AnimatePresence } from 'framer-motion';

import Box from '@mui/material/Box';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------
// Pull animation: 'pulling' stage floats 3 shuffling card backs (~2600ms), then
// 'glowing' fades a single card silhouette in with a pulsing gold glow (~1600ms)
// before the store flips to overlay 'reveal'. Timing lives in src/pages/pull.tsx
// (the only place allowed to drive the store's `stage` transitions); this
// component is purely presentational per `stage`. See DESIGN.md "Pull flow timing".
// ----------------------------------------------------------------------

const SPARKLE_PATH =
  'M12 2c.6 5 2.9 7.4 8 8-5.1.6-7.4 2.9-8 8-.6-5.1-2.9-7.4-8-8 5.1-.6 7.4-2.9 8-8z';

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 28px rgba(231,206,146,0.55); }
  50% { box-shadow: 0 0 52px rgba(231,206,146,0.55); }
`;

function CardBack({ index }: { index: number }) {
  // Stagger duration/rotation per card so the 3 backs shuffle asynchronously.
  const duration = 2.8 + index * 0.35; // 2.8s / 3.15s / 3.5s
  const rotate = [-6 + index * 6, 6 - index * 4, -6 + index * 6];
  const xOffset = (index - 1) * 22;

  return (
    <m.div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: -66,
        marginTop: -80,
        zIndex: 3 - index,
      }}
      initial={{ opacity: 0, x: xOffset, y: 0, rotate: rotate[0] }}
      animate={{
        opacity: 1,
        x: [xOffset, xOffset + 6, xOffset],
        y: [0, -14, 0],
        rotate,
      }}
      transition={{
        opacity: { duration: 0.4 },
        x: { duration, repeat: Infinity, ease: 'easeInOut' },
        y: { duration, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <Box
        sx={{
          width: 132,
          height: 160,
          borderRadius: '4px',
          border: '1.5px solid rgba(231,206,146,0.4)',
          bgcolor: '#0A0808',
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SvgIcon
          viewBox="0 0 24 24"
          sx={{ width: '34%', height: '34%', color: 'rgba(231,206,146,0.35)' }}
        >
          <path fill="currentColor" d={SPARKLE_PATH} />
        </SvgIcon>
      </Box>
    </m.div>
  );
}

function GlowingCard() {
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Box
        sx={{
          width: 172,
          height: 208,
          borderRadius: '4px',
          border: '1.5px solid #E7CE92',
          bgcolor: '#0A0808',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: `${glowPulse} 2s ease-in-out infinite`,
        }}
      >
        <SvgIcon viewBox="0 0 24 24" sx={{ width: '38%', height: '38%', color: '#E7CE92' }}>
          <path fill="currentColor" d={SPARKLE_PATH} />
        </SvgIcon>
      </Box>
    </m.div>
  );
}

export type PullAnimationOverlayProps = {
  stage: PullStage;
};

export function PullAnimationOverlay({ stage }: PullAnimationOverlayProps) {
  const { t } = useTranslation('pull');

  return (
    <Box
      sx={{
        // Full-viewport stage — the reveal should own the screen, not sit in a
        // column beside the sidebar.
        position: 'fixed',
        inset: 0,
        zIndex: (theme) => theme.zIndex.modal,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: { xs: '28px', md: '44px' },
        padding: '32px 16px',
        backgroundColor: '#08080A',
        backgroundImage:
          'radial-gradient(ellipse at 50% 35%, rgba(231,206,146,0.10) 0%, transparent 60%)',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 220,
          height: 220,
          // Scale the whole stage rather than each card, so the framer offsets
          // inside CardBack stay correct.
          transform: { md: 'scale(1.35)', lg: 'scale(1.6)' },
        }}
      >
        <AnimatePresence mode="wait">
          {stage === 'pulling' ? (
            <Box key="pulling" sx={{ position: 'relative', width: '100%', height: '100%' }}>
              <CardBack index={0} />
              <CardBack index={1} />
              <CardBack index={2} />
            </Box>
          ) : (
            <Box
              key="glowing"
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GlowingCard />
            </Box>
          )}
        </AnimatePresence>
      </Box>

      <Typography
        sx={{
          fontSize: '13px',
          letterSpacing: '0.04em',
          color: '#9A9285',
        }}
      >
        {stage === 'pulling' ? t('stage.pulling') : t('stage.glowing')}
      </Typography>
    </Box>
  );
}

export default PullAnimationOverlay;
