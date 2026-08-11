import { Injectable, LOCALE_ID, inject } from '@angular/core';
import type { DateFormatPattern } from '../datepicker/date-utils';

export type UiStringKey =
  | 'selectDate'
  | 'prevMonth'
  | 'nextMonth'
  | 'today'
  | 'noDate'
  | 'selectRange'
  | 'toggleRange'
  | 'noRange'
  | 'clear'
  | 'years'
  | 'close'
  | 'skipToContent';

const DEFAULT_LOCALE = 'es-PE';
const MONDAY_2026 = new Date(2026, 7, 3);

const FALLBACK_MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const FALLBACK_WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const UI_STRINGS: Record<string, Partial<Record<UiStringKey, string>>> = {
  es: {
    selectDate: 'Seleccionar fecha',
    prevMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
    today: 'Hoy',
    noDate: 'Sin fecha',
    selectRange: 'Seleccionar rango de fechas',
    toggleRange: 'Alternar rango de fechas',
    noRange: 'Sin rango',
    clear: 'Limpiar',
    years: 'Años',
    close: 'Cerrar',
    skipToContent: 'Saltar al contenido',
  },
  en: {
    selectDate: 'Select date',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    today: 'Today',
    noDate: 'No date',
    selectRange: 'Select date range',
    toggleRange: 'Toggle date range',
    noRange: 'No range',
    clear: 'Clear',
    years: 'Years',
    close: 'Close',
    skipToContent: 'Skip to content',
  },
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function isSpanish(locale: string): boolean {
  return locale.split('-')[0].toLowerCase() === 'es';
}

@Injectable({ providedIn: 'root' })
export class LocaleService {
  readonly defaultLocale = inject(LOCALE_ID, { optional: true }) ?? DEFAULT_LOCALE;

  private readonly patternCache = new Map<string, DateFormatPattern>();
  private readonly monthCache = new Map<string, string[]>();
  private readonly weekdayCache = new Map<string, string[]>();

  datePattern(locale: string, customFormat?: string): DateFormatPattern {
    if (customFormat) {
      const lower = customFormat.toLowerCase();
      if (lower.startsWith('m')) return 'MM/dd/yyyy';
      if (lower.startsWith('y')) return 'yyyy/MM/dd';
      if (lower.startsWith('d')) return 'dd/MM/yyyy';
    }
    let pattern = this.patternCache.get(locale);
    if (pattern) {
      return pattern;
    }
    try {
      new Intl.Locale(locale);
      const formatter = new Intl.DateTimeFormat(locale);
      const order = formatter
        .formatToParts(new Date(2026, 11, 31))
        .filter((p) => p.type === 'day' || p.type === 'month' || p.type === 'year')
        .map((p) => p.type);
      if (order[0] === 'month' && order[1] === 'day') {
        pattern = 'MM/dd/yyyy';
      } else if (order[0] === 'year') {
        pattern = 'yyyy/MM/dd';
      } else {
        pattern = 'dd/MM/yyyy';
      }
    } catch {
      pattern = 'dd/MM/yyyy';
    }
    this.patternCache.set(locale, pattern);
    return pattern;
  }

  monthNames(locale: string): string[] {
    if (isSpanish(locale)) {
      return FALLBACK_MONTH_NAMES;
    }
    let names = this.monthCache.get(locale);
    if (names) {
      return names;
    }
    try {
      const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
      names = Array.from({ length: 12 }, (_, i) =>
        capitalize(formatter.format(new Date(2026, i, 15))),
      );
    } catch {
      names = FALLBACK_MONTH_NAMES;
    }
    this.monthCache.set(locale, names);
    return names;
  }

  weekdayLabels(locale: string): string[] {
    if (isSpanish(locale)) {
      return FALLBACK_WEEKDAY_LABELS;
    }
    let labels = this.weekdayCache.get(locale);
    if (labels) {
      return labels;
    }
    try {
      const formatter = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
      labels = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(MONDAY_2026);
        date.setDate(MONDAY_2026.getDate() + i);
        return formatter.format(date);
      });
    } catch {
      labels = FALLBACK_WEEKDAY_LABELS;
    }
    this.weekdayCache.set(locale, labels);
    return labels;
  }

  translate(key: UiStringKey, locale?: string): string {
    const language = (locale ?? this.defaultLocale).split('-')[0].toLowerCase();
    return UI_STRINGS[language]?.[key] ?? UI_STRINGS['es']![key]!;
  }
}
