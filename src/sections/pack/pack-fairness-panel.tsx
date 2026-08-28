import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { SectionHeading } from 'src/components/vault';

import { PackBeaconProof } from './pack-beacon-proof';

// ----------------------------------------------------------------------

/**
 * How a pull is proven fair, said before the money moves rather than after.
 *
 * The mechanism is the product's real differentiator and it was only visible on
 * the receipt, once the customer had already paid. The three steps mirror what
 * the service actually does: commit to an unpublished drand round, wait for the
 * beacon, derive the outcome from it.
 */
export function PackFairnessPanel() {
  const { t } = useTranslation('pack');

  const steps = [
    {
      key: 'commit',
      icon: 'solar:lock-password-outline',
      title: t('fair.commitTitle', { defaultValue: 'We commit first' }),
      body: t('fair.commitBody', {
        defaultValue:
          'Your pull is locked to a drand randomness round that has not been published yet — so nobody, us included, can know the outcome when you pay.',
      }),
    },
    {
      key: 'beacon',
      icon: 'solar:clock-circle-outline',
      title: t('fair.beaconTitle', { defaultValue: 'The beacon decides' }),
      body: t('fair.beaconBody', {
        defaultValue:
          'Seconds later the public drand network publishes that round. It is run by independent operators, so the number cannot be steered.',
      }),
    },
    {
      key: 'verify',
      icon: 'solar:verified-check-bold',
      title: t('fair.verifyTitle', { defaultValue: 'You can check it' }),
      body: t('fair.verifyBody', {
        defaultValue:
          'Your card is derived from that published number, and every pull comes with a receipt you can verify yourself.',
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
        {t('fair.title', { defaultValue: 'Provably fair' })}
      </SectionHeading>
      <Typography sx={{ fontSize: '11.5px', color: '#9A9285', mb: '16px' }}>
        {t('fair.subtitle', {
          defaultValue: 'The odds above are not a promise — they are checkable.',
        })}
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

      {/* The three steps above are a claim. This is one instance of it the
          reader can check for themselves, before paying rather than after. */}
      <PackBeaconProof />
    </Box>
  );
}

export default PackFairnessPanel;
