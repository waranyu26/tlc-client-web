import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { ApiError } from 'src/lib/axios';
import { signOut, setPassword, changePassword } from 'src/api/auth.api';

import { checkPassword } from 'src/auth/password-policy';
import { PasswordStrength } from 'src/auth/components/password-strength';

import { fieldSx, dialogPaperProps } from './dialog-style';

// ----------------------------------------------------------------------

export type ChangePasswordDialogProps = {
  open: boolean;
  onClose: () => void;
  /** False for a Google-only account, which is setting its first password. */
  hasPassword: boolean;
};

export function ChangePasswordDialog({ open, onClose, hasPassword }: ChangePasswordDialogProps) {
  const { t } = useTranslation('account');
  const router = useRouter();
  const queryClient = useQueryClient();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCurrent('');
      setNext('');
      setConfirm('');
      setError(null);
    }
  }, [open]);

  const handleClose = useCallback(() => {
    if (submitting) return;
    onClose();
  }, [onClose, submitting]);

  const handleSubmit = useCallback(async () => {
    const problem = checkPassword(next);
    if (problem) {
      setError(t(problem, { ns: 'auth' }));
      return;
    }
    if (next !== confirm) {
      setError(t('errors.passwordsDoNotMatch', { ns: 'auth' }));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (hasPassword) {
        await changePassword(current, next);
        // The service revokes every session on a password change, this one
        // included — that is the point of changing it. Continuing to render a
        // signed-in shell against a dead session would just 401 on the next
        // request, so the sign-out is made explicit and deliberate.
        await signOut();
        router.push(paths.auth.signIn);
        return;
      }

      // Setting a first password adds a way in; it does not invalidate the
      // Google session the customer is currently using, so they stay put.
      await setPassword(next);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'security'] });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('security.genericError'));
    } finally {
      setSubmitting(false);
    }
  }, [confirm, current, hasPassword, next, onClose, queryClient, router, t]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth slotProps={dialogPaperProps}>
      <DialogTitle sx={{ fontFamily: `'Cormorant Garamond', serif`, color: '#F4ECDD' }}>
        {hasPassword ? t('security.changePasswordTitle') : t('security.setPasswordTitle')}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
          <DialogContentText sx={{ color: '#9A9285', fontSize: 13, lineHeight: 1.6 }}>
            {hasPassword ? t('security.changePasswordBody') : t('security.setPasswordBody')}
          </DialogContentText>

          {hasPassword && (
            <TextField
              autoFocus
              fullWidth
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              label={t('security.currentPassword')}
              autoComplete="current-password"
              sx={fieldSx}
            />
          )}

          <TextField
            autoFocus={!hasPassword}
            fullWidth
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            label={t('security.newPassword')}
            autoComplete="new-password"
            sx={fieldSx}
          />
          <PasswordStrength password={next} />

          <TextField
            fullWidth
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            label={t('security.confirmPassword')}
            autoComplete="new-password"
            sx={fieldSx}
          />

          {error && (
            <DialogContentText sx={{ color: '#C9605B', fontSize: 12.5 }}>{error}</DialogContentText>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} disabled={submitting} sx={{ color: '#9A9285' }}>
          {t('security.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || !next || !confirm || (hasPassword && !current)}
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

export default ChangePasswordDialog;
