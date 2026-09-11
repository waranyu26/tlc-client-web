// Imported for its side effect: loading the store is what subscribes the audio
// module to the preference, and the preference is what drives playback.
import 'src/store/music-prefs-store';

import { useEffect } from 'react';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';

import { resume, suspend } from 'src/lib/music';
import { isStagePhase, usePullFlowStore } from 'src/store/pull-flow-store';

// ----------------------------------------------------------------------
// Mount point for the background music.
//
// Renders nothing. Playback lives in `src/lib/music`, driven by
// `music-prefs-store`, because the moment that matters is the click itself and
// a React effect does not run in it.
//
// There is deliberately no unmount cleanup. It used to call stop() to keep
// music off the login screen, and that was the bug that left refreshed pages
// silent: StrictMode runs effects mount → cleanup → mount, so the simulated
// unmount fired moments after load and tore down the listeners waiting for the
// first click. Sign-out is handled in the sign-out path instead, where it is a
// deliberate act rather than a side effect of a component going away.
// ----------------------------------------------------------------------

/**
 * How long after the stage clears before the loop comes back.
 *
 * The pull's payoff sound fires on the same transition, and sliding music in
 * underneath it takes the edge off the one moment the whole sequence is built
 * around.
 */
const RESUME_DELAY_MS = 1400;

/**
 * Prefix of the routes that stay silent.
 *
 * Signing in is a task, not an experience: someone typing a password, or
 * bouncing through an OAuth callback, is not there for the atmosphere, and a
 * loop starting underneath a login form reads as the page misbehaving.
 *
 * Derived from `paths` rather than written out, so renaming a route cannot
 * quietly leave music playing where it should not.
 */
const SILENT_ROUTE_PREFIX = paths.auth.signIn.slice(0, paths.auth.signIn.lastIndexOf('/'));

export function BackgroundMusic() {
  // Driven off the phase rather than hooked into the pull's start and end,
  // so it cannot be left suspended by a path nobody thought about: a refund, a
  // failed commit, or simply navigating away mid-pull all land back on a phase
  // that is not the stage, and the music returns on its own.
  const onStage = usePullFlowStore((state) => isStagePhase(state.phase));
  const onAuthRoute = usePathname().startsWith(SILENT_ROUTE_PREFIX);

  useEffect(() => {
    if (onAuthRoute || onStage) {
      // Two reasons, one mechanism. The pull's sound effects are the point of
      // the sequence and a loop underneath them is exactly loud enough to bury
      // the one thing the customer is listening for; the auth pages are a task
      // rather than a place to linger.
      suspend();
      return undefined;
    }

    const timer = setTimeout(resume, RESUME_DELAY_MS);
    return () => clearTimeout(timer);
  }, [onAuthRoute, onStage]);

  return null;
}

export default BackgroundMusic;
