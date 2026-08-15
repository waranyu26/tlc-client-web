import type { PullTier } from 'src/utils/rarity-intensity';

// ----------------------------------------------------------------------
// Pull sound effects, synthesised on the fly with the Web Audio API.
//
// No audio files and no audio library: the whole kit is a handful of
// oscillators, a noise buffer and gain envelopes. That keeps the bundle flat and
// sidesteps sourcing/licensing sfx assets.
//
// Two rules the callers rely on:
//   1. Nothing is audible until `setSfxEnabled(true)` — sound is opt-in and the
//      preference is persisted by `usePullPrefsStore`.
//   2. The AudioContext is created lazily inside `unlockSfx()`, which must be
//      called from a user gesture (the Pull tap). Constructing it on page load
//      leaves it `suspended` under browser autoplay policy and everything is
//      silent.
// ----------------------------------------------------------------------

const MASTER_LEVEL = 0.28;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let enabled = false;

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

/** Creates/resumes the AudioContext. Safe to call on every pull; only the first does work. */
export function unlockSfx() {
  if (typeof window === 'undefined') return;

  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
    if (!Ctor) return;
    try {
      ctx = new Ctor();
    } catch {
      ctx = null;
      return;
    }
    master = ctx.createGain();
    master.gain.value = enabled ? MASTER_LEVEL : 0;
    master.connect(ctx.destination);
  }

  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
}

export function setSfxEnabled(next: boolean) {
  enabled = next;
  if (ctx && master) {
    // Ramp rather than jump, so toggling mid-pull doesn't click.
    master.gain.setTargetAtTime(enabled ? MASTER_LEVEL : 0, ctx.currentTime, 0.02);
  }
}

export function isSfxEnabled() {
  return enabled;
}

/**
 * Guard every voice: returns the graph only when we're actually going to be heard.
 *
 * Deliberately does NOT require `state === 'running'`. `resume()` is async, and
 * browsers re-suspend an idle context on their own — Safari starts suspended even
 * inside a gesture, and Chrome will suspend one that has been quiet for a while
 * (entirely possible during a user-paced `peel`). Requiring 'running' therefore
 * dropped whole runs of sound on the floor. A suspended context has a frozen
 * clock, so anything scheduled here simply fires the moment it resumes.
 */
function live(): { ac: AudioContext; out: GainNode } | null {
  if (!enabled || !ctx || !master) return null;
  if (ctx.state === 'suspended') void ctx.resume();
  return { ac: ctx, out: master };
}

/** One second of white noise, reused by every percussive voice. */
function noiseBuffer(ac: AudioContext): AudioBuffer {
  if (!noise) {
    noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  return noise;
}

type BurstOptions = {
  durationMs: number;
  gain: number;
  type: BiquadFilterType;
  /** Filter frequency at the start and end of the burst — equal values hold it steady. */
  fromHz: number;
  toHz: number;
  q?: number;
  delayMs?: number;
};

function noiseBurst({ durationMs, gain, type, fromHz, toHz, q = 1, delayMs = 0 }: BurstOptions) {
  const l = live();
  if (!l) return;
  const { ac, out } = l;

  const at = ac.currentTime + delayMs / 1000;
  const dur = durationMs / 1000;

  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac);

  const filter = ac.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(fromHz, at);
  filter.frequency.exponentialRampToValueAtTime(Math.max(40, toHz), at + dur);

  const env = ac.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(gain, at + Math.min(0.02, dur * 0.3));
  env.gain.exponentialRampToValueAtTime(0.0001, at + dur);

  src.connect(filter).connect(env).connect(out);
  src.start(at);
  src.stop(at + dur);
}

type ToneOptions = {
  freq: number;
  durationMs: number;
  gain: number;
  type?: OscillatorType;
  delayMs?: number;
  /** Glide to this frequency across the note. */
  toFreq?: number;
};

function tone({ freq, durationMs, gain, type = 'sine', delayMs = 0, toFreq }: ToneOptions) {
  const l = live();
  if (!l) return;
  const { ac, out } = l;

  const at = ac.currentTime + delayMs / 1000;
  const dur = durationMs / 1000;

  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  if (toFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, toFreq), at + dur);

  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(gain, at + Math.min(0.04, dur * 0.25));
  env.gain.exponentialRampToValueAtTime(0.0001, at + dur);

  osc.connect(env).connect(out);
  osc.start(at);
  osc.stop(at + dur);
}

// ----------------------------------------------------------------------
// The kit
// ----------------------------------------------------------------------

/** Dry riffle click. `index` detunes successive ticks so a burst doesn't sound looped. */
export function shuffleTick(index = 0) {
  const hz = 2200 + ((index * 137) % 900);
  noiseBurst({ durationMs: 45, gain: 0.5, type: 'bandpass', fromHz: hz, toHz: hz * 0.7, q: 7 });
}

/** A card landing in its slot. */
export function dealTick(index = 0) {
  noiseBurst({
    durationMs: 70,
    gain: 0.34,
    type: 'bandpass',
    fromHz: 1500,
    toHz: 620,
    q: 3,
    delayMs: index * 55,
  });
}

/** Barely-there tick as the pointer crosses a card. */
export function hoverTick() {
  noiseBurst({ durationMs: 26, gain: 0.14, type: 'highpass', fromHz: 3400, toHz: 3400 });
}

/** The chosen card commits — a downward thunk with a little body. */
export function pickThunk() {
  noiseBurst({ durationMs: 130, gain: 0.42, type: 'lowpass', fromHz: 2600, toHz: 320 });
  tone({ freq: 190, toFreq: 96, durationMs: 200, gain: 0.2, type: 'triangle' });
}

/** The other cards sweeping off screen. */
export function whoosh(durationMs = 620) {
  noiseBurst({ durationMs, gain: 0.3, type: 'bandpass', fromHz: 420, toHz: 3200, q: 1.2 });
}

/** Rising suspense bed held for the whole charge window. Pitch ceiling scales with tier. */
export function charge(durationMs: number, tier: PullTier) {
  const l = live();
  if (!l) return;
  const { ac, out } = l;

  const at = ac.currentTime;
  const dur = durationMs / 1000;
  const ceiling = { standard: 420, rare: 560, epic: 760, legendary: 1040 }[tier];

  const osc = ac.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(96, at);
  osc.frequency.exponentialRampToValueAtTime(ceiling, at + dur);

  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 6;
  filter.frequency.setValueAtTime(320, at);
  filter.frequency.exponentialRampToValueAtTime(4200, at + dur);

  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(0.16, at + dur * 0.75);
  env.gain.exponentialRampToValueAtTime(0.0001, at + dur);

  osc.connect(filter).connect(env).connect(out);
  osc.start(at);
  osc.stop(at + dur);
}

/** Soft grain as the sleeve slides — fired every ~12% of the drag. */
export function peelTick() {
  noiseBurst({ durationMs: 34, gain: 0.16, type: 'bandpass', fromHz: 1400, toHz: 1000, q: 2.5 });
}

/** The sleeve clearing the card. */
export function peelRelease() {
  noiseBurst({ durationMs: 420, gain: 0.34, type: 'lowpass', fromHz: 4200, toHz: 500 });
}

/** The card turning over. */
export function flipSnap() {
  noiseBurst({ durationMs: 90, gain: 0.4, type: 'bandpass', fromHz: 3000, toHz: 900, q: 2 });
  tone({ freq: 880, toFreq: 330, durationMs: 110, gain: 0.16, type: 'triangle' });
}

/**
 * The payoff. A rising arpeggio whose length and voicing scale with the tier —
 * legendary adds an octave and a sustained pad underneath.
 */
export function payoff(tier: PullTier) {
  const NOTES = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5 E5 G5 C6 E6
  const count = { standard: 1, rare: 2, epic: 3, legendary: 5 }[tier];
  const step = { standard: 0, rare: 90, epic: 80, legendary: 75 }[tier];

  NOTES.slice(0, count).forEach((freq, i) => {
    tone({ freq, durationMs: 620, gain: 0.2, type: 'sine', delayMs: i * step });
    // A quiet triangle an octave up gives the chime some sparkle.
    tone({ freq: freq * 2, durationMs: 380, gain: 0.05, type: 'triangle', delayMs: i * step });
  });

  if (tier === 'legendary') {
    tone({ freq: 130.81, durationMs: 2200, gain: 0.12, type: 'sine' }); // C3 pad
    tone({ freq: 196, durationMs: 2000, gain: 0.08, type: 'sine', delayMs: 120 }); // G3
  }
}

/** Short confirmation blip, used as the preview when the sound toggle is switched on. */
export function toggleBlip() {
  tone({ freq: 660, durationMs: 140, gain: 0.18, type: 'sine' });
}
