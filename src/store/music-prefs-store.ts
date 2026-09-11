import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
