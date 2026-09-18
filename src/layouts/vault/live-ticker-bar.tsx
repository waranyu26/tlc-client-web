import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';

import { subscribeTicker } from 'src/api/ticker.api';

import { TickerStrip } from 'src/components/vault';

import { APP_HEADER_HEIGHT } from './layout-config';

// ----------------------------------------------------------------------
// Live activity strip pinned to the top of the content pane on every route,
// signed in or not — the stream is public, and a guest deciding whether this is
// a real shop is exactly who it is for.
//
// It used to carry language and music on its right-hand end, because it was the
// only thing at the top of a desktop viewport. AppHeader is now, and it has the
// height for a real control, so the strip went back to being only the strip:
// two bars each offering a language switch would have been one too many.
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
        // Sticks *under* the header rather than at the viewport top, or the two
        // would overlap the moment the page scrolls.
        top: { md: `${APP_HEADER_HEIGHT}px` },
        zIndex: (theme) => theme.zIndex.appBar - 1,
        display: 'flex',
        alignItems: 'stretch',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(17,16,25,0.92)',
      }}
    >
      <TickerStrip items={items} sx={{ flex: 1, minWidth: 0 }} />
    </Box>
  );
}

export default LiveTickerBar;
