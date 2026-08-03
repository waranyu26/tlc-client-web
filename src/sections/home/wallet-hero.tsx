import type { BoxProps } from '@mui/material/Box';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { FadeUp, ThbAmount } from 'src/components/vault';

import { useAuthContext } from 'src/auth/hooks/use-auth-context';

// ----------------------------------------------------------------------

function greetingKey(hour: number) {
  if (hour < 12) return 'greeting.morning';
  if (hour < 18) return 'greeting.afternoon';
  return 'greeting.evening';
}

export type WalletHeroProps = BoxProps & {
  balanceSatang?: number;
  isLoading: boolean;
};

export function WalletHero({ balanceSatang, isLoading, sx, ...other }: WalletHeroProps) {
  const { t } = useTranslation('home');
  const { user } = useAuthContext();

  const firstName = user?.full_name?.split(' ')[0] || '';
  const greeting = firstName
    ? t(greetingKey(new Date().getHours()), { name: firstName })
    : t('greeting.fallback', { defaultValue: 'Welcome back' });

  return (
    <Box
      sx={[
        {
          padding: '20px 18px 4px',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <FadeUp>
        <Typography sx={{ fontSize: '15px', color: '#9A9285', fontWeight: 500 }}>
          {greeting}
        </Typography>

        <Typography
          sx={{
            fontSize: '9.5px',
            fontWeight: 600,
            letterSpacing: '0.2em',
            color: '#9A9285',
            marginTop: '18px',
            textTransform: 'uppercase',
          }}
        >
          {t('balanceLabel', { defaultValue: 'Available balance' })}
        </Typography>

        {isLoading ? (
          <Skeleton
            variant="text"
            width={160}
            height={58}
            sx={{ bgcolor: 'rgba(231,206,146,0.08)' }}
          />
        ) : (
          <ThbAmount hero satang={balanceSatang ?? 0} />
        )}
      </FadeUp>
    </Box>
  );
}

export default WalletHero;
