import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { usePacks } from 'src/api/pack.api';
import en from 'src/i18n/locales/en/home.json';
import th from 'src/i18n/locales/th/home.json';
import { typeScale } from 'src/theme/type-scale';
import { registerNamespace } from 'src/i18n/register';
import { useWalletBalance } from 'src/api/wallet.api';
import { sectionGap, RIGHT_RAIL_WIDTH } from 'src/layouts/vault/layout-config';

import { FadeUp, TrustBadge, PrimaryButton, SectionHeading } from 'src/components/vault';

import { PackGrid } from './pack-grid';
import { PackCard } from './pack-card';
import { WalletHero } from './wallet-hero';

registerNamespace('home', en, th);

// ----------------------------------------------------------------------
// Desktop: packs fill the main column while the wallet balance, the primary
// Pull CTA and the trust badge sit in a sticky right rail, so the money and the
// action stay in view. Below `lg` the rail folds back above the packs.
// ----------------------------------------------------------------------

export function HomeView() {
  const { t } = useTranslation('home');
  const navigate = useNavigate();

  const balanceQuery = useWalletBalance();
  const packsQuery = usePacks({ pageSize: 20 });

  const packs = packsQuery.data?.data ?? [];
  const [featuredPack, ...restPacks] = packs;

  const rail = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        position: { md: 'sticky' },
        top: { md: 88 },
      }}
    >
      <Box
        sx={{
          borderRadius: '15px',
          border: '1px solid rgba(231,206,146,0.16)',
          backgroundColor: '#17161B',
          overflow: 'hidden',
        }}
      >
        <WalletHero
          balanceSatang={balanceQuery.data?.balance_satang}
          isLoading={balanceQuery.isPending}
        />
        {/* At `lg` the sidebar already carries this CTA — don't say it twice. */}
        <Box sx={{ display: { xs: 'block', lg: 'none' }, px: 2.5, pb: 2.5 }}>
          <PrimaryButton fullWidth onClick={() => navigate(paths.home)}>
            {t('pullCta', { defaultValue: 'Browse packs' })}
          </PrimaryButton>
        </Box>
      </Box>

      <TrustBadge />
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'grid',
        alignItems: 'start',
        columnGap: sectionGap,
        gridTemplateColumns: { xs: '1fr', md: `minmax(0, 1fr) ${RIGHT_RAIL_WIDTH}px` },
      }}
    >
      {/* Below `md` the rail leads, so the balance stays above the fold on phones */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: sectionGap }}>{rail}</Box>

      <Box sx={{ minWidth: 0, gridRow: { md: 1 }, gridColumn: { md: 1 } }}>
        {packsQuery.isPending && (
          <Typography sx={{ ...typeScale.body, color: '#9A9285' }}>
            {t('state.loading', { defaultValue: 'Loading packs…' })}
          </Typography>
        )}

        {packsQuery.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {t('state.error', { defaultValue: "Couldn't load packs." })}
          </Alert>
        )}

        {!packsQuery.isPending && !packsQuery.isError && packs.length === 0 && (
          <Typography sx={{ ...typeScale.body, color: '#9A9285' }}>
            {t('state.empty', { defaultValue: 'No packs available right now.' })}
          </Typography>
        )}

        {featuredPack && (
          <FadeUp>
            <SectionHeading sx={{ mb: 1.5 }}>
              {t('featured', { defaultValue: 'Featured pack' })}
            </SectionHeading>
            <PackCard
              featured
              pack={featuredPack}
              onClick={() => navigate(paths.pack(featuredPack.id))}
              sx={{ mb: sectionGap }}
            />
          </FadeUp>
        )}

        {restPacks.length > 0 && (
          <FadeUp delay={0.1}>
            <SectionHeading sx={{ mb: 1.5 }}>
              {t('morePacks', { defaultValue: 'All packs' })}
            </SectionHeading>
            <PackGrid packs={restPacks} />
          </FadeUp>
        )}
      </Box>

      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          gridRow: 1,
          gridColumn: 2,
          width: RIGHT_RAIL_WIDTH,
        }}
      >
        {rail}
      </Box>
    </Box>
  );
}

export default HomeView;
