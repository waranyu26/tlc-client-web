import type { PullRateRow } from './pull-rate-table';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { usePack } from 'src/api/pack.api';
import en from 'src/i18n/locales/en/pack.json';
import th from 'src/i18n/locales/th/pack.json';
import { useWalletBalance } from 'src/api/wallet.api';
import { registerNamespace } from 'src/i18n/register';

import { FadeUp, GhostButton, PrimaryButton } from 'src/components/vault';

import { PackHero } from './pack-hero';
import { PackPoolList } from './pack-pool-list';
import { PullRateTable } from './pull-rate-table';

registerNamespace('pack', en, th);

// ----------------------------------------------------------------------

export function PackView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('pack');

  const packQuery = usePack(id);
  const walletQuery = useWalletBalance();

  const pack = packQuery.data;

  /**
   * Odds come straight from this pack's remaining stock, and the buyback column
   * averages only the cards of that rarity still in THIS pack — no catalog-wide
   * averaging, so the numbers describe the box in front of you.
   */
  const pullRateRows = useMemo<PullRateRow[]>(() => {
    if (!pack) return [];

    return pack.rarity_odds.map((odds) => {
      const cardsOfRarity = pack.cards.filter(
        (card) => card.rarity === odds.rarity && card.remaining > 0
      );
      const avgBuyback = cardsOfRarity.length
        ? Math.round(
            cardsOfRarity.reduce((sum, card) => sum + card.buyback_price_satang, 0) /
              cardsOfRarity.length
          )
        : 0;

      return {
        code: odds.rarity,
        display_name: odds.rarity,
        probability_bps: odds.odds_bps,
        avg_buyback_satang: avgBuyback,
      };
    });
  }, [pack]);

  const soldOut = !!pack && pack.cards_remaining <= 0;
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
          {/* Desktop: pack art left, odds + pool alongside it. */}
          <Box
            sx={{
              display: 'grid',
              alignItems: 'start',
              gap: { xs: 2.5, md: 5 },
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
            }}
          >
            <Box sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
              <PackHero pack={pack} />

              <Box sx={{ mt: '16px' }}>
                <PrimaryButton fullWidth disabled={soldOut} onClick={handlePull}>
                  {soldOut
                    ? t('outOfStock', { defaultValue: 'Sold out' })
                    : t('pullCta', {
                        price: `฿${(pack.price_satang / 100).toLocaleString('en-US')}`,
                        defaultValue: 'Pull · {{price}}',
                      })}
                </PrimaryButton>

                {!canAfford && !soldOut && (
                  <Typography
                    sx={{ fontSize: '11px', color: '#9A9285', mt: '8px', textAlign: 'center' }}
                  >
                    {t('topUpHint', { defaultValue: 'Not enough balance — tap to top up.' })}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <PullRateTable rows={pullRateRows} />

              {pack.cards.length > 0 && <PackPoolList cards={pack.cards} />}
            </Box>
          </Box>
        </FadeUp>
      )}
    </Box>
  );
}

export default PackView;
