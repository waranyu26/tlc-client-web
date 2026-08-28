import type { ReactNode } from 'react';
import type { PackRarityOdds } from 'src/api/types';
import type { IconifyName } from 'src/components/iconify';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import { formatThb } from 'src/utils/format-currency';

import { unlockSfx, toggleBlip } from 'src/lib/pull-sfx';
import { usePullPrefsStore } from 'src/store/pull-prefs-store';

import { Iconify } from 'src/components/iconify';
import { FadeUp, TrustBadge, PrimaryButton, SectionHeading } from 'src/components/vault';

import { PackRarityTiles } from 'src/sections/pack/pack-rarity-tiles';

import { ClientSeedField } from './client-seed-field';

// ----------------------------------------------------------------------
// Note: FadeUp only forwards framer-motion `HTMLMotionProps<'div'>` (it does not
// understand MUI's `sx` prop), so every FadeUp below wraps a plain <Box sx={...}>
// rather than taking `sx` directly.
// ----------------------------------------------------------------------

type PrefToggleProps = {
  active: boolean;
  icon: IconifyName;
  label: ReactNode;
  onClick: () => void;
};

function PrefToggle({ active, icon, label, onClick }: PrefToggleProps) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-pressed={active}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '999px',
        padding: '6px 12px',
        fontSize: '11.5px',
        fontWeight: 600,
        letterSpacing: '0.02em',
        border: `1px solid ${active ? 'rgba(231,206,146,0.42)' : 'rgba(231,206,146,0.14)'}`,
        bgcolor: active ? 'rgba(231,206,146,0.10)' : 'transparent',
        color: active ? '#E7CE92' : '#9A9285',
        transition: 'all 180ms ease',
        '&.Mui-focusVisible': { outline: '2px solid #E7CE92', outlineOffset: '2px' },
      }}
    >
      <Iconify icon={icon} width={15} />
      {label}
    </ButtonBase>
  );
}

export type PullIdleViewProps = {
  /** This pack's published odds — the rates that actually apply here. */
  rarityOdds?: PackRarityOdds[];
  priceSatang?: number;
  canAfford: boolean;
  disabled?: boolean;
  /** The player's own entropy, mixed into the commitment before it is sealed. */
  clientSeed?: string;
  onClientSeedChange?: (seed: string) => void;
  onPull: () => void;
};

export function PullIdleView({
  rarityOdds,
  priceSatang,
  canAfford,
  disabled,
  clientSeed,
  onClientSeedChange,
  onPull,
}: PullIdleViewProps) {
  const { t } = useTranslation('pull');

  const soundEnabled = usePullPrefsStore((state) => state.soundEnabled);
  const skipPick = usePullPrefsStore((state) => state.skipPick);
  const toggleSound = usePullPrefsStore((state) => state.toggleSound);
  const toggleSkipPick = usePullPrefsStore((state) => state.toggleSkipPick);

  const handleToggleSound = () => {
    const turningOn = !soundEnabled;
    toggleSound();
    if (turningOn) {
      // Must happen inside the click: an AudioContext created outside a user
      // gesture starts suspended and everything stays silent.
      unlockSfx();
      setTimeout(toggleBlip, 140);
    }
  };

  return (
    <Box sx={{ padding: '20px 16px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <FadeUp>
        <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              margin: '0 auto',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #E7CE92, #8A6D2F)',
              boxShadow: '0 8px 26px rgba(231,206,146,0.25)',
            }}
          >
            <Iconify icon="solar:cup-star-bold" width={30} sx={{ color: '#0B0B0D' }} />
          </Box>

          <Typography
            sx={{
              fontFamily: `'Cormorant Garamond', serif`,
              fontSize: '27px',
              fontWeight: 600,
              color: '#F4ECDD',
            }}
          >
            {t('title')}
          </Typography>
          <Typography sx={{ fontSize: '13px', color: '#9A9285' }}>{t('subtitle')}</Typography>
        </Box>
      </FadeUp>

      <FadeUp delay={0.08}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <PrimaryButton
            fullWidth
            disabled={disabled || !canAfford}
            onClick={onPull}
            sx={{ fontSize: '16px', padding: '15px 20px' }}
          >
            {priceSatang !== undefined
              ? t('pullCta', { price: formatThb(priceSatang) })
              : t('pullCta', { price: '…' })}
          </PrimaryButton>

          {!canAfford && priceSatang !== undefined ? (
            <Typography sx={{ fontSize: '11.5px', color: '#C9605B', textAlign: 'center' }}>
              {t('insufficientBalance')}
            </Typography>
          ) : null}

          <Typography sx={{ fontSize: '11.5px', color: '#9A9285', textAlign: 'center' }}>
            {t('choose.honesty')}
          </Typography>
        </Box>
      </FadeUp>

      <FadeUp delay={0.12}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <PrefToggle
            active={soundEnabled}
            icon={soundEnabled ? 'solar:volume-loud-bold' : 'solar:volume-bold'}
            label={t(soundEnabled ? 'prefs.soundOn' : 'prefs.soundOff')}
            onClick={handleToggleSound}
          />
          <PrefToggle
            active={skipPick}
            icon="solar:double-alt-arrow-right-bold-duotone"
            label={t('prefs.skipPick')}
            onClick={toggleSkipPick}
          />
        </Box>
      </FadeUp>

      {clientSeed !== undefined && onClientSeedChange && (
        <FadeUp delay={0.16}>
          <ClientSeedField value={clientSeed} onChange={onClientSeedChange} disabled={disabled} />
        </FadeUp>
      )}

      {rarityOdds && rarityOdds.length > 0 && (
        <FadeUp delay={0.18}>
          {/* The tiles are bare numbers now that the pack page owns the
              heading, so label them here rather than leave a row of
              percentages floating above the trust badge. */}
          <SectionHeading sx={{ fontSize: '20px', mb: '12px', textAlign: 'center' }}>
            {t('odds.title', { ns: 'pack', defaultValue: 'Pull rates' })}
          </SectionHeading>
          <PackRarityTiles rarityOdds={rarityOdds} />
        </FadeUp>
      )}

      <FadeUp delay={0.24}>
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '0 8px' }}>
          <TrustBadge />
        </Box>
      </FadeUp>
    </Box>
  );
}

export default PullIdleView;
