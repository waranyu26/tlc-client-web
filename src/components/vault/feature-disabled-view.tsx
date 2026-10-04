import type { Features } from 'src/api/features.api';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { MaintenanceIllustration } from 'src/assets/illustrations';

import { FadeUp } from './fade-up';
import { GhostButton } from './buttons';
import { SectionHeading } from './trust-badge';

// ----------------------------------------------------------------------

export type FeatureDisabledViewProps = {
  /** Which switch is off — picks the copy. */
  feature: keyof Features;
};

/**
 * Full-page notice for an area the operator has switched off.
 *
 * Not an error: nothing is broken and nothing was charged, so it reads as a
 * closed sign with a way back rather than a failure with a retry.
 */
export function FeatureDisabledView({ feature }: FeatureDisabledViewProps) {
  const { t } = useTranslation();

  return (
    <FadeUp>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '12px',
          padding: { xs: '32px 18px', md: '56px 18px' },
        }}
      >
        <MaintenanceIllustration hideBackground sx={{ width: 240, mb: '8px' }} />

        <SectionHeading>{t(`featureDisabled.${feature}.title`)}</SectionHeading>

        <Typography sx={{ fontSize: '13px', color: '#9A9285', maxWidth: 360, lineHeight: 1.6 }}>
          {t(`featureDisabled.${feature}.body`)}
        </Typography>

        <GhostButton component={RouterLink} href={paths.home} sx={{ mt: '8px' }}>
          {t('featureDisabled.home')}
        </GhostButton>
      </Box>
    </FadeUp>
  );
}

export default FeatureDisabledView;
