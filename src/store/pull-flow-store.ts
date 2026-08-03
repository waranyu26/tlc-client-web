import type { PullResult } from 'src/api/types';

import { create } from 'zustand';

// ----------------------------------------------------------------------
// State machine driving the gacha pull overlay: idle -> pack -> pulling -> reveal
// (-> buyback, optional). `stage` tracks the sub-animation while `overlay === 'pulling'`.
// ----------------------------------------------------------------------

export type PullOverlay = 'idle' | 'pack' | 'pulling' | 'reveal' | 'buyback';
export type PullStage = 'pulling' | 'glowing' | 'reveal';

type PullFlowState = {
  overlay: PullOverlay;
  stage: PullStage;
  result: PullResult | null;
  setOverlay: (overlay: PullOverlay) => void;
  startPull: () => void;
  setResult: (result: PullResult) => void;
  reset: () => void;
};

const initialState = {
  overlay: 'idle' as PullOverlay,
  stage: 'pulling' as PullStage,
  result: null as PullResult | null,
};

export const usePullFlowStore = create<PullFlowState>((set) => ({
  ...initialState,
  setOverlay: (overlay) => set({ overlay }),
  startPull: () => set({ overlay: 'pulling', stage: 'pulling', result: null }),
  setResult: (result) => set({ result, overlay: 'reveal', stage: 'reveal' }),
  reset: () => set({ ...initialState }),
}));
