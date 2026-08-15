import type { PullResult } from 'src/api/types';
import type { PullIntensity } from 'src/utils/rarity-intensity';

import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { formatThb } from 'src/utils/format-currency';

import { typeScale } from 'src/theme/type-scale';

import {
  PsaSlab,
  GhostButton,
  RarityBadge,
  PrimaryButton,
  BuybackButton,
  getRarityColor,
} from 'src/components/vault';

import { RevealBurst } from './reveal-burst';

// ----------------------------------------------------------------------

/** How hard the slab lands, by tier. A legendary should arrive; a common should just appear. */
const ENTRANCE = {
  standard: { scale: 0.92, stiffness: 240, damping: 24 },
  rare: { scale: 0.86, stiffness: 220, damping: 20 },
  epic: { scale: 0.74, stiffness: 200, damping: 16 },
  legendary: { scale: 0.6, stiffness: 190, damping: 14 },
} as const;

export type CardRevealViewProps = {
  result: PullResult;
  intensity: PullIntensity;
  reduceMotion?: boolean;
  buybackPreviewSatang?: number;
  isSelling: boolean;
  onSellInstantly: () => void;
  onAddToVault: () => void;
  onPullAgain: () => void;
  canPullAgain: boolean;
  pullPriceSatang?: number;
};

export function CardRevealView({
  result,
  intensity,
  reduceMotion = false,
  buybackPreviewSatang,
  isSelling,
  onSellInstantly,
  onAddToVault,
  onPullAgain,
  canPullAgain,
  pullPriceSatang,
}: CardRevealViewProps) {
  const { t } = useTranslation('pull');
  const entrance = ENTRANCE[intensity.tier];
  const rarityColor = getRarityColor(result.rarity);

  return (
    <Box
      sx={{
        py: { xs: 3, md: 5 },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: '18px', md: 3 },
        // The reveal is the payoff moment — keep it centred and generous.
        width: '100%',
        maxWidth: { md: 560 },
        mx: 'auto',
      }}
    >
      <m.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: entrance.scale }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          reduceMotion
            ? { duration: 0.25 }
            : { type: 'spring', stiffness: entrance.stiffness, damping: entrance.damping }
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <Typography sx={{ ...typeScale.cardTitle, color: '#F4ECDD', textAlign: 'center' }}>
            {result.card_name}
          </Typography>
          <Typography sx={{ fontSize: '11.5px', color: '#9A9285' }}>{result.set_name}</Typography>

          <Box
            sx={{
              position: 'relative',
              // Sized to land near where the peel left off — dropping from a
              // hero-sized card to a thumbnail would read as a demotion right at
              // the payoff. Height-bounded so the CTAs stay above the fold.
              width: '88%',
              minWidth: 200,
              maxWidth: 'min(84vw, 36vh, 360px)',
            }}
          >
            {/* Sits behind the slab and plays once — see RevealBurst for the layering. */}
            <RevealBurst intensity={intensity} color={rarityColor} reduceMotion={reduceMotion} />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <PsaSlab
                thumbUrl={result.thumb_url}
                imageUrl={result.image_url}
                rarity={result.rarity}
                cardName={result.card_name}
              />
            </Box>
          </Box>

          <m.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, delay: reduceMotion ? 0.05 : 0.24, ease: 'easeOut' }}
          >
            <RarityBadge rarity={result.rarity} />
          </m.div>
        </Box>
      </m.div>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <BuybackButton fullWidth disabled={isSelling} onClick={onSellInstantly}>
          {buybackPreviewSatang !== undefined
            ? t('reveal.sellFor', { amount: formatThb(buybackPreviewSatang) })
            : t('reveal.sellInstantly')}
        </BuybackButton>

        <GhostButton fullWidth onClick={onAddToVault}>
          {t('reveal.addToVault')}
        </GhostButton>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Never disabled: when balance is insufficient, onPullAgain (owned by the
              page) redirects to the wallet top-up flow instead of blocking the tap. */}
          <PrimaryButton fullWidth onClick={onPullAgain}>
            {canPullAgain
              ? `${t('reveal.pullAgain')}${
                  pullPriceSatang !== undefined ? ` · ${formatThb(pullPriceSatang)}` : ''
                }`
              : t('topUp.cta')}
          </PrimaryButton>
          {!canPullAgain ? (
            <Typography sx={{ fontSize: '11px', color: '#9A9285', textAlign: 'center' }}>
              {t('topUp.message')}
            </Typography>
          ) : null}
        </Box>

        <Box
          component={RouterLink}
          href={paths.vault}
          sx={{
            textAlign: 'center',
            fontSize: '11.5px',
            color: '#9A9285',
            textDecoration: 'none',
            padding: '4px',
            '&:hover': { color: '#E7CE92' },
          }}
        >
          {t('reveal.viewVault')}
        </Box>
      </Box>
    </Box>
  );
}

export default CardRevealView;
