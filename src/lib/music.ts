import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------
// Background music, with no React in it.
//
// Deliberately a plain module rather than a component, for the same reason
// `pull-sfx` is: the moment that matters is the click itself, and a React
// effect does not run in it. Effects are flushed after commit, a task or more
// later, and mobile browsers only grant playback to a play() call made in the
// same task as the gesture. Desktop Chrome is loose enough to have hidden this
// — it leans on its Media Engagement Index and often allows playback outright —
// while on a phone the toggle simply did nothing.
//
// So the store calls straight into here on change (zustand notifies its
// subscribers synchronously, inside the click), and the element is owned here
// where any caller can reach it.
// ----------------------------------------------------------------------

/**
 * Events that may carry a user activation.
 *
 * Broader than strictly necessary on purpose. Missing the activation costs the
 * whole feature, while a redundant play() on an element that is already playing
 * costs nothing — so this errs heavily towards firing too often.
 */
const GESTURES = [
  'pointerdown',
  'pointerup',
  'mousedown',
  'touchstart',
  'touchend',
  'click',
  'keydown',
] as const;

let audio: HTMLAudioElement | null = null;
let wanted = false;
let armed = false;

function element(): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null;
  if (!audio) {
    audio = new Audio(CONFIG.music.trackUrl);
    audio.loop = true;
    audio.volume = CONFIG.music.volume;
    // Fetch ahead of the gesture. The gesture is the one moment we are allowed
    // to make sound; spending it on a five-megabyte download turns "tap and it
    // plays" into "tap, wait, then it plays" — and a play() that resolves after
    // the activation window has closed is a play() that gets refused.
    audio.preload = 'auto';
  }
  return audio;
}

function onGesture() {
  start();
}

function arm() {
  if (armed) return;
  armed = true;

  // Capture phase, and on `document` rather than `window`: a handler anywhere
  // in the tree that calls stopPropagation would otherwise hide the gesture
  // from a bubble-phase listener, and the one gesture we miss is the one that
  // would have started the track.
  GESTURES.forEach((type) =>
    document.addEventListener(type, onGesture, { capture: true, passive: true })
  );
  // If a gesture arrived while the file was still downloading, this is the only
  // thing that tries again once there is something to play.
  element()?.addEventListener('canplay', onGesture);
  // A tab loaded in the background cannot start audio at all; try again when it
  // is actually in front of someone.
  document.addEventListener('visibilitychange', onGesture);
}

function disarm() {
  if (!armed) return;
  armed = false;
  GESTURES.forEach((type) => document.removeEventListener(type, onGesture, { capture: true }));
  element()?.removeEventListener('canplay', onGesture);
  document.removeEventListener('visibilitychange', onGesture);
}

/**
 * Attempt playback now.
 *
 * Safe to call from anywhere, but call it *synchronously* inside a gesture
 * handler wherever possible — that is the only call a strict mobile browser
 * will honour.
 *
 * There is deliberately no `paused` guard. Calling play() on an element that is
 * already playing is a no-op that resolves, whereas skipping the call because
 * the element *looks* unpaused can swallow the one attempt that had a real
 * user gesture behind it: play() flips `paused` to false the instant it is
 * called, well before it may reject.
 */
export function start(): void {
  const el = element();
  if (!el || !wanted) {
    if (import.meta.env.DEV) {
      console.info('[music] start() ignored', { hasElement: !!el, wanted });
    }
    return;
  }

  el.play().then(
    // Playing for real — nothing left to wait for.
    () => {
      if (import.meta.env.DEV) console.info('[music] playing');
      disarm();
    },
    () => {
      // Refused, or not ready. Stay armed: the listeners must outlive a failed
      // attempt, or the first tap retires the feature for the whole session.
      arm();
      if (import.meta.env.DEV) {
        console.info('[music] blocked for now — will retry on the next interaction');
      }
    }
  );
}

export function stop(): void {
  disarm();
  element()?.pause();
}

/**
 * Point of entry for the preference. Called synchronously by the store's
 * subscriber, so a toggle reaches play() inside the click that caused it.
 */
export function setMusicEnabled(enabled: boolean): void {
  wanted = enabled;

  if (!enabled) {
    stop();
    return;
  }

  start();
  // Armed even when the immediate attempt is still in flight, so a page opened
  // cold — a refresh, where nothing has been interacted with yet — starts on
  // whatever the visitor touches first rather than never starting at all.
  arm();
}
