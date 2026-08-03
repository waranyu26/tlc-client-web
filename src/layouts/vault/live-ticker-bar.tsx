import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';

import { subscribeTicker } from 'src/api/ticker.api';

import { TickerStrip } from 'src/components/vault';

// ----------------------------------------------------------------------
// Live activity strip pinned to the top of the content pane on every
// authenticated route. Previously this lived inside the Home view only; on a
// desktop canvas it doubles as the pane header and reinforces the "live
// platform" read, so it was promoted into the shell.
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
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(17,16,25,0.92)',
      }}
    >
      <TickerStrip items={items} />
    </Box>
  );
}

export default LiveTickerBar;
