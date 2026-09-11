import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { setMusicEnabled } from 'src/lib/music';

// ----------------------------------------------------------------------
// Background music preference, persisted across sessions.
//
// Deliberately separate from `pull-prefs-store`'s `soundEnabled`. That one
// gates the pull's sound effects — short, tied to a tap the user just made.
// This one gates an ambient loop that plays on its own, and someone may well
// want the slab landing with a thud while the lounge music stays off. One flag
// for both would make each toggle lie about the other.
//
// No track has been chosen yet, so nothing plays and this only records intent.
// When a track does land, the player subscribes here exactly as `pull-sfx` does
// for effects — the preference is already durable, so it will not need
// re-plumbing then.
//
// Note this means "wants music", not "is playing": browsers refuse to start
// audio before a user gesture, so a fresh tab with the flag on is still silent
// until the visitor touches something.
//
// The player is driven from here rather than from a React effect. zustand
// notifies subscribers synchronously inside the setState call, so a toggle
// reaches play() in the same task as the click that caused it — which is the
// only thing a mobile browser will accept. An effect runs after commit, by
// which time the activation is gone.
// ----------------------------------------------------------------------

type MusicPrefsState = {
  musicEnabled: boolean;
  toggleMusic: () => void;
  setMusicEnabled: (enabled: boolean) => void;
};

export const useMusicPrefsStore = create<MusicPrefsState>()(
  persist(
    (set) => ({
      musicEnabled: true,
      toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
      setMusicEnabled: (musicEnabled) => set({ musicEnabled }),
    }),
    { name: 'tlc.music-prefs.v1' }
  )
);

// Wire the audio module to the stored preference, at boot (after rehydration)
// and on every change. Mirrors how pull-prefs drives pull-sfx; music.ts has no
// React dependency, so this is the one place the two meet.
setMusicEnabled(useMusicPrefsStore.getState().musicEnabled);
useMusicPrefsStore.subscribe((state) => setMusicEnabled(state.musicEnabled));
