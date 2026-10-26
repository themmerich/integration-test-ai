import de from '../../public/i18n/de.json';

/** Flattens nested translations into `path.to.key` → value pairs. */
function flatten(translations: object, prefix = ''): Record<string, unknown> {
  return Object.entries(translations).reduce<Record<string, unknown>>((flat, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value !== null && typeof value === 'object' ? { ...flat, ...flatten(value, path) } : { ...flat, [path]: value };
  }, {});
}

describe('translation file', () => {
  it('has no empty or non-text values', () => {
    for (const [key, value] of Object.entries(flatten(de))) {
      expect(typeof value === 'string' && value.trim() !== '', key).toBe(true);
    }
  });
});
