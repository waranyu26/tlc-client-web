import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useTranslation } from 'react-i18next';
import { Elements } from '@stripe/react-stripe-js';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';
import { useTopupMutation } from 'src/api/wallet.api';

import { Iconify } from 'src/components/iconify';
import { GhostButton, PrimaryButton } from 'src/components/vault';

import { WalletTopupPaymentForm } from './wallet-topup-payment-form';

// ----------------------------------------------------------------------

// Loaded once at module scope — Stripe.js is fetched from the CDN, never bundled.
const stripePromise = CONFIG.stripe.publishableKey
  ? loadStripe(CONFIG.stripe.publishableKey)
  : null;

const PRESET_AMOUNTS_THB = [100, 300, 500, 1000, 2000];
const MIN_AMOUNT_SATANG = 2000; // ฿20

type Step = 'amount' | 'pay';

export type WalletTopupDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function WalletTopupDialog({ open, onClose }: WalletTopupDialogProps) {
  const { t } = useTranslation('wallet');
  const topupMutation = useTopupMutation();

  const [step, setStep] = useState<Step>('amount');
  const [selectedThb, setSelectedThb] = useState<number | null>(PRESET_AMOUNTS_THB[1]);
  const [customThb, setCustomThb] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep('amount');
      setSelectedThb(PRESET_AMOUNTS_THB[1]);
      setCustomThb('');
      setClientSecret(null);
      topupMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const amountThb = customThb ? Number(customThb) : (selectedThb ?? 0);
  const amountSatang = Math.round(amountThb * 100);
  const isValidAmount = amountSatang >= MIN_AMOUNT_SATANG;

  const handleContinue = () => {
    if (!isValidAmount) return;

    topupMutation.mutate(
      { amount_satang: amountSatang },
      {
        onSuccess: (result) => {
          setClientSecret(result.client_secret);
          setStep('pay');
        },
      }
    );
  };

  const paymentsNotConfigured = !CONFIG.stripe.publishableKey;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            background: '#17161B',
            border: '1px solid rgba(231,206,146,0.16)',
            borderRadius: '16px',
            padding: '20px',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography
          sx={{
            fontFamily: `'Cormorant Garamond', serif`,
            fontSize: '22px',
            fontWeight: 600,
            color: '#F4ECDD',
          }}
        >
          {t('topup.title', { defaultValue: 'Add Funds' })}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#9A9285' }}>
          <Iconify icon="carbon:close" width={18} />
        </IconButton>
      </Box>

      {paymentsNotConfigured ? (
        <Typography sx={{ fontSize: '13px', color: '#9A9285', marginTop: '20px' }}>
          {t('topup.notConfigured', {
            defaultValue: "Payments aren't configured in this environment.",
          })}
        </Typography>
      ) : (
        <>
          {step === 'amount' && (
            <Box sx={{ marginTop: '18px' }}>
              <Typography sx={{ fontSize: '13px', color: '#9A9285', marginBottom: '10px' }}>
                {t('topup.subtitle', { defaultValue: 'Choose an amount to add to your wallet.' })}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {PRESET_AMOUNTS_THB.map((preset) => {
                  const active = !customThb && selectedThb === preset;
                  return (
                    <Box
                      key={preset}
                      component="button"
                      type="button"
                      onClick={() => {
                        setSelectedThb(preset);
                        setCustomThb('');
                      }}
                      sx={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: `1px solid ${active ? '#E7CE92' : 'rgba(231,206,146,0.16)'}`,
                        background: active ? 'rgba(231,206,146,0.12)' : 'transparent',
                        color: active ? '#E7CE92' : '#9A9285',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      {`฿${preset.toLocaleString('en-US')}`}
                    </Box>
                  );
                })}
              </Box>

              <TextField
                fullWidth
                type="number"
                value={customThb}
                onChange={(event) => {
                  setCustomThb(event.target.value);
                  setSelectedThb(null);
                }}
                placeholder={t('topup.customPlaceholder', { defaultValue: 'Enter amount (฿)' })}
                label={t('topup.custom', { defaultValue: 'Custom amount' })}
                sx={{
                  marginTop: '14px',
                  '& .MuiOutlinedInput-root': { color: '#F4ECDD' },
                  '& .MuiInputLabel-root': { color: '#9A9285' },
                }}
              />

              {!isValidAmount && (customThb || selectedThb) && (
                <Typography sx={{ fontSize: '11.5px', color: '#C9605B', marginTop: '8px' }}>
                  {t('topup.minAmount', { defaultValue: 'Enter at least ฿20.' })}
                </Typography>
              )}

              {topupMutation.isError && (
                <Typography sx={{ fontSize: '11.5px', color: '#C9605B', marginTop: '8px' }}>
                  {t('topup.genericError', {
                    defaultValue: 'Something went wrong. Please try again.',
                  })}
                </Typography>
              )}

              <PrimaryButton
                fullWidth
                onClick={handleContinue}
                disabled={!isValidAmount || topupMutation.isPending}
                sx={{ marginTop: '18px' }}
              >
                {topupMutation.isPending
                  ? t('topup.processing', { defaultValue: 'Processing…' })
                  : t('topup.continue', { defaultValue: 'Continue' })}
              </PrimaryButton>
            </Box>
          )}

          {step === 'pay' && clientSecret && stripePromise && (
            <Box sx={{ marginTop: '18px' }}>
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#E7CE92',
                      colorBackground: '#111019',
                      colorText: '#F4ECDD',
                      colorDanger: '#C9605B',
                      fontFamily: `'Jost', sans-serif`,
                      borderRadius: '10px',
                    },
                  },
                }}
              >
                <WalletTopupPaymentForm amountSatang={amountSatang} />
              </Elements>

              <GhostButton
                fullWidth
                onClick={() => setStep('amount')}
                sx={{ marginTop: '10px', border: 'none' }}
              >
                {t('topup.back', { defaultValue: 'Back' })}
              </GhostButton>
            </Box>
          )}
        </>
      )}
    </Dialog>
  );
}

export default WalletTopupDialog;
