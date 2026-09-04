import type { DeliveryMethod } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { typeScale } from 'src/theme/type-scale';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Ship it, or come and get it.
//
// Two tiles rather than a dropdown: this is the first choice in the flow and it
// changes what the rest of the form asks for, so it should be legible at a
// glance instead of hidden behind a select.
// ----------------------------------------------------------------------

// Icons come from the bundled offline set in `components/iconify/icon-sets.ts`,
// which is an allow-list rather than the full Solar catalogue — it carries no
// storefront glyph, so the shop borrows the closest "a place you go" icon.
const OPTIONS = [
  { value: 'ship', icon: 'solar:box-minimalistic-bold' },
  { value: 'pickup', icon: 'solar:home-angle-bold-duotone' },
] as const satisfies readonly { value: DeliveryMethod; icon: string }[];

type Props = {
  value: DeliveryMethod;
  onChange: (method: DeliveryMethod) => void;
};

export function MethodPicker({ value, onChange }: Props) {
  const { t } = useTranslation('delivery');

  return (
    <Box
      sx={{
        display: 'grid',
        gap: '10px',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
      }}
    >
      {OPTIONS.map((option) => {
        const selected = value === option.value;

        return (
          <Box
            key={option.value}
            role="radio"
            aria-checked={selected}
            tabIndex={0}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onChange(option.value);
              }
            }}
            sx={{
              cursor: 'pointer',
              padding: '14px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '11px',
              backgroundColor: selected ? 'rgba(231,206,146,0.07)' : '#111019',
              border: `1px solid ${selected ? 'rgba(231,206,146,0.45)' : 'rgba(231,206,146,0.12)'}`,
              transition: 'border-color 0.2s ease, background-color 0.2s ease',
              '&:hover': { borderColor: 'rgba(231,206,146,0.32)' },
            }}
          >
            <Iconify
              icon={option.icon}
              width={20}
              sx={{ flexShrink: 0, mt: '1px', color: selected ? '#E7CE92' : '#6F6A60' }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  ...typeScale.body,
                  fontWeight: 600,
                  color: selected ? '#F4ECDD' : '#9A9285',
                }}
              >
                {t(`method.${option.value}.title`)}
              </Typography>
              <Typography sx={{ ...typeScale.label, mt: '2px', color: '#6F6A60' }}>
                {t(`method.${option.value}.subtitle`)}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export default MethodPicker;
