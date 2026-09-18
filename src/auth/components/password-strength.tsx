import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { passwordStrength } from '../password-policy';

// ----------------------------------------------------------------------

const TONES = ['#4A4844', '#C9605B', '#C98F5B', '#C9B85B', '#7FB069'] as const;

type Props = {
  password: string;
};

/**
 * A four-segment meter under a password field.
 *
 * It reports the score, never gates on it — the rule that actually refuses a
 * password is the policy, which the field's own validation already enforces
 * and the service enforces again. A meter that blocked submission would be a
 * second, softer policy nobody wrote down.
 */
export function PasswordStrength({ password }: Props) {
  const { t } = useTranslation('auth');
  const score = useMemo(() => passwordStrength(password), [password]);

  if (!password) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Box sx={{ display: 'flex', gap: 0.5 }} aria-hidden>
        {[1, 2, 3, 4].map((segment) => (
          <Box
            key={segment}
            sx={{
              height: 3,
              flex: 1,
              borderRadius: '999px',
              bgcolor: segment <= score ? TONES[score] : 'rgba(231,206,146,0.12)',
              transition: 'background-color 160ms ease',
            }}
          />
        ))}
      </Box>
      {/* The score is also announced, not only coloured: a four-bar meter that
          only differs by hue tells a colour-blind or screen-reader user
          nothing. */}
      <Typography role="status" sx={{ fontSize: 11, color: '#9A9285' }}>
        {t(`passwordStrength.${score}`)}
      </Typography>
    </Box>
  );
}
