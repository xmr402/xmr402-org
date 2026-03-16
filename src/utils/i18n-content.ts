import i18n from '../i18n/config';

export function getLocalizedContent(
  map: Record<string, string> | undefined,
  fallbackLang = 'en'
): string {
  if (!map) return '';
  return map[i18n.language] ?? map[fallbackLang] ?? Object.values(map)[0] ?? '';
}
