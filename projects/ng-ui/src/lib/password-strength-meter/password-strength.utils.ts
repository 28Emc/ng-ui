export interface PasswordChecks {
  readonly length: boolean;
  readonly lowercase: boolean;
  readonly uppercase: boolean;
  readonly digit: boolean;
  readonly symbol: boolean;
}

export type PasswordStrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrength {
  readonly checks: PasswordChecks;
  readonly score: number;
  readonly level: PasswordStrengthLevel;
}

export const PASSWORD_CRITERIA = [
  { key: 'length', label: '8 caracteres o más' },
  { key: 'lowercase', label: 'Una letra minúscula' },
  { key: 'uppercase', label: 'Una letra mayúscula' },
  { key: 'digit', label: 'Un número' },
  { key: 'symbol', label: 'Un símbolo' },
] as const satisfies readonly { key: keyof PasswordChecks; label: string }[];

export const PASSWORD_LEVEL_LABELS: Record<PasswordStrengthLevel, string> = {
  empty: 'Sin contraseña',
  weak: 'Débil',
  fair: 'Media',
  good: 'Buena',
  strong: 'Fuerte',
};

export const PASSWORD_SEGMENTS = 5;

export function evaluatePassword(password: string): PasswordStrength {
  const checks: PasswordChecks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    digit: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
  const score = PASSWORD_CRITERIA.filter((criterion) => checks[criterion.key]).length;
  const level: PasswordStrengthLevel =
    password.length === 0
      ? 'empty'
      : score <= 1
        ? 'weak'
        : score <= 3
          ? 'fair'
          : score === 4
            ? 'good'
            : 'strong';
  return { checks, score, level };
}
