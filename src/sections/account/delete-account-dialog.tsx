import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { ApiError } from 'src/lib/axios';

// ----------------------------------------------------------------------

export type DeleteAccountDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteAccountDialog({ open, onClose, onConfirm }: DeleteAccountDialogProps) {
  const { t } = useTranslation('account');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    if (submitting) return;
    setError(null);
    onClose();
  }, [onClose, submitting]);

  const handleConfirm = useCallback(async () => {
    setSubmitting(true);
    setError(null);

    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('danger.deleteError'));
      setSubmitting(false);
    }
  }, [onConfirm, t]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#17161B',
            border: '1px solid rgba(231,206,146,0.16)',
            borderRadius: '15px',
          },
        },
      }}
    >
      <DialogTitle sx={{ fontFamily: `'Cormorant Garamond', serif`, color: '#F4ECDD' }}>
        {t('danger.confirmTitle')}
      </DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ color: '#9A9285', fontSize: 13.5, lineHeight: 1.6 }}>
          {t('danger.confirmBody')}
        </DialogContentText>

        {error && (
          <DialogContentText sx={{ color: '#C9605B', fontSize: 12.5, mt: 1.5 }}>
            {error}
          </DialogContentText>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} disabled={submitting} sx={{ color: '#9A9285' }}>
          {t('danger.cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={submitting}
          variant="contained"
          startIcon={submitting ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : undefined}
          sx={{ bgcolor: '#C9605B', color: '#fff', '&:hover': { bgcolor: '#B5514C' } }}
        >
          {t('danger.confirmAction')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteAccountDialog;
