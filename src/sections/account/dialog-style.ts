// Shared chrome for the account dialogs, so name/email/password read as one
// surface rather than three that drifted apart.

export const dialogPaperProps = {
  paper: {
    sx: {
      bgcolor: '#17161B',
      border: '1px solid rgba(231,206,146,0.16)',
      borderRadius: '15px',
    },
  },
} as const;

export const fieldSx = {
  '& .MuiInputBase-root': { color: '#F4ECDD' },
  '& .MuiInputLabel-root': { color: '#9A9285' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(231,206,146,0.2)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(231,206,146,0.35)' },
  '& .MuiFormHelperText-root': { color: '#9A9285' },
  '& .MuiFormHelperText-root.Mui-error': { color: '#C9605B' },
} as const;
