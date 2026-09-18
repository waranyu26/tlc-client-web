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
  /**
   * Confirmation was attempted and control came back to us, so the server is
   * now the only authority on the outcome.
   */
  onAttempted: () => void;
};

export function WalletTopupPaymentForm({ amountSatang, onAttempted }: WalletTopupPaymentFormProps) {
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
      // Keeps PromptPay in this dialog: Stripe.js shows its QR sheet and hands
      // control back here rather than navigating away, so we can show the
      // waiting and credited states in place. A method that genuinely needs a
      // redirect — a card facing 3-D Secure — still goes to `return_url`,
      // which reads the same server status this dialog does.
      redirect: 'if_required',
    });

    setSubmitting(false);

    // A form that is not filled in never reached the gateway, so the customer
    // stays on it with the message.
    if (error && (error.type === 'validation_error' || error.type === 'invalid_request_error')) {
      setErrorMessage(
        error.message ??
          t('topup.genericError', { defaultValue: 'Something went wrong. Please try again.' })
      );
      return;
    }

    // Anything else — confirmed, dismissed, or an error we cannot interpret —
    // is a question only our ledger can answer. A customer who pays in their
    // banking app and *then* closes the QR sheet arrives here with an error
    // and a completed payment, so believing this error would be the old
    // false-verdict bug wearing a different hat.
    onAttempted();
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
