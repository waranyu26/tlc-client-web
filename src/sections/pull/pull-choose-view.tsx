import type { KeyboardEvent } from 'react';

import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useRef, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import { PICK_CARD_COUNT } from 'src/store/pull-flow-store';
import { dealTick, hoverTick, shuffleTick } from 'src/lib/pull-sfx';

import { CardBack } from 'src/components/vault';

import { PickCard } from './pick-card';

// ----------------------------------------------------------------------
// "Choose your card": a deck riffles, deals twelve backs into a grid, and waits.
//
// The pick is presentational — the server settled the outcome the instant the
// pull was charged — and the copy says so out loud. This app sells itself on
// audited pull rates, so a choice that quietly pretends to matter would cost
// more trust than the ritual is worth.
// ----------------------------------------------------------------------

const RIFFLE_TICKS = 7;
const RIFFLE_TICK_MS = 55;

/** Pushes an unpicked card away from the grid's centre, so the twelve scatter outward. */
function disperseVector(index: number, columns: number) {
  const rows = Math.ceil(PICK_CARD_COUNT / columns);
  const col = index % columns;
  const row = Math.floor(index / columns);
  const dx = col - (columns - 1) / 2;
  const dy = row - (rows - 1) / 2;
  return { x: dx * 120, y: dy * 150 - 40, rotate: dx * 12 };
}

export type PullChooseViewProps = {
  onPick: (index: number) => void;
  /**
   * Once set, the grid stops being a choice: the chosen card is unmounted so
   * framer can hand its layoutId to the suspense stage, and the other eleven
   * blow outward.
   */
  pickedIndex?: number | null;
  reduceMotion?: boolean;
};

export function PullChooseView({
  onPick,
  pickedIndex = null,
  reduceMotion = false,
}: PullChooseViewProps) {
  const { t } = useTranslation('pull');
  const theme = useTheme();

  // Must mirror the gridTemplateColumns below — arrow-key navigation needs to
  // know how wide a row actually is at the current breakpoint.
  const isMd = useMediaQuery(theme.breakpoints.up('md'));
  const columns = isMd ? 6 : 4;

  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Riffle + deal sfx. The deal ticks are scheduled on the audio clock in one
  // pass so they stay locked to the visual stagger even under a busy main thread.
  useEffect(() => {
    if (reduceMotion) return undefined;

    const timers = Array.from({ length: RIFFLE_TICKS }, (_, i) =>
      setTimeout(() => shuffleTick(i), i * RIFFLE_TICK_MS)
    );
    const dealTimer = setTimeout(() => {
      for (let i = 0; i < PICK_CARD_COUNT; i += 1) dealTick(i);
    }, 340);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(dealTimer);
    };
  }, [reduceMotion]);

  /** Arrow-key roving focus across the grid, wrapping at the ends. */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const current = cardRefs.current.findIndex((node) => node === document.activeElement);
      if (current < 0) return;

      const deltas: Record<string, number> = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -columns,
        ArrowDown: columns,
      };

      let next: number | null = null;
      if (event.key in deltas) {
        next = (current + deltas[event.key] + PICK_CARD_COUNT) % PICK_CARD_COUNT;
      } else if (event.key === 'Home') {
        next = 0;
      } else if (event.key === 'End') {
        next = PICK_CARD_COUNT - 1;
      }

      if (next === null) return;
      event.preventDefault();
      cardRefs.current[next]?.focus();
    },
    [columns]
  );

  return (
    <Box
      // The stage's tap-to-skip lives on an ancestor; a tap meant for a card must
      // not also count as "skip the whole thing".
      onClick={(event) => event.stopPropagation()}
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: { xs: 420, sm: 560, md: 940 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: '14px', md: '20px' },
      }}
    >
      <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Typography
          sx={{
            fontFamily: `'Cormorant Garamond', serif`,
            fontSize: { xs: '24px', md: '30px' },
            fontWeight: 600,
            color: '#F4ECDD',
          }}
        >
          {t('choose.title')}
        </Typography>
        <Typography sx={{ fontSize: '12px', color: '#9A9285', maxWidth: 420 }}>
          {t('choose.honesty')}
        </Typography>
      </Box>

      <Box sx={{ position: 'relative', width: '100%' }}>
        <Box
          role="group"
          aria-label={t('choose.gridAria')}
          onKeyDown={handleKeyDown}
          sx={{
            display: 'grid',
            // 4/6 rather than 3/4/6: at the catalogue's card ratio each cell is
            // 1.7× as tall as it is wide, and three columns pushes twelve cards
            // to four rows — taller than a phone viewport.
            gridTemplateColumns: { xs: 'repeat(4, 1fr)', md: 'repeat(6, 1fr)' },
            gap: { xs: '10px', md: '14px' },
          }}
        >
          {Array.from({ length: PICK_CARD_COUNT }, (_, index) => {
            // The chosen card leaves the grid entirely — PullSuspenseView picks
            // up its layoutId and continues the same element to centre stage.
            if (pickedIndex === index) {
              return <Box key={index} sx={{ visibility: 'hidden' }} aria-hidden />;
            }
            return (
              <PickCard
                key={index}
                index={index}
                reduceMotion={reduceMotion}
                disabled={pickedIndex !== null}
                disperseTo={pickedIndex === null ? undefined : disperseVector(index, columns)}
                onPick={onPick}
                onHoverStart={hoverTick}
                registerRef={(node) => {
                  cardRefs.current[index] = node;
                }}
                ariaLabel={t('choose.cardAria', { index: index + 1, total: PICK_CARD_COUNT })}
              />
            );
          })}
        </Box>

        {/* The deck the hand is dealt from — riffles, then hands off to the grid. */}
        {!reduceMotion ? (
          <m.div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 96,
              marginLeft: -48,
              marginTop: -58,
              pointerEvents: 'none',
            }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0.86 }}
            transition={{ duration: 0.24, delay: 0.36 }}
          >
            {[0, 1, 2].map((layer) => (
              <m.div
                key={layer}
                style={{
                  position: layer === 0 ? 'relative' : 'absolute',
                  inset: layer === 0 ? undefined : 0,
                }}
                animate={{ x: [0, 7 - layer * 5, 0], rotate: [0, 4 - layer * 3.5, 0] }}
                transition={{ duration: 0.19, repeat: 2, ease: 'easeInOut' }}
              >
                <CardBack sheen={false} />
              </m.div>
            ))}
          </m.div>
        ) : null}
      </Box>
    </Box>
  );
}

export default PullChooseView;
