import type { IconButtonProps } from '@mui/material/IconButton';

import { useTranslation } from 'react-i18next';

import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import { useMusicPrefsStore } from 'src/store/music-prefs-store';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Mute/unmute for the background music.
//
// No track is wired up yet, so this currently only flips a stored preference.
// It ships now rather than with the audio because the control is the part that
// has to be found and trusted: a music button that appears at the same time as
// the music reads as something the site just started doing to you.
// ----------------------------------------------------------------------

export type MusicToggleProps = Omit<IconButtonProps, 'onClick'>;

export function MusicToggle({ sx, ...other }: MusicToggleProps) {
  const { t } = useTranslation();
  const musicEnabled = useMusicPrefsStore((state) => state.musicEnabled);
  const toggleMusic = useMusicPrefsStore((state) => state.toggleMusic);

  const label = musicEnabled
    ? t('nav.music.mute', { defaultValue: 'Mute music' })
    : t('nav.music.unmute', { defaultValue: 'Unmute music' });

  return (
    <Tooltip title={label}>
      <IconButton
        onClick={toggleMusic}
        aria-label={label}
        // The pressed state is what a screen reader reads out; the icon swap
        // alone says nothing to anyone not looking at it.
        aria-pressed={!musicEnabled}
        sx={[{ color: musicEnabled ? '#E7CE92' : '#5A5550' }, ...(Array.isArray(sx) ? sx : [sx])]}
        {...other}
      >
        <Iconify
          icon={musicEnabled ? 'solar:music-note-2-linear' : 'solar:muted-linear'}
          width={20}
        />
      </IconButton>
    </Tooltip>
  );
}

export default MusicToggle;
