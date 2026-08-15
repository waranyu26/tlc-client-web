import type { PullResult } from 'src/api/types';

import { create } from 'zustand';

// ----------------------------------------------------------------------
// State machine driving the gacha pull:
//
//   idle -> shuffle -> choosing -> converge -> charge -> flip -> reveal (-> buyback)
//
// `result` is deliberately NOT tied to `phase`. The API call fires at `shuffle`
// and usually lands while the user is still choosing, so the result is stored
// the moment it arrives — long before the reveal is on screen. That head start
// is what lets the buyback quote and the card art be ready on the reveal's first
// painted frame instead of popping in afterwards.
//
// Timing lives in `src/sections/pull/use-pull-sequence.ts`, the only place
// allowed to advance `phase`. Every view is purely presentational per phase.
// ----------------------------------------------------------------------

export const PICK_CARD_COUNT = 12;

export type PullPhase =
  | 'idle'
  | 'shuffle'
  | 'choosing'
  | 'converge'
  | 'charge'
  | 'flip'
  | 'peel'
  | 'reveal'
  | 'buyback';

/** Phases that own the full-viewport stage rather than the normal page column. */
export function isStagePhase(phase: PullPhase): boolean {
  return (
    phase === 'shuffle' ||
    phase === 'choosing' ||
    phase === 'converge' ||
    phase === 'charge' ||
    phase === 'flip' ||
    phase === 'peel'
  );
}

type PullFlowState = {
  phase: PullPhase;
  result: PullResult | null;
  /** Which of the PICK_CARD_COUNT backs the user chose — drives the converge geometry. */
  pickedIndex: number | null;
  /** True once the revealed card's art has decoded, so the flip never shows a blank face. */
  imageReady: boolean;

  setPhase: (phase: PullPhase) => void;
  startPull: () => void;
  setResult: (result: PullResult) => void;
  setPickedIndex: (index: number) => void;
  setImageReady: (ready: boolean) => void;
  /** Jump straight to the reveal, skipping the choreography (recovery + reduced-motion paths). */
  revealImmediately: (result: PullResult) => void;
  reset: () => void;
};

const initialState = {
  phase: 'idle' as PullPhase,
  result: null as PullResult | null,
  pickedIndex: null as number | null,
  imageReady: false,
};

export const usePullFlowStore = create<PullFlowState>((set) => ({
  ...initialState,
  setPhase: (phase) => set({ phase }),
  startPull: () => set({ ...initialState, phase: 'shuffle' }),
  setResult: (result) => set({ result }),
  setPickedIndex: (pickedIndex) => set({ pickedIndex }),
  setImageReady: (imageReady) => set({ imageReady }),
  revealImmediately: (result) => set({ result, phase: 'reveal', imageReady: true }),
  reset: () => set({ ...initialState }),
}));
