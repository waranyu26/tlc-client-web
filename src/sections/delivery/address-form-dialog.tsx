import type { Address } from 'src/api/types';
import type { AddressFormValues } from './schema';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { Form, Field } from 'src/components/hook-form';
import { GhostButton, PrimaryButton } from 'src/components/vault';

import { getAddressSchema, defaultAddressValues } from './schema';

// ----------------------------------------------------------------------

export type AddressFormDialogProps = {
  open: boolean;
  address?: Address | null;
  submitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: AddressFormValues) => void;
};

export function AddressFormDialog({
  open,
  address,
  submitting = false,
  error,
  onClose,
  onSubmit,
}: AddressFormDialogProps) {
  const { t } = useTranslation('delivery');
  const { t: tCommon } = useTranslation();

  const schema = getAddressSchema(t);

  const methods = useForm<AddressFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultAddressValues,
  });

  const { reset, handleSubmit } = methods;

  useEffect(() => {
    if (!open) return;

    reset(
      address
        ? {
            recipient_name: address.recipient_name,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2,
            district: address.district,
            province: address.province,
            postal_code: address.postal_code,
            is_default: address.is_default,
          }
        : defaultAddressValues
    );
  }, [open, address, reset]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { background: '#17161B', backgroundImage: 'none' } } }}
    >
      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ color: '#F4ECDD' }}>
          {address ? t('address.edit') : t('address.add')}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Field.Text name="recipient_name" label={t('address.form.recipientName')} />
            <Field.Text name="phone" label={t('address.form.phone')} />
            <Field.Text name="line1" label={t('address.form.line1')} />
            <Field.Text name="line2" label={t('address.form.line2')} />
            <Stack direction="row" spacing={2}>
              <Field.Text name="district" label={t('address.form.district')} />
              <Field.Text name="province" label={t('address.form.province')} />
            </Stack>
            <Field.Text
              name="postal_code"
              label={t('address.form.postalCode')}
              slotProps={{ htmlInput: { maxLength: 5, inputMode: 'numeric' } }}
            />
            <Field.Checkbox name="is_default" label={t('address.form.isDefault')} />

            {error && (
              <Typography sx={{ color: '#C9605B', fontSize: '12.5px' }}>{error}</Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <GhostButton onClick={onClose} disabled={submitting} type="button">
            {tCommon('actions.cancel')}
          </GhostButton>
          <PrimaryButton type="submit" disabled={submitting}>
            {tCommon('actions.save')}
          </PrimaryButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
