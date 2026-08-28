import './i18n';

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/axios';
import { useCollection } from 'src/api/catalog.api';
import { READING_MAX_WIDTH } from 'src/layouts/vault/layout-config';
import { useAddresses, useCreateDeliveryRequestMutation } from 'src/api/delivery.api';

import { Iconify } from 'src/components/iconify';
import {
  FadeUp,
  CardFrame,
  RarityBadge,
  GhostButton,
  PrimaryButton,
  SectionHeading,
} from 'src/components/vault';

import { CardPicker } from './card-picker';
import { AddressPicker } from './address-picker';
import { DeliveryHistory } from './delivery-history';

// ----------------------------------------------------------------------

export function DeliveryHubView() {
  const { t } = useTranslation('delivery');
  const { t: tCommon } = useTranslation();
  const navigate = useNavigate();

  const {
    data: collection,
    isLoading: collectionLoading,
    isError: collectionError,
  } = useCollection();
  const { data: addresses, isLoading: addressesLoading, isError: addressesError } = useAddresses();
  const requestMutation = useCreateDeliveryRequestMutation();

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedCard = useMemo(
    () => collection?.find((item) => item.card_id === selectedCardId) ?? null,
    [collection, selectedCardId]
  );

  const canSubmit =
    Boolean(selectedCardId) && Boolean(selectedAddressId) && !requestMutation.isPending;

  const handleSubmit = () => {
    if (!selectedCardId || !selectedAddressId) return;

    setSubmitError(null);
    requestMutation.mutate(
      { card_id: selectedCardId, address_id: selectedAddressId },
      {
        onSuccess: () => {
          setSuccess(true);
          setSelectedCardId(null);
        },
        onError: (error) => {
          setSubmitError(error instanceof ApiError ? error.message : tCommon('state.error'));
        },
      }
    );
  };

  const handleRequestAnother = () => {
    setSuccess(false);
    setSelectedAddressId(null);
    setSubmitError(null);
  };

  if (success) {
    return (
      <Box sx={{ width: '100%', maxWidth: READING_MAX_WIDTH, mx: { md: 'auto' } }}>
        <FadeUp>
          <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 8 }}>
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
              <Iconify icon="solar:check-circle-bold" width={32} sx={{ color: '#6FBF8E' }} />
            </Box>
            <SectionHeading>{t('hub.successTitle')}</SectionHeading>
            <Typography sx={{ color: '#9A9285', fontSize: '13px', maxWidth: 320 }}>
              {t('hub.successSubtitle')}
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ pt: 2 }}>
              <GhostButton onClick={handleRequestAnother}>{t('hub.requestAnother')}</GhostButton>
              <PrimaryButton onClick={() => navigate(paths.vault)}>
                {t('hub.backToVault')}
              </PrimaryButton>
            </Stack>
          </Stack>

          {/* The card has just left the vault — show where it went right here,
              rather than making them hunt for it. */}
          <DeliveryHistory sx={{ mt: '8px' }} />
        </FadeUp>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: READING_MAX_WIDTH,
        mx: { md: 'auto' },
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <Box>
        <SectionHeading>{t('hub.title')}</SectionHeading>
        <Typography sx={{ color: '#9A9285', fontSize: '13px', mt: '4px' }}>
          {t('hub.subtitle')}
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          background: 'rgba(201,96,91,0.08)',
          border: '1px solid rgba(201,96,91,0.3)',
          borderRadius: '12px',
          padding: '14px',
        }}
      >
        <Iconify
          icon="solar:danger-triangle-bold"
          width={18}
          sx={{ color: '#C9605B', flexShrink: 0, mt: '2px' }}
        />
        <Typography sx={{ color: '#C9605B', fontSize: '12.5px', lineHeight: 1.6 }}>
          {t('hub.warning')}
        </Typography>
      </Stack>

      <Box>
        <Typography sx={{ color: '#F4ECDD', fontWeight: 600, fontSize: '14px', mb: '10px' }}>
          {t('hub.selectCard')}
        </Typography>

        {collectionLoading && (
          <Stack sx={{ alignItems: 'center', py: 4 }}>
            <CircularProgress size={24} sx={{ color: '#E7CE92' }} />
          </Stack>
        )}

        {collectionError && !collectionLoading && (
          <Typography sx={{ color: '#9A9285', fontSize: '13px' }}>
            {tCommon('state.error')}
          </Typography>
        )}

        {!collectionLoading && !collectionError && (collection?.length ?? 0) === 0 && (
          <Stack spacing={1.5} sx={{ py: 2 }}>
            <Typography sx={{ color: '#9A9285', fontSize: '13px' }}>{t('hub.noCards')}</Typography>
            <GhostButton onClick={() => navigate(paths.vault)} sx={{ alignSelf: 'flex-start' }}>
              {t('hub.goToVault')}
            </GhostButton>
          </Stack>
        )}

        {!collectionLoading && !collectionError && (collection?.length ?? 0) > 0 && (
          <CardPicker
            items={collection ?? []}
            selectedId={selectedCardId}
            onSelect={setSelectedCardId}
          />
        )}
      </Box>

      {selectedCard && (
        <FadeUp>
          <Box
            sx={{
              display: 'flex',
              gap: '14px',
              alignItems: 'center',
              background: '#111019',
              border: '1px solid rgba(231,206,146,0.12)',
              borderRadius: '14px',
              padding: '12px',
            }}
          >
            <Box sx={{ width: 56, flexShrink: 0 }}>
              <CardFrame
                thumbUrl={selectedCard.thumb_url}
                imageUrl={selectedCard.image_url}
                rarity={selectedCard.rarity}
                alt={selectedCard.name}
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: '#F4ECDD', fontWeight: 600, fontSize: '14px' }} noWrap>
                {selectedCard.name}
              </Typography>
              <RarityBadge rarity={selectedCard.rarity} sx={{ mt: '6px' }} />
            </Box>
          </Box>
        </FadeUp>
      )}

      <Box>
        <Typography sx={{ color: '#F4ECDD', fontWeight: 600, fontSize: '14px', mb: '10px' }}>
          {t('hub.selectAddress')}
        </Typography>

        {addressesLoading && (
          <Stack sx={{ alignItems: 'center', py: 4 }}>
            <CircularProgress size={24} sx={{ color: '#E7CE92' }} />
          </Stack>
        )}

        {addressesError && !addressesLoading && (
          <Typography sx={{ color: '#9A9285', fontSize: '13px' }}>
            {tCommon('state.error')}
          </Typography>
        )}

        {!addressesLoading && !addressesError && (addresses?.length ?? 0) === 0 && (
          <Stack spacing={1.5} sx={{ py: 2 }}>
            <Typography sx={{ color: '#9A9285', fontSize: '13px' }}>
              {t('hub.noAddresses')}
            </Typography>
            <GhostButton onClick={() => navigate(paths.addresses)} sx={{ alignSelf: 'flex-start' }}>
              {t('hub.addAddress')}
            </GhostButton>
          </Stack>
        )}

        {!addressesLoading && !addressesError && (addresses?.length ?? 0) > 0 && (
          <AddressPicker
            items={addresses ?? []}
            selectedId={selectedAddressId}
            onSelect={setSelectedAddressId}
          />
        )}
      </Box>

      {submitError && (
        <Typography sx={{ color: '#C9605B', fontSize: '12.5px' }}>{submitError}</Typography>
      )}

      <PrimaryButton disabled={!canSubmit} onClick={handleSubmit} sx={{ width: '100%' }}>
        {requestMutation.isPending ? t('hub.submitting') : t('hub.submit')}
      </PrimaryButton>

      {/* Sending a card removes it from the vault, so it needs somewhere to
          reappear — otherwise it just looks like it vanished. */}
      <DeliveryHistory sx={{ mt: '8px' }} />
    </Box>
  );
}
