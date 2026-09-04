import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { typeScale } from 'src/theme/type-scale';

import { Iconify } from 'src/components/iconify';
import { SectionHeading } from 'src/components/vault';

// ----------------------------------------------------------------------
// The product, in three lines.
//
// Home is where a first-time customer lands, and with a handful of packs on the
// shelf the page has room to say what the shop actually does. The fairness line
// closes it because it is the one claim here that a sceptic can go and check.
// ----------------------------------------------------------------------

// Icons come from the bundled offline set in `components/iconify/icon-sets.ts`,
// which is an allow-list, not the full Solar catalogue — anything not in there
// fails the build rather than silently rendering blank.
const STEPS = [
  {
    key: 'topUp',
    icon: 'solar:wad-of-money-bold',
    title: 'Top up your balance',
    body: 'Add credit with a card. Balances are held in Thai baht and never expire.',
  },
  {
    key: 'pull',
    icon: 'solar:box-minimalistic-bold',
    title: 'Open a pack',
    body: 'Every pack publishes its odds up front. One pull, one graded slab.',
  },
  {
    key: 'keep',
    icon: 'solar:cup-star-bold',
    title: 'Keep it, sell it, or ship it',
    body: 'Hold the card in your vault, sell it back instantly, or have it delivered.',
  },
] as const;

export function HowItWorks() {
  const { t } = useTranslation('home');

  return (
    <Box>
      <SectionHeading sx={{ mb: 1.5 }}>
        {t('how.heading', { defaultValue: 'How it works' })}
      </SectionHeading>

      <Box
        sx={{
          display: 'grid',
          gap: { xs: 1.5, md: 2 },
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        }}
      >
        {STEPS.map((step, index) => (
          <Box
            key={step.key}
            sx={{
              padding: { xs: '16px', md: '20px' },
              borderRadius: '15px',
              border: '1px solid rgba(231,206,146,0.16)',
              backgroundColor: '#17161B',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(231,206,146,0.22)',
                  backgroundColor: 'rgba(231,206,146,0.07)',
                }}
              >
                <Iconify icon={step.icon} width={20} sx={{ color: '#E7CE92' }} />
              </Box>

              <Typography sx={{ ...typeScale.micro, color: '#4A4844' }}>
                {String(index + 1).padStart(2, '0')}
              </Typography>
            </Box>

            <Typography sx={{ ...typeScale.body, mt: '14px', fontWeight: 600, color: '#F4ECDD' }}>
              {t(`how.${step.key}.title`, { defaultValue: step.title })}
            </Typography>

            <Typography sx={{ ...typeScale.label, mt: '5px', color: '#9A9285' }}>
              {t(`how.${step.key}.body`, { defaultValue: step.body })}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '9px',
          mt: { xs: 1.5, md: 2 },
          padding: { xs: '14px 16px', md: '16px 20px' },
          borderRadius: '15px',
          border: '1px solid rgba(111,191,142,0.22)',
          backgroundColor: 'rgba(111,191,142,0.06)',
        }}
      >
        <Iconify
          icon="solar:shield-check-bold"
          width={17}
          sx={{ color: '#6FBF8E', flexShrink: 0, mt: '1px' }}
        />
        <Typography sx={{ ...typeScale.label, color: '#9A9285' }}>
          {t('how.fairness', {
            defaultValue:
              'Every pull is committed to a public drand beacon round that has not been published yet — so nobody, including us, can know or steer the result when you pay. Each pull comes with a receipt anyone can verify.',
          })}
        </Typography>
      </Box>
    </Box>
  );
}

export default HowItWorks;
