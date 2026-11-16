import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { FadeUp, GhostButton, PrimaryButton } from 'src/components/vault';

// ----------------------------------------------------------------------

export function VaultEmptyState() {
  const { t } = useTranslation('vault');
  const router = useRouter();

  return (
    <FadeUp>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '12px',
          padding: '48px 18px',
          borderRadius: '15px',
          border: '1px solid rgba(231,206,146,0.16)',
          background: '#17161B',
        }}
      >
        <Box
          sx={{
            width: '56px',
            height: '56px',
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(231,206,146,0.08)',
            border: '1px solid rgba(231,206,146,0.2)',
          }}
        >
          <Iconify icon="solar:box-minimalistic-bold" width={26} sx={{ color: '#E7CE92' }} />
        </Box>

        <Typography
          sx={{
            fontFamily: `'Cormorant Garamond', serif`,
            fontSize: '22px',
            fontWeight: 600,
            color: '#F4ECDD',
          }}
        >
          {t('empty.title', { defaultValue: 'Your vault is empty' })}
        </Typography>

        <Typography sx={{ fontSize: '13px', color: '#9A9285', maxWidth: '260px' }}>
          {t('empty.subtitle', {
            defaultValue: 'Pull a pack to start building your authenticated collection.',
          })}
        </Typography>

        <PrimaryButton sx={{ marginTop: '8px' }} onClick={() => router.push(paths.home)}>
          {t('empty.cta', { defaultValue: 'Browse packs' })}
        </PrimaryButton>
      </Box>
    </FadeUp>
  );
}

/**
 * The vault has cards, just none that match the category, collection or search
 * — so the way out is clearing the filters, not buying a pack.
 */
export function VaultFilteredEmptyState({ onClear }: { onClear: () => void }) {
  const { t } = useTranslation('vault');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '12px',
        padding: '48px 18px',
        borderRadius: '15px',
        border: '1px solid rgba(231,206,146,0.16)',
        background: '#17161B',
      }}
    >
      <Typography
        sx={{
          fontFamily: `'Cormorant Garamond', serif`,
          fontSize: '22px',
          fontWeight: 600,
          color: '#F4ECDD',
        }}
      >
        {t('empty.filteredTitle', { defaultValue: 'No cards match these filters' })}
      </Typography>

      <GhostButton onClick={onClear} sx={{ marginTop: '4px', py: '9px' }}>
        {t('empty.filteredClear', { defaultValue: 'Clear filters' })}
      </GhostButton>
    </Box>
  );
}

export default VaultEmptyState;
