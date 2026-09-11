import type { BoxProps } from '@mui/material/Box';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';

// ----------------------------------------------------------------------
// Compact TH/EN switch for the mobile top bar.
//
// Both languages are shown at once rather than cycling through a single
// button. A toggle that only shows the *other* language is ambiguous — the
// label could equally mean "you are here" or "go here" — and this one sits in a
// bar where there is no room for a caption to resolve it.
//
// The Account page keeps its own full-width segmented control: same idea, but
// that is a settings screen where the option gets a heading and room to breathe.
// ----------------------------------------------------------------------

const LANGUAGES = ['en', 'th'] as const;

/** Two letters, not a flag: a flag names a country, and neither language has one. */
const SHORT_LABEL: Record<(typeof LANGUAGES)[number], string> = {
  en: 'EN',
  th: 'TH',
};

export function LanguageToggle({ sx, ...other }: BoxProps) {
  const { i18n } = useTranslation();

  return (
    <Box
      role="group"
      aria-label={i18n.t('nav.language', { defaultValue: 'Language' })}
      sx={[
        {
          display: 'flex',
          alignItems: 'center',
          borderRadius: '999px',
          border: '1px solid rgba(231,206,146,0.16)',
          overflow: 'hidden',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {LANGUAGES.map((lng) => {
        const active = i18n.resolvedLanguage === lng;
        return (
          <ButtonBase
            key={lng}
            onClick={() => i18n.changeLanguage(lng)}
            aria-pressed={active}
            sx={{
              px: 1.15,
              py: 0.5,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              lineHeight: 1,
              color: active ? '#E7CE92' : '#5A5550',
              bgcolor: active ? 'rgba(231,206,146,0.12)' : 'transparent',
            }}
          >
            {SHORT_LABEL[lng]}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

export default LanguageToggle;
