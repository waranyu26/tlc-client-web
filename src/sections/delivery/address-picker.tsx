import type { Address } from 'src/api/types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type AddressPickerProps = {
  items: Address[];
  selectedId: string | null;
  onSelect: (addressId: string) => void;
};

export function AddressPicker({ items, selectedId, onSelect }: AddressPickerProps) {
  return (
    <Stack spacing="8px">
      {items.map((address) => {
        const selected = address.id === selectedId;

        return (
          <ButtonBase
            key={address.id}
            onClick={() => onSelect(address.id)}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '12px',
              textAlign: 'left',
              border: selected ? '1.5px solid #E7CE92' : '1px solid rgba(231,206,146,0.14)',
              background: selected ? 'rgba(231,206,146,0.08)' : '#17161B',
            }}
          >
            <Box>
              <Typography sx={{ color: '#F4ECDD', fontWeight: 600, fontSize: '13.5px' }}>
                {address.recipient_name}
              </Typography>
              <Typography sx={{ color: '#9A9285', fontSize: '12px', mt: '3px', lineHeight: 1.5 }}>
                {address.line1}, {address.district}, {address.province} {address.postal_code}
              </Typography>
            </Box>

            {selected && (
              <Iconify
                icon="solar:check-circle-bold"
                width={18}
                sx={{ color: '#E7CE92', flexShrink: 0 }}
              />
            )}
          </ButtonBase>
        );
      })}
    </Stack>
  );
}
