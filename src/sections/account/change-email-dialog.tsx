import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { ApiError } from 'src/lib/axios';
import { cancelEmailChange, requestEmailChange } from 'src/api/auth.api';

import { fieldSx, dialogPaperProps } from './dialog-style';

// ----------------------------------------------------------------------

export type ChangeEmailDialogProps = {
  open: boolean;
  onClose: () => void;
  currentEmail: string;
  pendingEmail: string;
  hasPassword: boolean;
};

/**
 * Three states in one dialog, because they are three stages of one thing:
 * a Google-only account that must set a password first, a request form, and a
 * pending request waiting on a click in another inbox.
 */
export function ChangeEmailDialog({
  open,
  onClose,
  currentEmail,
  pendingEmail,
  hasPassword,
}: ChangeEmailDialogProps) {
  const { t } = useTranslation('account');
  const queryClient = useQueryClient();

  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) {
      setNewEmail('');
      setPassword('');
      setError(null);
      setSent(false);
    }
  }, [open]);

  const handleClose = useCallback(() => {
    if (submitting) return;
    onClose();
  }, [onClose, submitting]);

  const refreshSecurity = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['auth', 'security'] }),
    [queryClient]
  );

  const handleRequest = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      await requestEmailChange(newEmail, password);
      await refreshSecurity();
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('security.genericError'));
    } finally {
      setSubmitting(false);
    }
  }, [newEmail, password, refreshSecurity, t]);

  const handleCancelPending = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      await cancelEmailChange();
      await refreshSecurity();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('security.genericError'));
    } finally {
      setSubmitting(false);
    }
  }, [onClose, refreshSecurity, t]);

  // A Google-only account has no password to re-authenticate with. Accepting
  // the live session instead would let anyone who finds an unattended browser
  // move the address — and with it, the account.
  if (!hasPassword) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth slotProps={dialogPaperProps}>
        <DialogTitle sx={{ fontFamily: `'Cormorant Garamond', serif`, color: '#F4ECDD' }}>
          {t('security.changeEmailTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#9A9285', fontSize: 13.5, lineHeight: 1.6 }}>
            {t('security.needPasswordFirst')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleClose} sx={{ color: '#9A9285' }}>
            {t('security.close')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  const showPending = Boolean(pendingEmail) && !sent;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth slotProps={dialogPaperProps}>
      <DialogTitle sx={{ fontFamily: `'Cormorant Garamond', serif`, color: '#F4ECDD' }}>
        {t('security.changeEmailTitle')}
      </DialogTitle>

      <DialogContent>
        {sent ? (
          <Alert
            severity="success"
            sx={{
              bgcolor: 'rgba(231,206,146,0.1)',
              color: '#E7CE92',
              border: '1px solid rgba(231,206,146,0.35)',
              '& .MuiAlert-icon': { color: '#E7CE92' },
            }}
          >
            {t('security.changeEmailSent', { email: newEmail })}
          </Alert>
        ) : showPending ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <DialogContentText sx={{ color: '#9A9285', fontSize: 13.5, lineHeight: 1.6 }}>
              {t('security.pendingBody', { email: pendingEmail, current: currentEmail })}
            </DialogContentText>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
            <DialogContentText sx={{ color: '#9A9285', fontSize: 13, lineHeight: 1.6 }}>
              {t('security.changeEmailBody')}
            </DialogContentText>
            <TextField
              autoFocus
              fullWidth
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              label={t('security.newEmail')}
              autoComplete="email"
              sx={fieldSx}
            />
            <TextField
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label={t('security.currentPassword')}
              autoComplete="current-password"
              sx={fieldSx}
            />
            {error && (
              <DialogContentText sx={{ color: '#C9605B', fontSize: 12.5 }}>{error}</DialogContentText>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        {sent ? (
          <Button onClick={handleClose} sx={{ color: '#9A9285' }}>
            {t('security.close')}
          </Button>
        ) : showPending ? (
          <>
            <Button onClick={handleClose} disabled={submitting} sx={{ color: '#9A9285' }}>
              {t('security.close')}
            </Button>
            <Button
              onClick={handleCancelPending}
              disabled={submitting}
              sx={{ color: '#C9605B' }}
            >
              {t('security.cancelPending')}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose} disabled={submitting} sx={{ color: '#9A9285' }}>
              {t('security.cancel')}
            </Button>
            <Button
              onClick={handleRequest}
              disabled={submitting || !newEmail || !password}
              variant="contained"
              startIcon={
                submitting ? <CircularProgress size={14} sx={{ color: '#17161B' }} /> : undefined
              }
              sx={{ bgcolor: '#E7CE92', color: '#17161B', '&:hover': { bgcolor: '#D9BE7E' } }}
            >
              {t('security.sendConfirmation')}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default ChangeEmailDialog;
