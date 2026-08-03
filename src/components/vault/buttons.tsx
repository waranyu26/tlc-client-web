import type { ButtonProps } from '@mui/material/Button';

import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

export function PrimaryButton({ sx, ...other }: ButtonProps) {
  return (
    <Button
      disableElevation
      sx={[
        {
          background: 'linear-gradient(90deg, #E7CE92, #D9B45B)',
          color: '#0B0B0D',
          fontWeight: 700,
          fontSize: '15px',
          borderRadius: '12px',
          padding: '14px 20px',
          boxShadow: '0 8px 26px rgba(231,206,146,0.25)',
          '&:hover': {
            background: 'linear-gradient(90deg, #E7CE92, #D9B45B)',
            boxShadow: '0 10px 30px rgba(231,206,146,0.35)',
          },
          '&.Mui-disabled': {
            background: 'linear-gradient(90deg, #6B6350, #5A5343)',
            color: 'rgba(11,11,13,0.6)',
            boxShadow: 'none',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    />
  );
}

export function GhostButton({ sx, ...other }: ButtonProps) {
  return (
    <Button
      sx={[
        {
          background: 'transparent',
          border: '1px solid rgba(231,206,146,0.16)',
          color: '#9A9285',
          fontWeight: 600,
          borderRadius: '12px',
          padding: '13px 20px',
          '&:hover': {
            background: 'rgba(231,206,146,0.06)',
            border: '1px solid rgba(231,206,146,0.24)',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    />
  );
}

export function BuybackButton({ sx, ...other }: ButtonProps) {
  return (
    <Button
      sx={[
        {
          background: 'rgba(111,191,142,0.10)',
          border: '1px solid rgba(111,191,142,0.35)',
          color: '#6FBF8E',
          fontWeight: 700,
          borderRadius: '12px',
          padding: '14px 20px',
          '&:hover': {
            background: 'rgba(111,191,142,0.16)',
            border: '1px solid rgba(111,191,142,0.45)',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    />
  );
}
