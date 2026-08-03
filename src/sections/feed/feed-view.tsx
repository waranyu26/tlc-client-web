import './i18n';

import type { TickerEvent } from 'src/api/types';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { subscribeTicker } from 'src/api/ticker.api';
import { useTickerStore } from 'src/store/ticker-store';
import { gridGap, feedGridColumns } from 'src/layouts/vault/layout-config';

import { Iconify } from 'src/components/iconify';
import { FadeUp, LiveDot, SectionHeading } from 'src/components/vault';

import { getRelativeTimeParts } from './utils';
import { FeedEventCard } from './feed-event-card';

// ----------------------------------------------------------------------

const MAX_ENTRIES = 30;
const CLOCK_TICK_MS = 15_000;

type FeedEntry = {
  id: string;
  event: TickerEvent;
  receivedAt: number;
};

let entrySeq = 0;

export function FeedView() {
  const { t } = useTranslation('feed');

  const push = useTickerStore((state) => state.push);
  const connected = useTickerStore((state) => state.connected);
  const setConnected = useTickerStore((state) => state.setConnected);

  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [now, setNow] = useState(() => Date.now());

  // Subscribe on mount, unsubscribe on unmount. `subscribeTicker` opens its own
  // EventSource, which reconnects natively on drop — no manual retry loop needed.
  useEffect(() => {
    const unsubscribe = subscribeTicker((event) => {
      push(event);
      entrySeq += 1;
      setEntries((prev) =>
        [{ id: `${Date.now()}-${entrySeq}`, event, receivedAt: Date.now() }, ...prev].slice(
          0,
          MAX_ENTRIES
        )
      );
    });
    setConnected(true);

    return () => {
      unsubscribe();
      setConnected(false);
    };
  }, [push, setConnected]);

  // Re-render periodically so relative timestamps ("2m", "1h"...) stay fresh.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ px: '16px', py: '20px' }}>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: '18px' }}
      >
        <Box>
          <SectionHeading>{t('title')}</SectionHeading>
          <Typography sx={{ color: '#9A9285', fontSize: '13px', mt: '4px' }}>
            {t('subtitle')}
          </Typography>
        </Box>

        <Stack direction="row" spacing="6px" sx={{ alignItems: 'center' }}>
          <LiveDot size={6} />
          <Typography
            sx={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: connected ? '#E7CE92' : '#5A5550',
            }}
          >
            {connected ? t('live') : t('connecting')}
          </Typography>
        </Stack>
      </Stack>

      {entries.length === 0 ? (
        <FadeUp>
          <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', py: 8 }}>
            <Iconify icon="solar:inbox-in-bold" width={32} sx={{ color: '#5A5550' }} />
            <Typography sx={{ color: '#F4ECDD', fontWeight: 600, fontSize: '15px' }}>
              {t('empty.title')}
            </Typography>
            <Typography sx={{ color: '#9A9285', fontSize: '12.5px', maxWidth: 420 }}>
              {t('empty.subtitle')}
            </Typography>
          </Stack>
        </FadeUp>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: feedGridColumns, gap: gridGap }}>
          {entries.map((entry, index) => {
            const parts = getRelativeTimeParts(entry.receivedAt, now);
            const timeLabel =
              parts.unit === 'now'
                ? t('time.justNow')
                : t(`time.${parts.unit}`, { count: parts.count });

            return (
              <FadeUp key={entry.id} delay={index === 0 ? 0 : Math.min(index * 0.02, 0.2)}>
                <FeedEventCard
                  userId={entry.event.data.user_id}
                  cardName={entry.event.data.card_name}
                  rarity={entry.event.data.rarity}
                  timeLabel={timeLabel}
                  pulledLabel={t('pulled')}
                />
              </FadeUp>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
