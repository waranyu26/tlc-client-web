import type { BuybackResult } from 'src/api/types';

import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { ThbAmount, GhostButton, PrimaryButton } from 'src/components/vault';

// ----------------------------------------------------------------------
// Instant Buyback success screen: pop-in credit amount + new wallet balance,
// per DESIGN.md "pop-in" animation (scale .7->1.04->1, 0.7s).
// ----------------------------------------------------------------------

export type BuybackSuccessViewProps = {
  buyback: BuybackResult;
  cardName?: string;
  onPullAgain: () => void;
  canPullAgain: boolean;
  onDone: () => void;
};

export function BuybackSuccessView({
  buyback,
  cardName,
  onPullAgain,
  canPullAgain,
  onDone,
}: BuybackSuccessViewProps) {
  const { t } = useTranslation('pull');

  return (
    <Box
      sx={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        padding: '32px 20px',
      }}
    >
      <m.div
        initial={{ opacity: 0, scale: 0.7, y: 18 }}
        animate={{ opacity: 1, scale: [0.7, 1.04, 1], y: [18, 0, 0] }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(111,191,142,0.10)',
            border: '1px solid rgba(111,191,142,0.35)',
          }}
        >
          <Iconify icon="solar:check-circle-bold" width={34} sx={{ color: '#6FBF8E' }} />
        </Box>
      </m.div>

      <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Typography
          sx={{
            fontFamily: `'Cormorant Garamond', serif`,
            fontSize: '25px',
            fontWeight: 600,
            color: '#F4ECDD',
          }}
        >
          {t('buyback.title')}
        </Typography>
        {cardName ? (
          <Typography sx={{ fontSize: '12px', color: '#9A9285' }}>{cardName}</Typography>
        ) : null}
      </Box>

      <m.div
        initial={{ opacity: 0, scale: 0.7, y: 18 }}
        animate={{ opacity: 1, scale: [0.7, 1.04, 1], y: [18, 0, 0] }}
        transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
      >
        <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <Typography
            sx={{
              fontSize: '9.5px',
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#9A9285',
            }}
          >
            {t('buyback.creditedLabel')}
          </Typography>
          <ThbAmount
            satang={buyback.amount_satang}
            signed
            tone="success"
            sx={{ fontSize: '32px', fontWeight: 700 }}
          />
        </Box>
      </m.div>

      <Box
        sx={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          padding: '14px 22px',
          borderRadius: '13px',
          border: '1px solid rgba(231,206,146,0.16)',
          bgcolor: '#17161B',
        }}
      >
        <Typography
          sx={{
            fontSize: '9.5px',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#9A9285',
          }}
        >
          {t('buyback.newBalance')}
        </Typography>
        <ThbAmount satang={buyback.balance_satang} hero />
      </Box>

      <Box
        sx={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        {/* Never disabled: when balance is insufficient, onPullAgain (owned by the
            page) redirects to the wallet top-up flow instead of blocking the tap. */}
        <PrimaryButton fullWidth onClick={onPullAgain}>
          {canPullAgain ? t('buyback.pullAgain') : t('topUp.cta')}
        </PrimaryButton>
        {!canPullAgain ? (
          <Typography sx={{ fontSize: '11px', color: '#9A9285', textAlign: 'center' }}>
            {t('topUp.message')}
          </Typography>
        ) : null}
        <GhostButton fullWidth onClick={onDone}>
          {t('buyback.done')}
        </GhostButton>
      </Box>
    </Box>
  );
}

export default BuybackSuccessView;
