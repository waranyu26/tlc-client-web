import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { SectionHeading } from 'src/components/vault';

// ----------------------------------------------------------------------

/**
 * What a card can become once it is yours.
 *
 * A pull is not the end of the transaction — the slab sits in the vault until
 * the owner either sells it back at the published price or has it shipped. That
 * choice is the reason the buyback figure on every card matters, and it was
 * nowhere on the page that asks for the money.
 */
export function PackLifecycleStrip() {
  const { t } = useTranslation('pack');

  const steps = [
    {
      key: 'vault',
      icon: 'solar:shield-keyhole-bold-duotone',
      title: t('lifecycle.vaultTitle', { defaultValue: 'It lands in your vault' }),
      body: t('lifecycle.vaultBody', {
        defaultValue:
          'The exact slab you pulled is held under your name, with its own PSA certificate.',
      }),
    },
    {
      key: 'buyback',
      icon: 'solar:restart-bold',
      title: t('lifecycle.buybackTitle', { defaultValue: 'Sell it back instantly' }),
      body: t('lifecycle.buybackBody', {
        defaultValue:
          'Every card carries a buyback price up front. Take it whenever you like and the credit is immediate.',
      }),
    },
    {
      key: 'ship',
      icon: 'carbon:delivery',
      title: t('lifecycle.shipTitle', { defaultValue: 'Or have it shipped' }),
      body: t('lifecycle.shipBody', {
        defaultValue: 'Request delivery and the graded slab is sent to you, tracked, still sealed.',
      }),
    },
  ] as const;

  return (
    <Box
      sx={{
        minWidth: 0,
        padding: { xs: '16px', md: '20px' },
        borderRadius: '14px',
        border: '1px solid rgba(231,206,146,0.14)',
        backgroundColor: '#111019',
      }}
    >
      <SectionHeading sx={{ mb: '4px' }}>
        {t('lifecycle.title', { defaultValue: 'After you pull' })}
      </SectionHeading>
      <Typography sx={{ fontSize: '11.5px', color: '#9A9285', mb: '16px' }}>
        {t('lifecycle.subtitle', { defaultValue: 'Keep it, cash it, or take it home.' })}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {steps.map((step) => (
          <Box key={step.key} sx={{ display: 'flex', gap: '12px' }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                flexShrink: 0,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(231,206,146,0.08)',
                border: '1px solid rgba(231,206,146,0.2)',
              }}
            >
              <Iconify icon={step.icon} width={17} sx={{ color: '#E7CE92' }} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: '#F4ECDD' }}>
                {step.title}
              </Typography>
              <Typography
                sx={{ mt: '2px', fontSize: '11.5px', color: '#9A9285', lineHeight: 1.55 }}
              >
                {step.body}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default PackLifecycleStrip;
