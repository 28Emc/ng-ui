export type DateFormatPattern = 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy/MM/dd';

export function pad(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

export function toIso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseIso(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDisplay(
  value: string | null,
  pattern: DateFormatPattern = 'dd/MM/yyyy',
): string {
  if (!value) {
    return '';
  }
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return '';
  const dd = pad(d);
  const mm = pad(m);
  const yyyy = `${y}`;
  if (pattern === 'MM/dd/yyyy') return `${mm}/${dd}/${yyyy}`;
  if (pattern === 'yyyy/MM/dd') return `${yyyy}/${mm}/${dd}`;
  return `${dd}/${mm}/${yyyy}`;
}

export function parseText(text: string, pattern: DateFormatPattern = 'dd/MM/yyyy'): string | null {
  const trimmed = text.trim().replace(/[/-]+$/, '');
  if (!trimmed) return null;

  // Always detect ISO format yyyy-MM-dd first, regardless of locale pattern
  const isoMatch = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(trimmed);
  if (isoMatch) {
    const [, y, m, d] = isoMatch.map(Number);
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
      return null;
    }
    return toIso(date);
  }

  let day: number | undefined;
  let month: number | undefined;
  let year: number | undefined;

  const parts = trimmed.split(/[/-]/).map((p) => p.trim());

  if (parts.length === 3) {
    if (pattern === 'yyyy/MM/dd') {
      year = Number(parts[0]);
      month = Number(parts[1]);
      day = Number(parts[2]);
    } else if (pattern === 'MM/dd/yyyy') {
      month = Number(parts[0]);
      day = Number(parts[1]);
      year = Number(parts[2]);
    } else {
      day = Number(parts[0]);
      month = Number(parts[1]);
      year = Number(parts[2]);
    }
  } else if (parts.length === 2) {
    if (pattern === 'MM/dd/yyyy') {
      month = Number(parts[0]);
      day = Number(parts[1]);
    } else {
      day = Number(parts[0]);
      month = Number(parts[1]);
    }
    year = new Date().getFullYear();
  }

  if (day === undefined || month === undefined || year === undefined) {
    return null;
  }

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return null;
  }

  // Reject years that are 3 digits (100-999) — invalid historical/ambiguous
  const rawYearPart =
    parts.length === 3
      ? pattern === 'dd/MM/yyyy' || pattern === 'MM/dd/yyyy'
        ? parts[2]
        : parts[0]
      : null;
  if (rawYearPart !== null && rawYearPart.length === 3) {
    return null;
  }

  // Expand 2-digit year shortcut
  if (year < 100 && year >= 0) {
    const currentYear = new Date().getFullYear();
    const currentCentury = Math.floor(currentYear / 100) * 100;
    year = currentCentury + year;
    if (year > currentYear + 20) {
      year -= 100;
    }
  }

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return toIso(date);
}

export function buildMonthCells(view: { year: number; month: number }): Date[] {
  const firstOfMonth = new Date(view.year, view.month, 1);
  const start = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(view.year, view.month, 1 - start);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
  }
  return cells;
}

export function shiftMonth(view: { year: number; month: number }, delta: number) {
  const next = new Date(view.year, view.month + delta, 1);
  return { year: next.getFullYear(), month: next.getMonth() };
}
