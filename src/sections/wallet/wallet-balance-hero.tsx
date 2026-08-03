import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { ThbAmount, PrimaryButton } from 'src/components/vault';

// ----------------------------------------------------------------------

export type WalletBalanceHeroProps = {
  balanceSatang?: number;
  loading?: boolean;
  onAddFunds: () => void;
};

export function WalletBalanceHero({
  balanceSatang,
  loading = false,
  onAddFunds,
}: WalletBalanceHeroProps) {
  const { t } = useTranslation('wallet');

  return (
    <Box
      sx={{
        borderRadius: '15px',
        border: '1px solid rgba(231,206,146,0.16)',
        background: '#17161B',
        padding: '24px 18px',
        textAlign: 'center',
      }}
    >
      <Typography
        sx={{
          fontSize: '9.5px',
          fontWeight: 600,
          letterSpacing: '0.2em',
          color: '#9A9285',
          textTransform: 'uppercase',
        }}
      >
        {t('balanceLabel', { defaultValue: 'AVAILABLE BALANCE' })}
      </Typography>

      {loading ? (
        <Skeleton
          variant="text"
          width={180}
          height={58}
          sx={{ bgcolor: 'rgba(231,206,146,0.08)', margin: '0 auto' }}
        />
      ) : (
        <ThbAmount hero satang={balanceSatang ?? 0} sx={{ display: 'block', marginTop: '2px' }} />
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '10px',
        }}
      >
        <Iconify icon="eva:star-fill" width={14} sx={{ color: '#6FBF8E' }} />
        <Typography sx={{ fontSize: '11px', color: '#6FBF8E' }}>
          {t('trustNote', { defaultValue: 'Backed by 100% authenticated inventory.' })}
        </Typography>
      </Box>

      <PrimaryButton
        fullWidth
        onClick={onAddFunds}
        startIcon={<Iconify icon="solar:add-circle-bold" width={18} />}
        sx={{ marginTop: '18px' }}
      >
        {t('addFunds', { defaultValue: 'Add Funds' })}
      </PrimaryButton>

      <Typography sx={{ fontSize: '10.5px', color: '#4A4844', marginTop: '10px', lineHeight: 1.5 }}>
        {t('creditOnlyNote', {
          defaultValue:
            'Funds are store credit for gacha pulls and packs only — no cash withdrawal.',
        })}
      </Typography>
    </Box>
  );
}

export default WalletBalanceHero;
