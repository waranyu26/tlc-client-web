import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import en from 'src/i18n/locales/en/pack.json';
import th from 'src/i18n/locales/th/pack.json';
import { useWalletBalance } from 'src/api/wallet.api';
import { registerNamespace } from 'src/i18n/register';
import { usePack, usePackRarityCards } from 'src/api/pack.api';
import { CONTENT_MAX_WIDTH } from 'src/layouts/vault/layout-config';

import { FadeUp, GhostButton } from 'src/components/vault';

import { PackShowcase } from './pack-showcase';
import { PackBuyPanel } from './pack-buy-panel';
import { PackRarityBrowser } from './pack-rarity-browser';
import { PackFairnessPanel } from './pack-fairness-panel';
import { PackLifecycleStrip } from './pack-lifecycle-strip';

registerNamespace('pack', en, th);

// ----------------------------------------------------------------------

/** Every band on the page shares this cap, which is what makes them line up. */
const pageWidth = { width: '100%', maxWidth: CONTENT_MAX_WIDTH, mx: 'auto' } as const;

export function PackView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('pack');

  const packQuery = usePack(id);
  const walletQuery = useWalletBalance();

  const pack = packQuery.data;
  const rarityOdds = useMemo(() => pack?.rarity_odds ?? [], [pack]);

  // Rarest tier = longest odds. Ranking by odds rather than the `rank` column
  // keeps this correct for a pack whose tiers were entered in any order. It is
  // both what the showcase fans out and what the manifest opens on, because it
  // is the reason to open this box rather than another.
  const chaseTier = useMemo(
    () =>
      rarityOdds.length
        ? rarityOdds.reduce((rarest, tier) => (tier.odds_bps < rarest.odds_bps ? tier : rarest))
        : undefined,
    [rarityOdds]
  );

  // Null until the customer picks, so the default tracks the pack once it loads
  // rather than being frozen at whatever was known on first render.
  const [pickedRarity, setPickedRarity] = useState<string | null>(null);
  const selectedRarity = pickedRarity ?? chaseTier?.rarity_code;

  // The showcase always fans the chase tier, even while the browser is showing
  // another one — it is the box's advertisement, not a reflection of the grid.
  const chaseQuery = usePackRarityCards(pack?.id, chaseTier?.rarity_code);

  const soldOut = !!pack && pack.sold_out;
  const balanceSatang = walletQuery.data?.balance_satang;
  const canAfford = !pack || balanceSatang === undefined || balanceSatang >= pack.price_satang;

  const handlePull = () => {
    if (!pack) return;
    // Never block the tap — send them to top up instead of disabling the CTA.
    navigate(canAfford ? paths.pull(pack.id) : paths.wallet);
  };

  return (
    <Box>
      {packQuery.isPending && (
        <Typography sx={{ fontSize: '13px', color: '#9A9285' }}>
          {t('state.loading', { defaultValue: 'Loading pack…' })}
        </Typography>
      )}

      {packQuery.isError && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Alert severity="error">
            {t('state.error', { defaultValue: "Couldn't load this pack." })}
          </Alert>
          <GhostButton onClick={() => navigate(paths.home)}>
            {t('reveal.backHome', { defaultValue: 'Back to home' })}
          </GhostButton>
        </Box>
      )}

      {pack && (
        <FadeUp>
          <Box
            sx={{ ...pageWidth, display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 5 } }}
          >
            {/* Band 1 — the decision. Art at the size it deserves beside a buy
                column at a fixed width, so the panel stays a product card
                instead of stretching into a banner on a wide pane. */}
            <Box
              sx={{
                display: 'grid',
                alignItems: 'stretch',
                gap: { xs: 2.5, md: 3 },
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  md: 'minmax(0, 1fr) minmax(340px, 400px)',
                },
              }}
            >
              <PackShowcase
                pack={pack}
                cards={chaseQuery.data?.cards ?? []}
                tierName={chaseTier?.display_name || chaseTier?.rarity_code}
                accent={chaseTier?.color_hex || '#E7CE92'}
              />

              <PackBuyPanel pack={pack} canAfford={canAfford && !soldOut} onPull={handlePull} />
            </Box>

            {/* Band 2 — why the odds can be trusted, and what the slab becomes
                once it is yours. Two panels on one row, tops aligned. */}
            <Box
              sx={{
                display: 'grid',
                alignItems: 'stretch',
                gap: { xs: 2.5, md: 3 },
                // minmax(0, …) on every track, and the panels set minWidth: 0
                // themselves. A grid item defaults to min-width: auto, so one
                // unbreakable string (a 96-char signature) would otherwise set
                // the track's floor and push the page wider than the screen.
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
              }}
            >
              <PackFairnessPanel />
              <PackLifecycleStrip />
            </Box>

            {/* Band 3 — the odds, and the cards behind whichever one is picked. */}
            {selectedRarity && (
              <PackRarityBrowser
                packId={pack.id}
                rarityOdds={rarityOdds}
                selectedRarity={selectedRarity}
                onSelectRarity={setPickedRarity}
              />
            )}
          </Box>
        </FadeUp>
      )}
    </Box>
  );
}

export default PackView;
