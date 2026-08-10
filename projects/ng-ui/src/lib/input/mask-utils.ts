export type MaskChar = string;

export function extractMaskDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatMask(raw: string, mask: string, maskChar = '#'): string {
  if (!mask) return raw;
  let masked = '';
  let lastFilled = -1;
  let rawIndex = 0;
  for (const ch of mask) {
    if (ch === maskChar) {
      if (rawIndex < raw.length) {
        masked += raw[rawIndex++];
        lastFilled = masked.length - 1;
      } else {
        break;
      }
    } else {
      masked += ch;
    }
  }
  return lastFilled >= 0 ? masked.slice(0, lastFilled + 1) : '';
}

export function placeholderFromMask(mask: string, maskChar = '#'): string {
  return mask.split(maskChar).join('_');
}

export function cursorAtRawCount(masked: string, rawCount: number): number {
  if (rawCount <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < masked.length; i++) {
    if (/\d/.test(masked[i])) {
      seen++;
      if (seen === rawCount) return i + 1;
    }
  }
  return masked.length;
}
