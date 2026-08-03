import type { BoxProps } from '@mui/material/Box';
import type { TypographyProps } from '@mui/material/Typography';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function TrustBadge({ sx, ...other }: BoxProps) {
  const { t } = useTranslation();

  return (
    <Box
      sx={[
        {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#6FBF8E',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Iconify icon="solar:shield-check-bold" width={16} sx={{ flexShrink: 0 }} />
      <Typography variant="caption" sx={{ color: '#6FBF8E', lineHeight: 1.5, fontSize: '11px' }}>
        {t('trust.authenticated', {
          defaultValue:
            'Authenticated inventory. All cards graded and vaulted before listing. Pull rates audited monthly.',
        })}
      </Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function SectionHeading({ sx, children, ...other }: TypographyProps) {
  return (
    <Typography
      sx={[
        {
          fontFamily: `'Cormorant Garamond', serif`,
          fontSize: '26px',
          fontWeight: 600,
          color: '#F4ECDD',
          lineHeight: 1.15,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {children}
    </Typography>
  );
}

export default TrustBadge;
