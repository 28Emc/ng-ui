import {
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
  booleanAttribute,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { filter } from 'rxjs';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  LucideCalendarRange,
  LucideChevronDown,
  LucideChevronLeft,
  LucideChevronRight,
} from '@lucide/angular';
import { cn } from '../utils/cn';
import { LocaleService, UiStringKey } from '../locale/locale.service';
import { FIELD_CLASSES, FIELD_INVALID_CLASSES } from '../input/field-base';
import {
  buildMonthCells,
  formatDisplay,
  isSameDay,
  parseIso,
  parseText,
  shiftMonth,
  toIso,
  type DateFormatPattern,
} from '../datepicker/date-utils';

export type DateRangeValue = [string, string] | null;

type Side = 'start' | 'end';
type Mode = 'day' | 'month' | 'year';

function splitRange(text: string): [string, string] | [] {
  const parts = text.split(/\s+a\s+|[–—]|\s+-\s+/i);
  if (parts.length !== 2) {
    return [];
  }
  return [parts[0].trim(), parts[1].trim()];
}

function maskRange(digits: string, pattern: DateFormatPattern, isDeleting: boolean): string {
  const yearFirst = pattern === 'yyyy/MM/dd';
  let masked = '';
  if (yearFirst) {
    if (digits.length > 0) masked += digits.slice(0, 4);
    if (digits.length === 4 && !isDeleting) masked += '/';
    if (digits.length > 4) masked += '/' + digits.slice(4, 6);
    if (digits.length === 6 && !isDeleting) masked += '/';
    if (digits.length > 6) masked += '/' + digits.slice(6, 8);
    if (digits.length === 8 && !isDeleting) masked += ' – ';
    if (digits.length > 8) masked += ' – ' + digits.slice(8, 12);
    if (digits.length === 12 && !isDeleting) masked += '/';
    if (digits.length > 12) masked += '/' + digits.slice(12, 14);
    if (digits.length === 14 && !isDeleting) masked += '/';
    if (digits.length > 14) masked += '/' + digits.slice(14, 16);
  } else {
    if (digits.length > 0) masked += digits.slice(0, 2);
    if (digits.length === 2 && !isDeleting) masked += '/';
    if (digits.length > 2) masked += '/' + digits.slice(2, 4);
    if (digits.length === 4 && !isDeleting) masked += '/';
    if (digits.length > 4) masked += '/' + digits.slice(4, 8);
    if (digits.length === 8 && !isDeleting) masked += ' – ';
    if (digits.length > 8) masked += ' – ' + digits.slice(8, 10);
    if (digits.length === 10 && !isDeleting) masked += '/';
    if (digits.length > 10) masked += '/' + digits.slice(10, 12);
    if (digits.length === 12 && !isDeleting) masked += '/';
    if (digits.length > 12) masked += '/' + digits.slice(12, 16);
  }
  return masked;
}

@Component({
  selector: 'ui-daterangepicker',
  standalone: true,
  imports: [LucideCalendarRange, LucideChevronDown, LucideChevronLeft, LucideChevronRight],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangePickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative">
      <div [class]="fieldClasses()">
        <svg lucideCalendarRange [size]="16" [strokeWidth]="2" class="shrink-0 text-muted" />
        <input
          #triggerEl
          type="text"
          inputmode="numeric"
          autocomplete="off"
          [attr.name]="name() || null"
          [placeholder]="effectivePlaceholder()"
          [value]="displayText()"
          [disabled]="disabled() || formDisabled()"
          [attr.aria-label]="t('selectRange')"
          [attr.aria-expanded]="isOpen()"
          (input)="onInput($event)"
          (focus)="open()"
          (keydown)="onTriggerKeydown($event)"
          (blur)="onBlur()"
          class="w-full min-w-0 flex-1 bg-transparent text-sm text-fg focus-visible:outline-none placeholder:text-muted"
        />
        <button
          type="button"
          [disabled]="disabled() || formDisabled()"
          [attr.aria-label]="t('toggleRange')"
          (click)="toggle()"
          class="-mr-1 shrink-0 rounded-md p-1 text-muted transition-colors duration-150 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
        >
          <svg lucideChevronDown [size]="16" [strokeWidth]="2" [class]="chevronClasses()" />
        </button>
      </div>
    </div>

    <ng-template #panel>
      <div
        class="w-full rounded-xl border border-default bg-surface p-4 shadow-pop animate-scale-in"
      >
        <div class="flex gap-4">
          <div class="flex-1">
            <div class="mb-3 flex items-center justify-between">
              <button
                type="button"
                (mousedown)="$event.preventDefault()"
                (click)="shiftView('start', -1)"
                class="p-1 text-muted hover:text-fg cursor-pointer"
                [attr.aria-label]="t('prevMonth')"
              >
                <svg lucideChevronLeft [size]="16" aria-hidden="true" />
              </button>
              <button
                type="button"
                (mousedown)="$event.preventDefault()"
                (click)="toggleMode('start')"
                class="text-sm font-semibold text-fg cursor-pointer"
              >
                {{ modeLabel('start') }}
              </button>
              <button
                type="button"
                (mousedown)="$event.preventDefault()"
                (click)="shiftView('start', 1)"
                class="p-1 text-muted hover:text-fg cursor-pointer"
                [attr.aria-label]="t('nextMonth')"
              >
                <svg lucideChevronRight [size]="16" aria-hidden="true" />
              </button>
            </div>
            @if (startMode() === 'day') {
              <div class="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted">
                @for (label of weekdayLabels(); track $index) {
                  <span class="py-1">{{ label }}</span>
                }
              </div>
              <div class="mt-1 grid grid-cols-7 gap-1" [attr.data-calendar]="'start'">
                @for (cell of startCells(); track $index) {
                  <button
                    type="button"
                    [disabled]="isDisabled(cell)"
                    [class]="dayClasses(cell, startView())"
                    (mousedown)="$event.preventDefault()"
                    (mouseenter)="hoverCell.set(cell)"
                    (mouseleave)="clearHover()"
                    (click)="selectDay(cell)"
                  >
                    {{ cell.getDate() }}
                  </button>
                }
              </div>
            } @else if (startMode() === 'month') {
              <div class="grid grid-cols-3 gap-2">
                @for (m of monthNames(); track $index) {
                  <button
                    type="button"
                    (mousedown)="$event.preventDefault()"
                    class="rounded-lg p-2 text-sm hover:bg-surface-2"
                    (click)="selectMonth('start', $index)"
                  >
                    {{ m.substring(0, 3) }}
                  </button>
                }
              </div>
            } @else {
              <div class="grid grid-cols-3 gap-2">
                @for (y of startYears(); track y) {
                  <button
                    type="button"
                    (mousedown)="$event.preventDefault()"
                    class="rounded-lg p-2 text-sm hover:bg-surface-2"
                    (click)="selectYear('start', y)"
                  >
                    {{ y }}
                  </button>
                }
              </div>
            }
          </div>

          <div class="flex-1">
            <div class="mb-3 flex items-center justify-between">
              <button
                type="button"
                (mousedown)="$event.preventDefault()"
                (click)="shiftView('end', -1)"
                class="p-1 text-muted hover:text-fg cursor-pointer"
                [attr.aria-label]="t('prevMonth')"
              >
                <svg lucideChevronLeft [size]="16" aria-hidden="true" />
              </button>
              <button
                type="button"
                (mousedown)="$event.preventDefault()"
                (click)="toggleMode('end')"
                class="text-sm font-semibold text-fg cursor-pointer"
              >
                {{ modeLabel('end') }}
              </button>
              <button
                type="button"
                (mousedown)="$event.preventDefault()"
                (click)="shiftView('end', 1)"
                class="p-1 text-muted hover:text-fg cursor-pointer"
                [attr.aria-label]="t('nextMonth')"
              >
                <svg lucideChevronRight [size]="16" aria-hidden="true" />
              </button>
            </div>
            @if (endMode() === 'day') {
              <div class="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted">
                @for (label of weekdayLabels(); track $index) {
                  <span class="py-1">{{ label }}</span>
                }
              </div>
              <div class="mt-1 grid grid-cols-7 gap-1" [attr.data-calendar]="'end'">
                @for (cell of endCells(); track $index) {
                  <button
                    type="button"
                    [disabled]="isDisabled(cell)"
                    [class]="dayClasses(cell, endView())"
                    (mousedown)="$event.preventDefault()"
                    (mouseenter)="hoverCell.set(cell)"
                    (mouseleave)="clearHover()"
                    (click)="selectDay(cell)"
                  >
                    {{ cell.getDate() }}
                  </button>
                }
              </div>
            } @else if (endMode() === 'month') {
              <div class="grid grid-cols-3 gap-2">
                @for (m of monthNames(); track $index) {
                  <button
                    type="button"
                    (mousedown)="$event.preventDefault()"
                    class="rounded-lg p-2 text-sm hover:bg-surface-2"
                    (click)="selectMonth('end', $index)"
                  >
                    {{ m.substring(0, 3) }}
                  </button>
                }
              </div>
            } @else {
              <div class="grid grid-cols-3 gap-2">
                @for (y of endYears(); track y) {
                  <button
                    type="button"
                    (mousedown)="$event.preventDefault()"
                    class="rounded-lg p-2 text-sm hover:bg-surface-2"
                    (click)="selectYear('end', y)"
                  >
                    {{ y }}
                  </button>
                }
              </div>
            }
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between border-t border-default pt-3">
          <span class="text-xs text-muted">{{ displayText() || t('noRange') }}</span>
          <button
            type="button"
            (mousedown)="$event.preventDefault()"
            (click)="clear()"
            class="text-xs font-medium text-brand-600 transition-colors duration-150 hover:text-brand-700 dark:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 rounded-md px-2 py-1"
          >
            {{ t('clear') }}
          </button>
        </div>
      </div>
    </ng-template>
  `,
})
export class DateRangePickerComponent implements ControlValueAccessor {
  readonly value = model<DateRangeValue>(null);
  readonly placeholder = input('');
  readonly locale = input<string | null>();
  readonly format = input<string>();
  readonly min = input<string>();
  readonly max = input<string>();
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly name = input<string>();

  protected readonly isOpen = signal(false);
  protected readonly formDisabled = signal(false);
  protected readonly editing = signal(false);
  protected readonly query = signal('');
  protected readonly start = signal<string | null>(null);
  protected readonly end = signal<string | null>(null);
  protected readonly startView = signal<{ year: number; month: number }>({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });
  protected readonly endView = signal<{ year: number; month: number }>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  protected readonly startMode = signal<Mode>('day');
  protected readonly endMode = signal<Mode>('day');
  protected readonly startYearPageStart = signal(0);
  protected readonly endYearPageStart = signal(0);
  protected readonly hoverCell = signal<Date | null>(null);

  private readonly localeService = inject(LocaleService);
  private readonly triggerEl = viewChild.required<ElementRef<HTMLInputElement>>('triggerEl');
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private overlayRef: OverlayRef | null = null;
  private closing = false;
  private _onChange: (value: DateRangeValue) => void = () => {};

  protected onTouched: () => void = () => {};

  protected readonly effectiveLocale = computed(
    () => this.locale() ?? this.localeService.defaultLocale,
  );

  protected readonly weekdayLabels = computed(() =>
    this.localeService.weekdayLabels(this.effectiveLocale()),
  );
  protected readonly monthNames = computed(() =>
    this.localeService.monthNames(this.effectiveLocale()),
  );

  protected readonly datePattern = computed<DateFormatPattern>(() =>
    this.localeService.datePattern(this.effectiveLocale(), this.format()),
  );

  protected readonly effectivePlaceholder = computed(() => {
    if (this.placeholder()) {
      return this.placeholder();
    }
    const pattern = this.datePattern().toLowerCase();
    return `${pattern} – ${pattern}`;
  });

  protected readonly displayText = computed(() => {
    if (this.editing()) {
      return this.query();
    }
    const start = this.start();
    const end = this.end();
    const pattern = this.datePattern();
    if (start && end) {
      return `${formatDisplay(start, pattern)} – ${formatDisplay(end, pattern)}`;
    }
    if (start) {
      return `${formatDisplay(start, pattern)} – …`;
    }
    return '';
  });

  protected readonly startCells = computed(() => buildMonthCells(this.startView()));
  protected readonly endCells = computed(() => buildMonthCells(this.endView()));

  protected readonly startYears = computed(() => {
    const start = this.startYearPageStart();
    return Array.from({ length: 12 }, (_, i) => start + i);
  });
  protected readonly endYears = computed(() => {
    const start = this.endYearPageStart();
    return Array.from({ length: 12 }, (_, i) => start + i);
  });

  protected readonly fieldClasses = computed(() =>
    cn(FIELD_CLASSES, 'flex items-center gap-2', this.invalid() ? FIELD_INVALID_CLASSES : ''),
  );

  protected readonly chevronClasses = computed(() =>
    cn('transition-transform duration-150', this.isOpen() ? 'rotate-180' : ''),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.close());
  }

  writeValue(value: DateRangeValue): void {
    this.value.set(value ?? null);
    if (value) {
      this.start.set(value[0]);
      this.end.set(value[1]);
    } else {
      this.start.set(null);
      this.end.set(null);
    }
    this.editing.set(false);
    this.query.set('');
  }

  registerOnChange(fn: (value: DateRangeValue) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected isCurrentMonth(cell: Date, view: { year: number; month: number }): boolean {
    return cell.getFullYear() === view.year && cell.getMonth() === view.month;
  }

  protected isToday(cell: Date): boolean {
    return isSameDay(cell, new Date());
  }

  protected isDisabled(cell: Date): boolean {
    const min = this.min();
    if (min && cell < parseIso(min)) {
      return true;
    }
    const max = this.max();
    if (max && cell > parseIso(max)) {
      return true;
    }
    return false;
  }

  protected dayClasses(cell: Date, view: { year: number; month: number }): string {
    const iso = toIso(cell);
    const start = this.start();
    const end = this.end();
    const isStart = start === iso;
    const isEnd = end === iso;
    const inRange = !!(start && end && iso > start && iso < end);
    const hover = this.hoverCell();
    const hoverRange = !!(start && !end && hover && iso > start && iso < toIso(hover));
    return cn(
      'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
      isStart || isEnd
        ? 'bg-brand-500 font-medium text-white'
        : inRange || hoverRange
          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
          : this.isToday(cell)
            ? 'font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-500/10'
            : 'text-fg hover:bg-surface-2',
      !isStart && !isEnd && !this.isCurrentMonth(cell, view) ? 'text-muted/60' : '',
      this.isDisabled(cell) ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
    );
  }

  protected selectDay(cell: Date): void {
    if (this.isDisabled(cell)) {
      return;
    }
    const iso = toIso(cell);
    const start = this.start();
    const end = this.end();
    if (!start || (start && end)) {
      this.start.set(iso);
      this.end.set(null);
      this.ensureEndAfterStart();
      return;
    }
    if (iso < start) {
      this.start.set(iso);
      this.end.set(null);
      this.ensureEndAfterStart();
      return;
    }
    this.end.set(iso);
    this.setValue([start, iso]);
    this.close();
  }

  protected clear(): void {
    this.start.set(null);
    this.end.set(null);
    this.setValue(null);
    this.editing.set(false);
    this.query.set('');
  }

  protected clearHover(): void {
    this.hoverCell.set(null);
  }

  protected toggleMode(side: Side): void {
    const { view, mode, page } = this.sideState(side);
    if (mode() === 'day') {
      page.set(Math.floor(view().year / 12) * 12);
      mode.set('year');
    } else {
      mode.set('day');
    }
  }

  protected modeLabel(side: Side): string {
    const { view, mode } = this.sideState(side);
    if (mode() === 'day') {
      return `${this.monthNames()[view().month]} ${view().year}`;
    }
    if (mode() === 'month') {
      return `${view().year}`;
    }
    return this.t('years');
  }

  protected t(key: UiStringKey): string {
    return this.localeService.translate(key, this.effectiveLocale());
  }

  protected shiftView(side: Side, delta: number): void {
    const { view, mode, page } = this.sideState(side);
    if (mode() === 'day') {
      view.update((v) => shiftMonth(v, delta));
    } else if (mode() === 'month') {
      view.update(({ year, month }) => {
        const next = new Date(year + delta, month, 1);
        return { year: next.getFullYear(), month: next.getMonth() };
      });
    } else {
      page.update((v) => v + delta * 12);
    }
    if (side === 'start') {
      this.ensureEndAfterStartView();
    }
  }

  protected selectYear(side: Side, year: number): void {
    const { view, mode } = this.sideState(side);
    view.update((v) => ({ year, month: v.month }));
    mode.set('month');
    if (side === 'start') {
      this.ensureEndAfterStartView();
    }
  }

  protected selectMonth(side: Side, month: number): void {
    const { view, mode } = this.sideState(side);
    view.update((v) => ({ year: v.year, month }));
    mode.set('day');
    if (side === 'start') {
      this.ensureEndAfterStartView();
    }
  }

  protected onInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const raw = inputEl.value;
    const inputEvent = event as InputEvent;
    const isDeleting =
      inputEvent.inputType === 'deleteContentBackward' ||
      inputEvent.inputType === 'deleteContentForward';

    if (/^\d{4}[-/]/.test(raw)) {
      this.query.set(raw);
      this.editing.set(true);
      return;
    }

    const digits = raw.replace(/\D/g, '').slice(0, 16);
    const pattern = this.datePattern();
    const masked = maskRange(digits, pattern, isDeleting);

    if (inputEl.value !== masked) {
      inputEl.value = masked;
    }
    this.query.set(masked);
    this.editing.set(true);

    const firstText = masked.slice(0, 10);
    const separatorIndex = masked.indexOf(' – ');
    const secondText = separatorIndex !== -1 ? masked.slice(separatorIndex + 3) : '';
    const firstIso = firstText.length === 10 ? parseText(firstText, pattern) : null;
    const secondIso =
      separatorIndex !== -1 && secondText.length === 10 ? parseText(secondText, pattern) : null;

    // Auto-select each valid date in the overlay as soon as it is complete
    if (firstIso && !this.isOutsideRange(firstIso)) {
      this.start.set(firstIso);
      this.startView.set(this.isoView(firstIso));
      if (!secondIso) {
        this.end.set(null);
      }
      this.ensureEndAfterStart();
    }
    if (secondIso && !this.isOutsideRange(secondIso)) {
      this.end.set(secondIso);
      this.endView.set(this.isoView(secondIso));
    }

    if (
      firstIso &&
      secondIso &&
      firstIso <= secondIso &&
      !this.isOutsideRange(firstIso) &&
      !this.isOutsideRange(secondIso)
    ) {
      this.setValue([firstIso, secondIso]);
      this.editing.set(false);
      this.query.set('');
      inputEl.value = `${formatDisplay(firstIso, pattern)} – ${formatDisplay(secondIso, pattern)}`;
    }
  }

  protected onBlur(): void {
    this.editing.set(false);
    if (this.query().trim()) {
      this.commitQuery();
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.open();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.editing()) {
        this.commitQuery();
      }
      this.close();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  protected toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  private sideState(side: Side): {
    view: ReturnType<typeof signal<{ year: number; month: number }>>;
    mode: ReturnType<typeof signal<Mode>>;
    page: ReturnType<typeof signal<number>>;
  } {
    return {
      view: side === 'start' ? this.startView : this.endView,
      mode: side === 'start' ? this.startMode : this.endMode,
      page: side === 'start' ? this.startYearPageStart : this.endYearPageStart,
    };
  }

  private commitQuery(): void {
    const text = this.query().trim();
    if (!text) {
      this.clear();
      return;
    }
    const parts = splitRange(text);
    if (parts.length !== 2) {
      this.revertToValue();
      return;
    }
    const pattern = this.datePattern();
    const startIso = parseText(parts[0], pattern);
    const endIso = parseText(parts[1], pattern);
    if (!startIso || !endIso) {
      this.revertToValue();
      return;
    }
    if (startIso > endIso) {
      this.revertToValue();
      return;
    }
    if (this.isOutsideRange(startIso) || this.isOutsideRange(endIso)) {
      this.revertToValue();
      return;
    }
    this.start.set(startIso);
    this.end.set(endIso);
    this.setValue([startIso, endIso]);
    this.editing.set(false);
    this.query.set('');
  }

  private setValue(range: DateRangeValue): void {
    this.value.set(range);
    this._onChange(range);
    this.onTouched();
  }

  private isOutsideRange(iso: string): boolean {
    const date = parseIso(iso);
    const min = this.min();
    if (min && date < parseIso(min)) {
      return true;
    }
    const max = this.max();
    if (max && date > parseIso(max)) {
      return true;
    }
    return false;
  }

  private isoView(iso: string): { year: number; month: number } {
    const date = parseIso(iso);
    return { year: date.getFullYear(), month: date.getMonth() };
  }

  private ensureEndAfterStart(): void {
    const start = this.start();
    if (!start) {
      return;
    }
    const date = parseIso(start);
    const endView = this.endView();
    if (
      date.getFullYear() > endView.year ||
      (date.getFullYear() === endView.year && date.getMonth() > endView.month)
    ) {
      this.endView.set({ year: date.getFullYear(), month: date.getMonth() });
    }
  }

  private ensureEndAfterStartView(): void {
    const startView = this.startView();
    const endView = this.endView();
    if (
      endView.year < startView.year ||
      (endView.year === startView.year && endView.month < startView.month)
    ) {
      this.endView.set({ ...startView });
    }
  }

  private revertToValue(): void {
    const value = this.value();
    if (value) {
      this.start.set(value[0]);
      this.end.set(value[1]);
    } else {
      this.start.set(null);
      this.end.set(null);
    }
    this.query.set('');
  }

  protected open(): void {
    if (this.overlayRef) {
      return;
    }
    const now = new Date();
    const start = this.start();
    const end = this.end();
    if (start) {
      const date = parseIso(start);
      this.startView.set({ year: date.getFullYear(), month: date.getMonth() });
    } else {
      this.startView.set({ year: now.getFullYear(), month: now.getMonth() });
    }
    if (end) {
      const date = parseIso(end);
      this.endView.set({ year: date.getFullYear(), month: date.getMonth() });
    } else {
      this.endView.set(shiftMonth(this.startView(), 1));
    }
    this.startMode.set('day');
    this.endMode.set('day');
    this.overlayRef = this.overlay.create({
      width: 640,
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.triggerEl())
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
            offsetY: 8,
          },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });
    this.overlayRef.outsidePointerEvents().subscribe((event) => {
      const clickTarget = event.target as Node;
      const insideOverlay = this.overlayRef?.overlayElement?.contains(clickTarget);
      const insideTrigger = this.triggerEl?.()?.nativeElement?.contains(clickTarget);
      if (
        !insideOverlay &&
        !insideTrigger &&
        !this.elementRef.nativeElement.contains(clickTarget)
      ) {
        this.close();
      }
    });
    this.overlayRef
      .keydownEvents()
      .pipe(filter((event) => event.key === 'Escape'))
      .subscribe(() => this.close());
    this.overlayRef.detachments().subscribe(() => this.onOverlayDetached());
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate(), this.viewContainerRef));
    this.isOpen.set(true);
  }

  protected close(): void {
    if (this.closing) return;
    this.closing = true;
    const ref = this.overlayRef;
    this.overlayRef = null;
    if (ref) {
      ref.detach();
      ref.dispose();
    }
    this.isOpen.set(false);
    this.revertToValue();
    this.editing.set(false);
    this.closing = false;
  }

  private onOverlayDetached(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.revertToValue();
      this.editing.set(false);
      if (this.overlayRef) {
        this.overlayRef.dispose();
        this.overlayRef = null;
      }
    }
  }
}
