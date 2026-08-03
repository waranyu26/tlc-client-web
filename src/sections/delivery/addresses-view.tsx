import './i18n';

import type { Address } from 'src/api/types';
import type { AddressFormValues } from './schema';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { ApiError } from 'src/lib/axios';
import { READING_MAX_WIDTH } from 'src/layouts/vault/layout-config';
import {
  useAddresses,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} from 'src/api/delivery.api';

import { Iconify } from 'src/components/iconify';
import { FadeUp, GhostButton, PrimaryButton, SectionHeading } from 'src/components/vault';

import { AddressCard } from './address-card';
import { AddressFormDialog } from './address-form-dialog';

// ----------------------------------------------------------------------

export function AddressesView() {
  const { t } = useTranslation('delivery');
  const { t: tCommon } = useTranslation();

  const { data: addresses, isLoading, isError, refetch } = useAddresses();
  const createMutation = useCreateAddressMutation();
  const updateMutation = useUpdateAddressMutation();
  const deleteMutation = useDeleteAddressMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);

  const handleOpenCreate = () => {
    setEditingAddress(null);
    setFormError(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (address: Address) => {
    setEditingAddress(address);
    setFormError(null);
    setFormOpen(true);
  };

  const handleSubmit = (values: AddressFormValues) => {
    setFormError(null);

    const request = editingAddress
      ? updateMutation.mutateAsync({ id: editingAddress.id, body: values })
      : createMutation.mutateAsync(values);

    request
      .then(() => setFormOpen(false))
      .catch((error: unknown) => {
        setFormError(error instanceof ApiError ? error.message : tCommon('state.error'));
      });
  };

  const handleSetDefault = (address: Address) => {
    const { id, ...rest } = address;
    updateMutation.mutate({ id, body: { ...rest, is_default: true } });
  };

  const handleConfirmDelete = () => {
    if (!deletingAddress) return;
    deleteMutation.mutate(deletingAddress.id, { onSettled: () => setDeletingAddress(null) });
  };

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Box sx={{ width: '100%', maxWidth: READING_MAX_WIDTH, mx: { md: 'auto' } }}>
      <Stack
        direction="row"
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: '18px' }}
      >
        <Box>
          <SectionHeading>{t('address.title')}</SectionHeading>
          <Typography sx={{ color: '#9A9285', fontSize: '13px', mt: '4px' }}>
            {t('address.subtitle')}
          </Typography>
        </Box>

        <PrimaryButton
          onClick={handleOpenCreate}
          sx={{ padding: '10px 16px', fontSize: '13px', flexShrink: 0 }}
          startIcon={<Iconify icon="solar:add-circle-bold" width={16} />}
        >
          {t('address.add')}
        </PrimaryButton>
      </Stack>

      {isLoading && (
        <Stack sx={{ alignItems: 'center', py: 6 }}>
          <CircularProgress size={28} sx={{ color: '#E7CE92' }} />
        </Stack>
      )}

      {isError && !isLoading && (
        <FadeUp>
          <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 6 }}>
            <Typography sx={{ color: '#9A9285' }}>{tCommon('state.error')}</Typography>
            <GhostButton onClick={() => refetch()}>{tCommon('actions.retry')}</GhostButton>
          </Stack>
        </FadeUp>
      )}

      {!isLoading && !isError && (addresses?.length ?? 0) === 0 && (
        <FadeUp>
          <Typography sx={{ color: '#9A9285', textAlign: 'center', py: 6 }}>
            {t('address.empty')}
          </Typography>
        </FadeUp>
      )}

      {!isLoading && !isError && (addresses?.length ?? 0) > 0 && (
        <Stack spacing="12px">
          {(addresses ?? []).map((address, index) => (
            <FadeUp key={address.id} delay={Math.min(index * 0.04, 0.2)}>
              <AddressCard
                address={address}
                onEdit={() => handleOpenEdit(address)}
                onDelete={() => setDeletingAddress(address)}
                onSetDefault={() => handleSetDefault(address)}
              />
            </FadeUp>
          ))}
        </Stack>
      )}

      <AddressFormDialog
        open={formOpen}
        address={editingAddress}
        submitting={submitting}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <Dialog
        open={Boolean(deletingAddress)}
        onClose={() => setDeletingAddress(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { background: '#17161B', backgroundImage: 'none' } } }}
      >
        <DialogTitle sx={{ color: '#F4ECDD' }}>{t('address.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#9A9285', fontSize: '13px' }}>
            {t('address.deleteConfirmBody')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <GhostButton onClick={() => setDeletingAddress(null)}>
            {tCommon('actions.cancel')}
          </GhostButton>
          <PrimaryButton onClick={handleConfirmDelete} disabled={deleteMutation.isPending}>
            {tCommon('actions.delete')}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
