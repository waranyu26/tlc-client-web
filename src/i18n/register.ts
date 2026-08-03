import i18n from './i18n';

// ----------------------------------------------------------------------
// Feature slices call this once (module scope) to add their own translation
// namespace without editing the central i18n config — keeps parallel work
// collision-free. Example:
//   import { registerNamespace } from 'src/i18n/register';
//   import en from 'src/i18n/locales/en/wallet.json';
//   import th from 'src/i18n/locales/th/wallet.json';
//   registerNamespace('wallet', en, th);
// ----------------------------------------------------------------------

export function registerNamespace(
  ns: string,
  en: Record<string, unknown>,
  th: Record<string, unknown>
) {
  if (!i18n.hasResourceBundle('en', ns)) i18n.addResourceBundle('en', ns, en, true, true);
  if (!i18n.hasResourceBundle('th', ns)) i18n.addResourceBundle('th', ns, th, true, true);
}
