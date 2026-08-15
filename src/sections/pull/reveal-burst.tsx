import type { PullIntensity } from 'src/utils/rarity-intensity';

import { useMemo } from 'react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';

import { makeRandom } from 'src/utils/seeded-random';

// ----------------------------------------------------------------------
// The payoff layer: a shockwave, light rays and a shower of shards, all scaled
// by how unlikely the pull was. Mounts behind the revealed card and plays once.
//
// Render inside a `position: relative` parent — everything here is absolute and
// pointer-events: none, so it never intercepts the reveal's buttons.
// ----------------------------------------------------------------------

type Shard = { angle: number; distance: number; size: number; delay: number; spin: number };

export type RevealBurstProps = {
  intensity: PullIntensity;
  /** The revealed card's rarity colour. */
  color: string;
  reduceMotion?: boolean;
};

export function RevealBurst({ intensity, color, reduceMotion = false }: RevealBurstProps) {
  // Seeded, not random: a re-render must not re-roll the burst mid-flight.
  const shards = useMemo<Shard[]>(() => {
    const rand = makeRandom(0x9e3779b9 + intensity.shardCount);
    return Array.from({ length: intensity.shardCount }, (_, i) => ({
      angle: (i / Math.max(1, intensity.shardCount)) * Math.PI * 2 + rand() * 0.4,
      distance: 120 + rand() * 180,
      size: 3 + rand() * 5,
      delay: rand() * 0.12,
      spin: (rand() - 0.5) * 540,
    }));
  }, [intensity.shardCount]);

  if (reduceMotion) {
    // Same "you got something good" signal, nothing in motion.
    return (
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: '-8%',
          zIndex: 0,
          pointerEvents: 'none',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}33 0%, transparent 65%)`,
        }}
      />
    );
  }

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
      }}
    >
      {/* Shockwave */}
      <m.div
        style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: '50%',
          border: `2px solid ${color}`,
        }}
        initial={{ scale: 0.2, opacity: 0.9 }}
        animate={{ scale: 3.2, opacity: 0 }}
        transition={{ duration: 0.85, ease: 'easeOut' }}
      />

      {/* Light rays */}
      {intensity.rays ? (
        <m.div
          style={{
            position: 'absolute',
            width: 620,
            height: 620,
            borderRadius: '50%',
            background: `conic-gradient(from 0deg, transparent 0deg, ${color}40 12deg, transparent 24deg, transparent 45deg, ${color}33 57deg, transparent 69deg, transparent 90deg, ${color}40 102deg, transparent 114deg, transparent 180deg, ${color}33 192deg, transparent 204deg, transparent 270deg, ${color}40 282deg, transparent 294deg)`,
            maskImage: 'radial-gradient(circle, black 20%, transparent 72%)',
            WebkitMaskImage: 'radial-gradient(circle, black 20%, transparent 72%)',
          }}
          initial={{ rotate: 0, scale: 0.5, opacity: 0 }}
          animate={{ rotate: 42, scale: 1.15, opacity: [0, 0.85, 0.35] }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
        />
      ) : null}

      {/* Shards */}
      {shards.map((shard, index) => (
        <m.div
          key={index}
          style={{
            position: 'absolute',
            width: shard.size,
            height: shard.size * 2.4,
            borderRadius: '1px',
            background: color,
            boxShadow: `0 0 10px ${color}`,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{
            x: Math.cos(shard.angle) * shard.distance,
            y: Math.sin(shard.angle) * shard.distance,
            opacity: 0,
            scale: 0.4,
            rotate: shard.spin,
          }}
          transition={{ duration: 1.1, delay: shard.delay, ease: 'easeOut' }}
        />
      ))}
    </Box>
  );
}

export default RevealBurst;
