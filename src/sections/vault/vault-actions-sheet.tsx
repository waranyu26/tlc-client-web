import type { CollectionItem } from 'src/api/types';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBuybackMutation } from 'src/api/buyback.api';

import { Iconify } from 'src/components/iconify';
import { ThbAmount, GhostButton, RarityBadge, BuybackButton } from 'src/components/vault';

// ----------------------------------------------------------------------

type Step = 'menu' | 'confirm';

export type VaultActionsSheetProps = {
  item: CollectionItem | null;
  open: boolean;
  onClose: () => void;
  onSold: (amountSatang: number) => void;
};

export function VaultActionsSheet({ item, open, onClose, onSold }: VaultActionsSheetProps) {
  const { t } = useTranslation('vault');
  const router = useRouter();
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'));
  const [step, setStep] = useState<Step>('menu');
  const buybackMutation = useBuybackMutation();

  useEffect(() => {
    if (open) {
      setStep('menu');
      buybackMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item?.instance_id]);

  if (!item) return null;

  const handleRequestDelivery = () => {
    onClose();
    router.push(paths.delivery);
  };

  const handleConfirmSell = () => {
    buybackMutation.mutate(
      { card_instance_id: item.instance_id },
      {
        onSuccess: (result) => {
          onSold(result.amount_satang);
          onClose();
        },
      }
    );
  };

  return (
    <Drawer
      // Bottom sheet on phones; a right-hand side panel once there's room.
      anchor={isDesktop ? 'right' : 'bottom'}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            background: '#17161B',
            border: '1px solid rgba(231,206,146,0.16)',
            padding: { xs: '10px 18px 24px', md: '24px' },
            ...(isDesktop
              ? { width: 400, maxWidth: '100%', borderRight: 'none' }
              : {
                  borderTopLeftRadius: '16px',
                  borderTopRightRadius: '16px',
                  borderBottom: 'none',
                  maxWidth: '100%',
                }),
          },
        },
      }}
    >
      <Box
        sx={{
          display: { md: 'none' },
          width: '36px',
          height: '4px',
          borderRadius: '999px',
          background: 'rgba(231,206,146,0.24)',
          margin: '0 auto 16px',
        }}
      />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: `'Cormorant Garamond', serif`,
              fontSize: '20px',
              fontWeight: 600,
              color: '#F4ECDD',
            }}
          >
            {item.name}
          </Typography>
          <RarityBadge rarity={item.rarity} sx={{ marginTop: '6px' }} />
        </Box>

        <IconButton onClick={onClose} size="small" sx={{ color: '#9A9285' }}>
          <Iconify icon="carbon:close" width={18} />
        </IconButton>
      </Box>

      {step === 'menu' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          <BuybackButton
            startIcon={<Iconify icon="solar:wad-of-money-bold" width={18} />}
            onClick={() => setStep('confirm')}
          >
            {t('sheet.sellBack', { defaultValue: 'Sell back' })} ·{' '}
            <ThbAmount satang={item.buyback_price_satang} sx={{ marginLeft: '4px' }} />
          </BuybackButton>

          <GhostButton
            startIcon={<Iconify icon="carbon:delivery" width={18} />}
            onClick={handleRequestDelivery}
          >
            {t('sheet.requestDelivery', { defaultValue: 'Request delivery' })}
          </GhostButton>

          <GhostButton onClick={onClose} sx={{ border: 'none' }}>
            {t('sheet.cancel', { defaultValue: 'Cancel' })}
          </GhostButton>
        </Box>
      )}

      {step === 'confirm' && (
        <Box sx={{ marginTop: '20px' }}>
          <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#F4ECDD' }}>
            {t('sheet.confirmTitle', { defaultValue: 'Sell this card back?' })}
          </Typography>
          <Typography
            sx={{ fontSize: '13px', color: '#9A9285', marginTop: '6px', lineHeight: 1.6 }}
          >
            {t('sheet.confirmBody', {
              amount: `฿${(item.buyback_price_satang / 100).toLocaleString('en-US')}`,
              defaultValue: `You'll receive ฿${(item.buyback_price_satang / 100).toLocaleString(
                'en-US'
              )} in store credit instantly. This can't be undone.`,
            })}
          </Typography>

          {buybackMutation.isError && (
            <Typography sx={{ fontSize: '12px', color: '#C9605B', marginTop: '8px' }}>
              {t('sheet.error', { defaultValue: "Couldn't complete the sale. Please try again." })}
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            <BuybackButton onClick={handleConfirmSell} disabled={buybackMutation.isPending}>
              {buybackMutation.isPending
                ? t('sheet.selling', { defaultValue: 'Selling…' })
                : t('sheet.confirmCta', { defaultValue: 'Confirm sale' })}
            </BuybackButton>
            <GhostButton
              onClick={() => setStep('menu')}
              disabled={buybackMutation.isPending}
              sx={{ border: 'none' }}
            >
              {t('sheet.cancel', { defaultValue: 'Cancel' })}
            </GhostButton>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}

export default VaultActionsSheet;
