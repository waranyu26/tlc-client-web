import type { TickerEvent } from './types';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------
// Public live-pull ticker (SSE). Frames: `data: {"type":"pull","data":{...}}\n\n`.
// ----------------------------------------------------------------------

export function subscribeTicker(onEvent: (event: TickerEvent) => void): () => void {
  const source = new EventSource(`${CONFIG.serverUrl}/api/v1/ticker`);

  const handleMessage = (event: MessageEvent<string>) => {
    try {
      const parsed = JSON.parse(event.data) as TickerEvent;
      onEvent(parsed);
    } catch {
      // ignore malformed frames
    }
  };

  source.addEventListener('message', handleMessage);

  return () => {
    source.removeEventListener('message', handleMessage);
    source.close();
  };
}
