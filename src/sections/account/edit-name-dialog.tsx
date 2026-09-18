import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';

import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { ApiError } from 'src/lib/axios';
import { updateProfile } from 'src/api/user.api';

import { checkFullName } from 'src/auth/password-policy';

import { fieldSx, dialogPaperProps } from './dialog-style';

// ----------------------------------------------------------------------

export type EditNameDialogProps = {
  open: boolean;
  onClose: () => void;
  currentName: string;
};

export function EditNameDialog({ open, onClose, currentName }: EditNameDialogProps) {
  const { t } = useTranslation('account');
  const queryClient = useQueryClient();

  const [name, setName] = useState(currentName);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-seed whenever the dialog opens: reopening after a cancel should show
  // the name on the account, not the abandoned edit.
  useEffect(() => {
    if (open) {
      setName(currentName);
      setError(null);
    }
  }, [open, currentName]);

  const handleClose = useCallback(() => {
    if (submitting) return;
    onClose();
  }, [onClose, submitting]);

  const handleSave = useCallback(async () => {
    const problem = checkFullName(name);
    if (problem) {
      setError(t(problem, { ns: 'auth' }));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await updateProfile(name.trim());
      // The profile is read all over the shell — header, account, delivery —
      // so the cache is what has to change, not just this dialog's state.
      await queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('security.genericError'));
    } finally {
      setSubmitting(false);
    }
  }, [name, onClose, queryClient, t]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth slotProps={dialogPaperProps}>
      <DialogTitle sx={{ fontFamily: `'Cormorant Garamond', serif`, color: '#F4ECDD' }}>
        {t('security.editNameTitle')}
      </DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          label={t('security.name')}
          error={Boolean(error)}
          helperText={error ?? ' '}
          sx={fieldSx}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} disabled={submitting} sx={{ color: '#9A9285' }}>
          {t('security.cancel')}
        </Button>
        <Button
          onClick={handleSave}
          disabled={submitting}
          variant="contained"
          startIcon={
            submitting ? <CircularProgress size={14} sx={{ color: '#17161B' }} /> : undefined
          }
          sx={{ bgcolor: '#E7CE92', color: '#17161B', '&:hover': { bgcolor: '#D9BE7E' } }}
        >
          {t('security.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditNameDialog;
