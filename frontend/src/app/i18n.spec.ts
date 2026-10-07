import de from '../../public/i18n/de.json';
import en from '../../public/i18n/en.json';

/** Flattens nested translations into `path.to.key` → value pairs. */
function flatten(translations: object, prefix = ''): Record<string, unknown> {
  return Object.entries(translations).reduce<Record<string, unknown>>((flat, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value !== null && typeof value === 'object' ? { ...flat, ...flatten(value, path) } : { ...flat, [path]: value };
  }, {});
}

describe('translation files', () => {
  const languages = { en: flatten(en), de: flatten(de) };

  it('define the same keys in English and German', () => {
    expect(Object.keys(languages.de).sort()).toEqual(Object.keys(languages.en).sort());
  });

  it('have no empty or non-text values', () => {
    for (const [language, flat] of Object.entries(languages)) {
      for (const [key, value] of Object.entries(flat)) {
        expect(typeof value === 'string' && value.trim() !== '', `${language}: ${key}`).toBe(true);
      }
    }
  });
});
