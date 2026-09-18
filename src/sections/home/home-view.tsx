import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { usePacks } from 'src/api/pack.api';
import en from 'src/i18n/locales/en/home.json';
import th from 'src/i18n/locales/th/home.json';
import { typeScale } from 'src/theme/type-scale';
import { registerNamespace } from 'src/i18n/register';
import { useWalletBalance } from 'src/api/wallet.api';
import {
  gridGap,
  sectionGap,
  RIGHT_RAIL_WIDTH,
  CONTENT_STICKY_TOP,
} from 'src/layouts/vault/layout-config';

import {
  FadeUp,
  TrustBadge,
  GhostButton,
  PrimaryButton,
  SectionHeading,
} from 'src/components/vault';

import { useAuthContext } from 'src/auth/hooks';

import { WalletHero } from './wallet-hero';
import { HowItWorks } from './how-it-works';
import { CollectionPreview } from './collection-preview';
import { PackShelfCard, PackShelfCardSkeleton } from './pack-shelf-card';

registerNamespace('home', en, th);

// ----------------------------------------------------------------------
// Desktop: packs fill the main column while the wallet balance, the primary
// Pull CTA and the trust badge sit in a sticky right rail, so the money and the
// action stay in view. Below `lg` the rail folds back above the packs.
//
// The shop runs one to three packs, not a catalogue, so there is no featured/
// rest split and no tile grid: every pack gets an equal full-width row. That
// holds its shape at one pack as well as at six, which a 4-column grid did not.
// ----------------------------------------------------------------------

/** Enough to hold the column's shape while the list resolves. */
const SKELETON_ROWS = 2;

export function HomeView() {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const pathname = usePathname();

  const { authenticated, loading: sessionLoading } = useAuthContext();
  const balanceQuery = useWalletBalance();
  const packsQuery = usePacks({ pageSize: 20 });

  const packs = packsQuery.data?.data ?? [];
  const firstPack = packs[0];

  // The rail's top card is the one thing on this page that depends on having an
  // account. A guest gets the invitation in its place rather than a wallet
  // reading ฿0.00, which would look like a balance they had spent.
  const returnTo = `?${new URLSearchParams({ returnTo: pathname }).toString()}`;

  const guestCard = (
    <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Typography sx={{ ...typeScale.cardTitle, color: '#F4ECDD' }}>
        {t('guest.headline', { defaultValue: 'Start your collection' })}
      </Typography>
      <Typography sx={{ ...typeScale.body, color: '#9A9285', mb: 0.75 }}>
        {t('guest.body', {
          defaultValue:
            'Browse every pack, its published odds and the cards behind them. You only need an account to pull.',
        })}
      </Typography>
      <PrimaryButton fullWidth component={RouterLink} href={`${paths.auth.signUp}${returnTo}`}>
        {t('guest.signUp', { defaultValue: 'Create an account' })}
      </PrimaryButton>
      <GhostButton fullWidth component={RouterLink} href={`${paths.auth.signIn}${returnTo}`}>
        {t('guest.signIn', { defaultValue: 'I already have one' })}
      </GhostButton>
    </Box>
  );

  const walletCard = (
    <>
      <WalletHero
        balanceSatang={balanceQuery.data?.balance_satang}
        isLoading={balanceQuery.isPending}
      />
      {/* At `lg` the sidebar already carries this CTA — don't say it twice. */}
      <Box sx={{ display: { xs: 'block', lg: 'none' }, px: 2.5, pb: 2.5 }}>
        {/* Sends the customer into the first pack. It used to navigate to
            `paths.home` — the page it is already on, so it did nothing. */}
        <PrimaryButton
          fullWidth
          disabled={!firstPack}
          onClick={() => firstPack && navigate(paths.pack(firstPack.id))}
        >
          {t('pullCta', { defaultValue: 'Pull a card' })}
        </PrimaryButton>
      </Box>
    </>
  );

  const rail = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        position: { md: 'sticky' },
        top: { md: CONTENT_STICKY_TOP },
      }}
    >
      {/* Held back until the session is known: showing the invitation and then
          swapping it for a balance tells a returning customer they are signed
          out on the first screen they see. */}
      {!sessionLoading && (
        <Box
          sx={{
            borderRadius: '15px',
            border: '1px solid rgba(231,206,146,0.16)',
            backgroundColor: '#17161B',
            overflow: 'hidden',
          }}
        >
          {authenticated ? walletCard : guestCard}
        </Box>
      )}

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

      <Box
        sx={{
          minWidth: 0,
          gridRow: { md: 1 },
          gridColumn: { md: 1 },
          display: 'flex',
          flexDirection: 'column',
          gap: sectionGap,
        }}
      >
        <Box>
          <SectionHeading sx={{ mb: 1.5 }}>
            {t('packsHeading', { defaultValue: 'Available packs' })}
          </SectionHeading>

          {packsQuery.isError && (
            <Alert severity="error">
              {t('state.error', { defaultValue: "Couldn't load packs." })}
            </Alert>
          )}

          {packsQuery.isPending && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: gridGap }}>
              {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <PackShelfCardSkeleton key={index} />
              ))}
            </Box>
          )}

          {!packsQuery.isPending && !packsQuery.isError && packs.length === 0 && (
            <Typography sx={{ ...typeScale.body, color: '#9A9285' }}>
              {t('state.empty', { defaultValue: 'No packs available right now.' })}
            </Typography>
          )}

          {packs.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: gridGap }}>
              {packs.map((pack, index) => (
                <FadeUp key={pack.id} delay={Math.min(index * 0.05, 0.3)}>
                  <PackShelfCard pack={pack} onOpen={() => navigate(paths.pack(pack.id))} />
                </FadeUp>
              ))}
            </Box>
          )}
        </Box>

        {/* Renders nothing until the customer owns something. */}
        <CollectionPreview />

        <HowItWorks />
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
