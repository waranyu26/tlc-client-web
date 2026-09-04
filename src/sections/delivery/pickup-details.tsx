import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { typeScale } from 'src/theme/type-scale';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Where to come, and who may collect.
//
// The shop's address is copy rather than data: there is one counter, so a
// locations table would be a schema for a list of length one. It lives in the
// delivery namespace so the Thai build can give Thai directions rather than a
// transliterated English address.
//
// The name and phone are asked for explicitly instead of being lifted from the
// account: a User row has no phone number at all, and the person collecting is
// not always the person who pulled the card.
// ----------------------------------------------------------------------

type Props = {
  recipientName: string;
  phone: string;
  onRecipientNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#111019',
    borderRadius: '12px',
    color: '#F4ECDD',
    '& fieldset': { borderColor: 'rgba(231,206,146,0.16)' },
    '&:hover fieldset': { borderColor: 'rgba(231,206,146,0.32)' },
    '&.Mui-focused fieldset': { borderColor: '#E7CE92' },
  },
  '& .MuiInputLabel-root': { color: '#6F6A60' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#E7CE92' },
};

export function PickupDetails({
  recipientName,
  phone,
  onRecipientNameChange,
  onPhoneChange,
}: Props) {
  const { t } = useTranslation('delivery');

  return (
    <Stack spacing="14px">
      <Box
        sx={{
          padding: '14px',
          borderRadius: '14px',
          backgroundColor: '#111019',
          border: '1px solid rgba(231,206,146,0.12)',
        }}
      >
        <Stack direction="row" spacing="11px" sx={{ alignItems: 'flex-start' }}>
          <Iconify
            icon="solar:home-angle-bold-duotone"
            width={20}
            sx={{ color: '#E7CE92', flexShrink: 0, mt: '1px' }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ ...typeScale.body, fontWeight: 600, color: '#F4ECDD' }}>
              {t('pickup.shopName')}
            </Typography>
            <Typography sx={{ ...typeScale.label, mt: '3px', color: '#9A9285' }}>
              {t('pickup.shopAddress')}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing="11px" sx={{ alignItems: 'center', mt: '12px' }}>
          <Iconify
            icon="solar:clock-circle-bold"
            width={16}
            sx={{ color: '#6F6A60', flexShrink: 0 }}
          />
          <Typography sx={{ ...typeScale.label, color: '#9A9285' }}>
            {t('pickup.shopHours')}
          </Typography>
        </Stack>
      </Box>

      <Stack direction="row" spacing="9px" sx={{ alignItems: 'flex-start' }}>
        <Iconify
          icon="solar:user-id-bold"
          width={17}
          sx={{ color: '#6FBF8E', flexShrink: 0, mt: '2px' }}
        />
        <Typography sx={{ ...typeScale.label, color: '#9A9285' }}>{t('pickup.idNote')}</Typography>
      </Stack>

      <TextField
        fullWidth
        label={t('pickup.recipientName')}
        value={recipientName}
        onChange={(event) => onRecipientNameChange(event.target.value)}
        sx={fieldSx}
      />
      <TextField
        fullWidth
        label={t('pickup.phone')}
        value={phone}
        onChange={(event) => onPhoneChange(event.target.value)}
        sx={fieldSx}
      />
    </Stack>
  );
}

export default PickupDetails;
