import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { PrimaryButton } from 'src/components/vault';

import { useAuthContext } from 'src/auth/hooks/use-auth-context';

// ----------------------------------------------------------------------

export type WalletTopupPaymentFormProps = {
  amountSatang: number;
};

export function WalletTopupPaymentForm({ amountSatang }: WalletTopupPaymentFormProps) {
  const { t } = useTranslation('wallet');
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuthContext();

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stripe requires billing_details.email for PromptPay. The account email is
  // already known, so hide the field and supply it — but only together: hiding
  // it without also sending it in confirmParams makes confirmation fail.
  const email = user?.email;

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setSubmitting(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + paths.topupReturn,
        ...(email && { payment_method_data: { billing_details: { email } } }),
      },
    });

    // Only reachable if confirmation failed synchronously (e.g. validation) —
    // a successful confirmation redirects the browser to `return_url`.
    if (error) {
      setErrorMessage(
        error.message ??
          t('topup.genericError', { defaultValue: 'Something went wrong. Please try again.' })
      );
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <PaymentElement
        options={
          email
            ? {
                defaultValues: { billingDetails: { email } },
                fields: { billingDetails: { email: 'never' } },
              }
            : undefined
        }
      />

      {errorMessage && (
        <Typography sx={{ fontSize: '12px', color: '#C9605B', marginTop: '10px' }}>
          {errorMessage}
        </Typography>
      )}

      <PrimaryButton
        fullWidth
        onClick={handlePay}
        disabled={!stripe || !elements || submitting}
        sx={{ marginTop: '18px' }}
      >
        {submitting
          ? t('topup.processing', { defaultValue: 'Processing…' })
          : t('topup.payCta', {
              amount: `฿${(amountSatang / 100).toLocaleString('en-US')}`,
              defaultValue: `Pay ฿${(amountSatang / 100).toLocaleString('en-US')}`,
            })}
      </PrimaryButton>
    </Box>
  );
}

export default WalletTopupPaymentForm;
