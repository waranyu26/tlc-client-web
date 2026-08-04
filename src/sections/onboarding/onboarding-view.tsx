import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { typeScale } from 'src/theme/type-scale';
import { signInWithGoogle } from 'src/api/auth.api';
import { subscribeTicker } from 'src/api/ticker.api';
import en from 'src/i18n/locales/en/onboarding.json';
import th from 'src/i18n/locales/th/onboarding.json';
import { registerNamespace } from 'src/i18n/register';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { FadeUp, TrustBadge, TickerStrip, GhostButton, PrimaryButton } from 'src/components/vault';

import { AuthShell } from 'src/sections/auth/auth-shell';

registerNamespace('onboarding', en, th);

// ----------------------------------------------------------------------

const MAX_TICKER_ITEMS = 8;

/** Mask a user id into a short, non-identifying label for the public ticker. */
function maskUser(userId: string): string {
  return `Collector ${userId.slice(0, 6)}`;
}

export function OnboardingView() {
  const { t } = useTranslation('onboarding');
  const router = useRouter();

  const [tickerItems, setTickerItems] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeTicker((event) => {
      if (event.type !== 'pull') return;

      const label = t('ticker.item', {
        user: maskUser(event.data.user_id),
        card: event.data.card_name,
        rarity: event.data.rarity,
      });

      setTickerItems((prev) => [label, ...prev].slice(0, MAX_TICKER_ITEMS));
    });

    return unsubscribe;
  }, [t]);

  const handleGoogle = useCallback(() => {
    signInWithGoogle();
  }, []);

  return (
    <AuthShell slotTop={<TickerStrip items={tickerItems} />}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 5, md: 4 } }}>
        {/* Desktop hides this — the split-screen brand panel carries the lockup. */}
        <FadeUp>
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Logo variant="horizontal" sx={{ width: 236, height: 40 }} />
            <Typography sx={{ ...typeScale.body, color: '#9A9285', textAlign: 'center', mt: 1 }}>
              {t('tagline', { ns: 'common' })}
            </Typography>
          </Box>
        </FadeUp>

        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Typography sx={{ ...typeScale.display, color: '#F4ECDD' }}>
            {t('cta.headline', { defaultValue: 'Start your collection' })}
          </Typography>
        </Box>

        <FadeUp delay={0.1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <PrimaryButton fullWidth size="large" onClick={() => router.push(paths.auth.signIn)}>
              {t('cta.email')}
            </PrimaryButton>
            <GhostButton
              fullWidth
              size="large"
              startIcon={<Iconify icon="socials:google" width={18} />}
              onClick={handleGoogle}
            >
              {t('cta.google')}
            </GhostButton>
          </Box>
        </FadeUp>

        {/* Desktop shows these in the brand panel instead. */}
        <FadeUp delay={0.2}>
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <TrustBadge />
            <Typography sx={{ ...typeScale.label, color: '#4A4844', textAlign: 'center' }}>
              {t('trust.footer', { ns: 'common' })}
            </Typography>
          </Box>
        </FadeUp>
      </Box>
    </AuthShell>
  );
}

export default OnboardingView;
