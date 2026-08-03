import type { Address } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';
import { GhostButton } from 'src/components/vault';

// ----------------------------------------------------------------------

export type AddressCardProps = {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
};

export function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  const { t } = useTranslation('delivery');

  return (
    <Box
      sx={{
        background: '#17161B',
        border: '1px solid rgba(231,206,146,0.16)',
        borderRadius: '14px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Typography sx={{ fontWeight: 600, color: '#F4ECDD', fontSize: '15px' }}>
            {address.recipient_name}
          </Typography>
          {address.is_default && (
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '999px',
                padding: '3px 10px',
                bgcolor: 'rgba(231,206,146,0.10)',
                border: '1px solid rgba(231,206,146,0.28)',
                color: '#E7CE92',
                fontSize: '9.5px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              {t('address.default')}
            </Box>
          )}
        </Stack>

        <Stack direction="row" sx={{ gap: '2px', flexShrink: 0 }}>
          <IconButton size="small" onClick={onEdit} sx={{ color: '#9A9285' }}>
            <Iconify icon="solar:pen-bold" width={16} />
          </IconButton>
          <IconButton size="small" onClick={onDelete} sx={{ color: '#C9605B' }}>
            <Iconify icon="solar:trash-bin-trash-bold" width={16} />
          </IconButton>
        </Stack>
      </Stack>

      <Typography sx={{ fontSize: '13px', color: '#9A9285', lineHeight: 1.6 }}>
        {address.phone}
        <br />
        {address.line1}
        {address.line2 ? `, ${address.line2}` : ''}
        <br />
        {address.district}, {address.province} {address.postal_code}
      </Typography>

      {!address.is_default && (
        <GhostButton
          size="small"
          onClick={onSetDefault}
          sx={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '12px' }}
        >
          {t('address.setDefault')}
        </GhostButton>
      )}
    </Box>
  );
}
