import type { PullResult } from 'src/api/types';

import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { formatThb } from 'src/utils/format-currency';

import { typeScale } from 'src/theme/type-scale';

import { PsaSlab, GhostButton, PrimaryButton, BuybackButton } from 'src/components/vault';

// ----------------------------------------------------------------------

export type CardRevealViewProps = {
  result: PullResult;
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
  buybackPreviewSatang,
  isSelling,
  onSellInstantly,
  onAddToVault,
  onPullAgain,
  canPullAgain,
  pullPriceSatang,
}: CardRevealViewProps) {
  const { t } = useTranslation('pull');

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
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <Typography sx={{ ...typeScale.cardTitle, color: '#F4ECDD', textAlign: 'center' }}>
            {result.card_name}
          </Typography>
          <Typography sx={{ fontSize: '11.5px', color: '#9A9285' }}>{result.set_name}</Typography>

          <Box sx={{ width: '62%', minWidth: 200, maxWidth: { xs: 260, md: 340 } }}>
            <PsaSlab
              imageUrl={result.image_url}
              rarity={result.rarity}
              cardName={result.card_name}
            />
          </Box>
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
