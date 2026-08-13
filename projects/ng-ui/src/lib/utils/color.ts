export function parseHexColor(color: string): [number, number, number] | null {
  const trimmed = color.trim();
  const match = /^#?([0-9a-f]{6})$/i.exec(trimmed);
  if (!match) return null;
  const hex = match[1];
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

export function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (value: number): number => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastWithWhite(rgb: [number, number, number]): number {
  return (1.05 / (relativeLuminance(rgb) + 0.05));
}

export function ensureContrast(
  color: string,
  target = 4.5,
  maxIterations = 40,
): string {
  const rgb = parseHexColor(color);
  if (!rgb) return color;
  if (contrastWithWhite(rgb) >= target) return color;

  let [r, g, b] = rgb;
  let contrast = contrastWithWhite([r, g, b]);
  let iterations = 0;
  while (contrast < target && iterations < maxIterations) {
    r = Math.round(r * 0.9);
    g = Math.round(g * 0.9);
    b = Math.round(b * 0.9);
    contrast = contrastWithWhite([r, g, b]);
    iterations++;
  }
  const toHex = (value: number): string => value.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
