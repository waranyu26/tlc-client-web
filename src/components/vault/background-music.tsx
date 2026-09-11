// Imported for its side effect: loading the store is what subscribes the audio
// module to the preference, and the preference is what drives playback.
import 'src/store/music-prefs-store';

// ----------------------------------------------------------------------
// Mount point for the background music.
//
// Renders nothing and, deliberately, does nothing else. Playback lives in
// `src/lib/music` driven by `music-prefs-store`, because the moment that
// matters is the click itself and a React effect does not run in it.
//
// In particular there is no unmount cleanup here any more. It used to call
// stop() to keep music off the login screen after a sign-out, and that was the
// bug that left a refreshed page silent: StrictMode runs effects mount →
// cleanup → mount, so the simulated unmount fired stop() moments after load,
// disarming the very gesture listeners that were waiting for the first click.
// Nothing re-armed them, so clicking did nothing — while toggling still worked,
// because that calls into the module again.
//
// The lesson is the general one: this component does not own the audio, so it
// has no business tearing it down on a lifecycle event it does not control.
// Stopping on sign-out belongs in the sign-out path, where it is an explicit
// act rather than a side effect of a component going away.
// ----------------------------------------------------------------------

export function BackgroundMusic() {
  return null;
}

export default BackgroundMusic;
