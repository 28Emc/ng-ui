import { parseHexColor, relativeLuminance, contrastWithWhite, ensureContrast } from './color';

describe('color utils', () => {
  it('parses hex colors', () => {
    expect(parseHexColor('#0b7064')).toEqual([11, 112, 100]);
    expect(parseHexColor('0b7064')).toEqual([11, 112, 100]);
    expect(parseHexColor('not-a-color')).toBeNull();
  });

  it('computes relative luminance', () => {
    expect(relativeLuminance([0, 0, 0])).toBe(0);
    expect(relativeLuminance([255, 255, 255])).toBe(1);
  });

  it('computes contrast against white', () => {
    expect(contrastWithWhite([0, 0, 0])).toBeCloseTo(21, 1);
    expect(contrastWithWhite([255, 255, 255])).toBeCloseTo(1, 1);
  });

  it('darkens light colors until white text passes 4.5:1', () => {
    const result = ensureContrast('#6f86c9');
    expect(parseHexColor(result)).not.toBeNull();
    expect(contrastWithWhite(parseHexColor(result)!)).toBeGreaterThanOrEqual(4.5);
  });

  it('leaves accessible colors unchanged', () => {
    expect(ensureContrast('#0b7064')).toBe('#0b7064');
    expect(ensureContrast('#7c3aed')).toBe('#7c3aed');
  });

  it('returns non-hex colors untouched', () => {
    expect(ensureContrast('rgb(111, 134, 201)')).toBe('rgb(111, 134, 201)');
  });
});
