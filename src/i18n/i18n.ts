import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import thCommon from './locales/th/common.json';

// ----------------------------------------------------------------------
// English-first with a stubbed Thai locale (NFR-A2). Feature slices register their
// own namespaces at import time via `i18n.addResourceBundle(...)` so this file stays
// collision-free — see src/i18n/register.ts.
// ----------------------------------------------------------------------

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      th: { common: thCommon },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'th'],
    defaultNS: 'common',
    ns: ['common'],
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
  });

export default i18n;
