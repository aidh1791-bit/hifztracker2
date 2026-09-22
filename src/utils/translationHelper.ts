/**
 * Language and translation helper for Ustadh remarks
 * Respects original text as written without mock keyword dictionary substitutions.
 */

export function isUrduOrArabicScript(text: string): boolean {
  if (!text) return false;
  // Unicode ranges for Arabic, Urdu, Farsi
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

/**
 * Returns original text without fabricating mock translations.
 * If translation is desired, external tools or authentic AI translation should be used.
 */
export async function translateUrduToEnglish(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return '';
  return trimmed;
}

/**
 * Returns a direct Google Translate link URL for parents who wish to read remarks in English.
 */
export function getGoogleTranslateUrl(text: string, fromLang: string = 'ur', toLang: string = 'en'): string {
  return `https://translate.google.com/?sl=${fromLang}&tl=${toLang}&text=${encodeURIComponent(text)}&op=translate`;
}
