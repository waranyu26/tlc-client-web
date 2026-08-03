import type { TickerEvent } from 'src/api/types';

import { create } from 'zustand';

// ----------------------------------------------------------------------

const MAX_EVENTS = 30;

type TickerState = {
  events: TickerEvent[];
  connected: boolean;
  push: (event: TickerEvent) => void;
  setConnected: (connected: boolean) => void;
};

export const useTickerStore = create<TickerState>((set) => ({
  events: [],
  connected: false,
  push: (event) => set((state) => ({ events: [event, ...state.events].slice(0, MAX_EVENTS) })),
  setConnected: (connected) => set({ connected }),
}));
