// ----------------------------------------------------------------------
// Feed helpers: user_id is an opaque id (no display name is exposed by the
// ticker payload), so avatars are derived deterministically from it.
// ----------------------------------------------------------------------

const AVATAR_COLORS = ['#E7CE92', '#C77DFF', '#18E0D0', '#7C8CFF', '#6FBF8E', '#C9605B'];

/** Deterministic 2-letter avatar initials derived from an opaque user id. */
export function getInitials(userId: string): string {
  const clean = userId.replace(/[^a-zA-Z0-9]/g, '');
  return clean ? clean.slice(0, 2).toUpperCase() : '??';
}

/** Deterministic avatar background color so the same user always renders the same. */
export function getAvatarColor(userId: string): string {
  let hash = 0;
  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) % 4294967296;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// ----------------------------------------------------------------------

export type RelativeTimeParts = { unit: 'now' } | { unit: 'm' | 'h' | 'd'; count: number };

/** Compact relative time breakdown ("just now" / Xm / Xh / Xd) for a client-received timestamp. */
export function getRelativeTimeParts(fromMs: number, nowMs: number): RelativeTimeParts {
  const diffSeconds = Math.max(0, Math.floor((nowMs - fromMs) / 1000));

  if (diffSeconds < 60) return { unit: 'now' };

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return { unit: 'm', count: diffMinutes };

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return { unit: 'h', count: diffHours };

  return { unit: 'd', count: Math.floor(diffHours / 24) };
}
