import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';

import { subscribeTicker } from 'src/api/ticker.api';

import { TickerStrip, MusicToggle, LanguageToggle } from 'src/components/vault';

// ----------------------------------------------------------------------
// Live activity strip pinned to the top of the content pane on every
// authenticated route. Previously this lived inside the Home view only; on a
// desktop canvas it doubles as the pane header and reinforces the "live
// platform" read, so it was promoted into the shell.
//
// Because it already is the desktop pane header, it is also the only thing at
// the top of a desktop viewport — so language and music ride on its right-hand
// end rather than justifying a second bar above it. They are hidden below `md`,
// where MobileTopBar carries the same two controls; rendering both would put
// two language switches on one screen.
// ----------------------------------------------------------------------

const MAX_ITEMS = 12;

export function LiveTickerBar() {
  const { t } = useTranslation('home');
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeTicker((event) => {
      if (event.type !== 'pull' || !event.data) return;

      const label = t('ticker.event', {
        card: event.data.card_name,
        rarity: event.data.rarity,
        defaultValue: 'Someone just pulled {{card}} ({{rarity}})',
      });

      setItems((prev) => [label, ...prev].slice(0, MAX_ITEMS));
    });

    return unsubscribe;
  }, [t]);

  return (
    <Box
      sx={{
        position: { md: 'sticky' },
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar - 1,
        display: 'flex',
        alignItems: 'stretch',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(17,16,25,0.92)',
      }}
    >
      <TickerStrip items={items} sx={{ flex: 1, minWidth: 0 }} />

      {/*
        Matches the strip's own background and bottom border so the two read as
        one bar rather than a strip with something bolted beside it.

        Both controls are deliberately shorter than the strip's own 34px: the
        parent stretches them to its height, so as long as they stay under it
        the bar does not grow and nothing below shifts down a row.
      */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          gap: 0.5,
          flexShrink: 0,
          pr: 1.5,
          pl: 1,
          bgcolor: '#111019',
          borderBottom: '1px solid rgba(231,206,146,0.08)',
        }}
      >
        <LanguageToggle />
        <MusicToggle size="small" />
      </Box>
    </Box>
  );
}

export default LiveTickerBar;
