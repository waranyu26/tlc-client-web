import type { StoreCard } from 'src/api/types';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { formatThb } from 'src/utils/format-currency';

import { ApiError } from 'src/lib/axios';
import { useWalletBalance } from 'src/api/wallet.api';
import { useBuyCard, STORE_ERROR, useStoreCard } from 'src/api/store.api';

import { Iconify } from 'src/components/iconify';
import { ThbAmount, CardFrame, GhostButton, PrimaryButton } from 'src/components/vault';

import { dialogPaperProps } from 'src/sections/account/dialog-style';

import { useAuthContext } from 'src/auth/hooks';

import { STORE_FRAME_TONE } from './store-card-item';

// ----------------------------------------------------------------------

const NOTICE_COLOR = '#C9605B';

/** Which `buy.errors.*` message a failed purchase maps to. */
function errorKey(error: unknown): string {
  switch (error instanceof ApiError ? error.code : undefined) {
    case STORE_ERROR.insufficientBalance:
      return 'insufficient';
    case STORE_ERROR.priceChanged:
      return 'priceChanged';
    case STORE_ERROR.soldOut:
      return 'soldOut';
    case STORE_ERROR.notFound:
      return 'notFound';
    case STORE_ERROR.emailNotVerified:
      return 'emailNotVerified';
    default:
      return 'generic';
  }
}

// ----------------------------------------------------------------------

type BodyProps = {
  card: StoreCard;
  onClose: () => void;
};

/**
 * Mounted only while the dialog is open, so its state — above all the
 * idempotency key — starts fresh for every card and every opening.
 */
function StoreBuyDialogBody({ card, onClose }: BodyProps) {
  const { t } = useTranslation('store');
  const pathname = usePathname();
  const { authenticated } = useAuthContext();
  const balanceQuery = useWalletBalance();
  const buy = useBuyCard();

  // The card as the store lists it right now. Seeded from the grid tile and
  // re-read on open, so the price shown — and sent — is the current one.
  const { data: current, error: detailError } = useStoreCard(card);

  // One key per buy *attempt*. A retry of the same attempt (a dropped
  // connection) reuses it, so the service replays the purchase instead of
  // charging twice.
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  const purchase = buy.data;
  const balance = balanceQuery.data?.balance_satang;
  const short = balance !== undefined && balance < current.price_satang;

  // The re-read can discover the card went while the dialog was open. Only
  // that counts — a flaky connection on the re-read is not a failed purchase.
  const detailKey = detailError ? errorKey(detailError) : null;
  const delisted = detailKey === 'soldOut' || detailKey === 'notFound';
  const failureKey = buy.error ? errorKey(buy.error) : delisted ? detailKey : null;
  const gone = failureKey === 'soldOut' || failureKey === 'notFound';
  const needsTopUp = short || failureKey === 'insufficient';

  const handleBuy = () => {
    buy.mutate(
      { card: current, idempotencyKey },
      {
        onError: (error) => {
          // A definite refusal means nothing was charged and the attempt is
          // over, so the next click is a new attempt. No status (a network
          // drop) or a 5xx leaves the outcome unknown — that one must replay.
          if (error instanceof ApiError && error.status && error.status < 500) {
            setIdempotencyKey(crypto.randomUUID());
          }
        },
      }
    );
  };

  if (purchase) {
    return (
      <Box sx={{ p: { xs: 2.5, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ width: 140, mx: 'auto' }}>
          <CardFrame
            priority
            glow
            thumbUrl={purchase.card.thumb_url}
            imageUrl={purchase.card.image_url}
            rarity={STORE_FRAME_TONE}
            alt={purchase.card.name}
          />
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography
            sx={{
              fontFamily: `'Cormorant Garamond', serif`,
              fontSize: '24px',
              fontWeight: 600,
              color: '#F4ECDD',
            }}
          >
            {t('buy.success.title')}
          </Typography>
          <Typography sx={{ mt: '4px', fontSize: '13px', color: '#9A9285' }}>
            {t('buy.success.body', { name: purchase.card.name })}
          </Typography>
          <Typography sx={{ mt: '10px', fontSize: '12px', color: '#6F6A60' }}>
            {t('buy.success.balanceAfter')}{' '}
            <ThbAmount
              satang={purchase.balance_satang}
              sx={{ fontSize: '12px', fontWeight: 700, color: '#E7CE92' }}
            />
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <PrimaryButton fullWidth component={RouterLink} href={paths.vault}>
            {t('buy.success.viewVault')}
          </PrimaryButton>
          <GhostButton fullWidth onClick={onClose} sx={{ border: 'none' }}>
            {t('buy.success.keepBrowsing')}
          </GhostButton>
        </Box>
      </Box>
    );
  }

  const priceLabel = formatThb(current.price_satang);

  return (
    <Box sx={{ p: { xs: 2.5, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <IconButton
        onClick={onClose}
        size="small"
        aria-label={t('buy.close')}
        sx={{ position: 'absolute', top: 10, right: 10, color: '#9A9285' }}
      >
        <Iconify icon="carbon:close" width={18} />
      </IconButton>

      <Box sx={{ width: 140, mx: 'auto' }}>
        <CardFrame
          priority
          thumbUrl={current.thumb_url}
          imageUrl={current.image_url}
          rarity={STORE_FRAME_TONE}
          alt={current.name}
        />
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography
          sx={{
            fontFamily: `'Cormorant Garamond', serif`,
            fontSize: '22px',
            fontWeight: 600,
            color: '#F4ECDD',
          }}
        >
          {current.name}
        </Typography>
        <Typography sx={{ mt: '2px', fontSize: '12px', color: '#9A9285' }}>
          {current.set_name}
          {' · '}
          {current.kind === 'unique' && current.psa_grade
            ? t('grade', { grade: current.psa_grade })
            : t(`kind.${current.kind}`)}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          p: '14px',
          borderRadius: '12px',
          bgcolor: '#111019',
          border: '1px solid rgba(231,206,146,0.12)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Typography sx={{ fontSize: '12px', color: '#9A9285' }}>{t('buy.price')}</Typography>
          <ThbAmount
            satang={current.price_satang}
            sx={{ fontSize: '20px', fontWeight: 700, color: '#E7CE92' }}
          />
        </Box>

        {authenticated && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography sx={{ fontSize: '12px', color: '#9A9285' }}>{t('buy.balance')}</Typography>
            {balance === undefined ? (
              <CircularProgress size={14} sx={{ color: '#E7CE92' }} />
            ) : (
              <ThbAmount
                satang={balance}
                tone={short ? 'error' : 'default'}
                sx={{ fontSize: '14px', fontWeight: 600, color: short ? undefined : '#F4ECDD' }}
              />
            )}
          </Box>
        )}
      </Box>

      <Typography sx={{ fontSize: '12px', lineHeight: 1.6, color: '#9A9285' }}>
        {t('buy.finalSale')}
      </Typography>

      {(failureKey || short) && (
        <Typography role="alert" sx={{ fontSize: '12.5px', lineHeight: 1.6, color: NOTICE_COLOR }}>
          {failureKey ? t(`buy.errors.${failureKey}`, { price: priceLabel }) : t('buy.needsTopUp')}
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {!authenticated ? (
          <PrimaryButton
            fullWidth
            component={RouterLink}
            href={`${paths.auth.signIn}?${new URLSearchParams({ returnTo: pathname }).toString()}`}
          >
            {t('buy.signIn')}
          </PrimaryButton>
        ) : needsTopUp ? (
          <PrimaryButton fullWidth component={RouterLink} href={paths.wallet}>
            {t('buy.topUp')}
          </PrimaryButton>
        ) : (
          <PrimaryButton fullWidth disabled={buy.isPending || gone} onClick={handleBuy}>
            {buy.isPending ? t('buy.buying') : t('buy.cta', { price: priceLabel })}
          </PrimaryButton>
        )}

        <GhostButton fullWidth onClick={onClose} disabled={buy.isPending} sx={{ border: 'none' }}>
          {gone ? t('buy.close') : t('buy.cancel')}
        </GhostButton>
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

export type StoreBuyDialogProps = {
  /** The card being bought. Kept after close so the dialog can fade out with its content. */
  card: StoreCard | null;
  open: boolean;
  onClose: () => void;
};

export function StoreBuyDialog({ card, open, onClose }: StoreBuyDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: { ...dialogPaperProps.paper.sx, position: 'relative', backgroundImage: 'none' },
        },
      }}
    >
      {card && <StoreBuyDialogBody key={card.id} card={card} onClose={onClose} />}
    </Dialog>
  );
}

export default StoreBuyDialog;
