import { useRef, useEffect } from 'react';

import { CONFIG } from 'src/global-config';
import { useMusicPrefsStore } from 'src/store/music-prefs-store';

// ----------------------------------------------------------------------
// The looping background track.
//
// Renders nothing. It owns one <audio> element for the life of the app shell,
// so navigating between routes does not restart the track — remounting a player
// per page would make the music stutter back to bar one every time someone
// opened their vault.
//
// The file is served from the asset bucket, not bundled. See CONFIG.music.
//
// `preload="none"` is the reason the muted case costs nothing: the browser
// fetches not a byte until play() is called, so a visitor who has music off
// never downloads five megabytes to ignore it.
// ----------------------------------------------------------------------

/** Gestures that count as "the user has interacted", per the autoplay policy. */
const GESTURES = ['pointerdown', 'keydown', 'touchstart'] as const;

export function BackgroundMusic() {
  const musicEnabled = useMusicPrefsStore((state) => state.musicEnabled);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // One element, created once, never re-created by a re-render.
  if (audioRef.current === null && typeof Audio !== 'undefined') {
    const audio = new Audio(CONFIG.music.trackUrl);
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = CONFIG.music.volume;
    audioRef.current = audio;
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    if (!musicEnabled) {
      // Pause rather than stop: the position is kept, so unmuting resumes the
      // phrase instead of snapping back to the top of the track.
      audio.pause();
      return undefined;
    }

    let cancelled = false;
    let detach: (() => void) | undefined;

    const attempt = () => {
      // play() rejects rather than throws, and a rejection here is the ordinary
      // case on a cold load — not an error worth reporting.
      audio.play().catch(() => {
        if (cancelled) return;

        // Browsers refuse audio until the visitor has interacted with the page,
        // so a stored preference alone cannot start a track. Wait for the first
        // gesture — any gesture, including one aimed at something else — and
        // try once more. Without this, "music on" would silently never play for
        // anyone who returns to a tab and does not happen to press play.
        const onGesture = () => {
          detach?.();
          detach = undefined;
          if (!cancelled && useMusicPrefsStore.getState().musicEnabled) {
            audio.play().catch(() => {});
          }
        };

        GESTURES.forEach((type) =>
          window.addEventListener(type, onGesture, { once: true, passive: true })
        );
        detach = () => GESTURES.forEach((type) => window.removeEventListener(type, onGesture));
      });
    };

    attempt();

    return () => {
      cancelled = true;
      detach?.();
    };
  }, [musicEnabled]);

  // Stop the track when the shell itself goes away, so a sign-out does not
  // leave music playing over the login screen.
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  return null;
}

export default BackgroundMusic;
