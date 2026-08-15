import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { setSfxEnabled } from 'src/lib/pull-sfx';

// ----------------------------------------------------------------------
// Preferences for the pull experience, persisted across sessions.
//
// Sound defaults ON. That is not autoplay: the AudioContext is only created
// inside the Pull tap, so nothing can make a noise until the user has
// deliberately asked for a pull, and the toggle sits right next to the button.
// A silent gacha pull is a worse default than a loud one.
//
// `skipPick` defaults off — the ritual is the point for a first-time puller. It
// exists for the regulars who have seen it a hundred times.
// ----------------------------------------------------------------------

type PullPrefsState = {
  soundEnabled: boolean;
  skipPick: boolean;
  toggleSound: () => void;
  toggleSkipPick: () => void;
};

export const usePullPrefsStore = create<PullPrefsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      skipPick: false,
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleSkipPick: () => set((state) => ({ skipPick: !state.skipPick })),
    }),
    // Key is versioned: anyone carrying a persisted `soundEnabled: false` from
    // the muted-by-default build would otherwise never hear the new default.
    { name: 'tlc.pull-prefs.v2' }
  )
);

// Keep the audio module's mute gate in sync with the stored preference, both at
// boot (after rehydration) and on every toggle. pull-sfx has no React
// dependency, so this is the one place the two are wired together.
setSfxEnabled(usePullPrefsStore.getState().soundEnabled);
usePullPrefsStore.subscribe((state) => setSfxEnabled(state.soundEnabled));
