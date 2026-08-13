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
import { LucideCalendarDays, LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
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
} from './date-utils';

export type DatePickerValue = string | null;

let datepickerPanelSeq = 0;

@Component({
  selector: 'ui-datepicker',
  standalone: true,
  imports: [LucideCalendarDays, LucideChevronLeft, LucideChevronRight],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative">
      <div [class]="fieldClasses()">
        <svg lucideCalendarDays [size]="16" [strokeWidth]="2" class="shrink-0 text-muted" />
        <input
          #triggerEl
          type="text"
          inputmode="numeric"
          autocomplete="off"
          [attr.name]="name() || null"
          [placeholder]="effectivePlaceholder()"
          [value]="displayText()"
          [disabled]="disabled() || formDisabled()"
          [attr.aria-label]="t('selectDate')"
          role="combobox"
          aria-haspopup="dialog"
          [attr.aria-expanded]="isOpen()"
          [attr.aria-controls]="panelId"
          (input)="onInput($event)"
          (focus)="open()"
          (keydown)="onTriggerKeydown($event)"
          (blur)="onBlur()"
          class="w-full min-w-0 flex-1 bg-transparent text-sm text-fg focus-visible:outline-none placeholder:text-muted"
        />
      </div>
    </div>

    <ng-template #panel>
      <div
        [id]="panelId"
        class="w-72 rounded-xl border border-default bg-surface p-4 shadow-pop animate-scale-in"
      >
        <div class="mb-3 flex items-center justify-between">
          <button
            type="button"
            (mousedown)="$event.preventDefault()"
            (click)="shiftView(-1)"
            class="p-1 text-muted hover:text-fg cursor-pointer"
            [disabled]="disableOverlayButtons()"
            [attr.aria-label]="t('prevMonth')"
          >
            <svg lucideChevronLeft [size]="16" aria-hidden="true" />
          </button>
          <button
            type="button"
            (mousedown)="$event.preventDefault()"
            (click)="toggleMode()"
            class="text-sm font-semibold text-fg cursor-pointer"
            [disabled]="disableOverlayButtons()"
          >
            {{ modeLabel() }}
          </button>
          <button
            type="button"
            (mousedown)="$event.preventDefault()"
            (click)="shiftView(1)"
            class="p-1 text-muted hover:text-fg cursor-pointer"
            [disabled]="disableOverlayButtons()"
            [attr.aria-label]="t('nextMonth')"
          >
            <svg lucideChevronRight [size]="16" aria-hidden="true" />
          </button>
        </div>

        @if (mode() === 'day') {
          <div class="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted">
            @for (label of weekdayLabels(); track $index) {
              <span class="py-1">{{ label }}</span>
            }
          </div>
          <div class="mt-1 grid grid-cols-7 gap-1">
            @for (cell of cells(); track cellKey($index)) {
              <button
                type="button"
                (mousedown)="$event.preventDefault()"
                [disabled]="isDisabled(cell)"
                [class]="dayClasses(cell)"
                (click)="selectDay(cell)"
              >
                {{ cell.getDate() }}
              </button>
            }
          </div>
        } @else if (mode() === 'month') {
          <div class="grid grid-cols-3 gap-2">
            @for (m of monthNames(); track $index) {
              <button
                type="button"
                (mousedown)="$event.preventDefault()"
                class="rounded-lg p-2 text-sm hover:bg-surface-2"
                (click)="selectMonth($index)"
              >
                {{ m.substring(0, 3) }}
              </button>
            }
          </div>
        } @else {
          <div class="grid grid-cols-3 gap-2">
            @for (y of years(); track y) {
              <button
                type="button"
                (mousedown)="$event.preventDefault()"
                class="rounded-lg p-2 text-sm hover:bg-surface-2"
                (click)="selectYear(y)"
              >
                {{ y }}
              </button>
            }
          </div>
        }

        <div class="mt-3 flex items-center justify-between border-t border-default pt-3">
          <span class="text-xs text-muted">{{ displayText() || t('noDate') }}</span>
          <button
            type="button"
            (mousedown)="$event.preventDefault()"
            (click)="selectToday()"
            class="text-xs font-medium text-brand-700 transition-colors duration-150 hover:text-brand-700 dark:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 rounded-md px-2 py-1"
          >
            {{ t('today') }}
          </button>
        </div>
      </div>
    </ng-template>
  `,
})
export class DatePickerComponent implements ControlValueAccessor {
  readonly value = model<string | null>(null);
  readonly placeholder = input('');
  readonly locale = input<string | null>();
  readonly disableOverlayButtons = input(false, { transform: booleanAttribute });
  readonly format = input<string>();
  readonly min = input<string>();
  readonly max = input<string>();
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly name = input<string>();

  protected readonly isOpen = signal(false);
  protected readonly formDisabled = signal(false);
  protected readonly panelId = `ui-datepicker-panel-${++datepickerPanelSeq}`;
  protected readonly editing = signal(false);
  protected readonly query = signal('');
  protected readonly view = signal<{ year: number; month: number }>({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });
  protected readonly mode = signal<'day' | 'month' | 'year'>('day');
  protected readonly yearPageStart = signal(Math.floor(this.view().year / 12) * 12);
  protected readonly years = computed(() => {
    const start = this.yearPageStart();
    return Array.from({ length: 12 }, (_, i) => start + i);
  });

  // Effective min/max with far‑past/far‑future defaults when inputs are not provided
  protected readonly effectiveMin = computed(() => this.min() ?? '1900-01-01');
  protected readonly effectiveMax = computed(() => this.max() ?? '9999-12-31');

  private readonly localeService = inject(LocaleService);
  private readonly triggerEl = viewChild.required<ElementRef<HTMLInputElement>>('triggerEl');
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private overlayRef: OverlayRef | null = null;
  private closing = false;
  private _onChange: (value: string | null) => void = () => {};

  protected onTouched: () => void = () => {};

  protected readonly effectiveLocale = computed(
    () => this.locale() ?? this.localeService.defaultLocale,
  );

  protected readonly monthNames = computed(() =>
    this.localeService.monthNames(this.effectiveLocale()),
  );
  protected readonly weekdayLabels = computed(() =>
    this.localeService.weekdayLabels(this.effectiveLocale()),
  );

  protected readonly datePattern = computed<DateFormatPattern>(() =>
    this.localeService.datePattern(this.effectiveLocale(), this.format()),
  );

  protected readonly effectivePlaceholder = computed(() => {
    if (this.placeholder()) return this.placeholder();
    return this.datePattern().toLowerCase();
  });

  protected readonly displayText = computed(() => {
    if (this.editing()) {
      return this.query();
    }
    return formatDisplay(this.value(), this.datePattern());
  });

  protected readonly monthLabel = computed(() => {
    const { year, month } = this.view();
    return `${this.monthNames()[month]} ${year}`;
  });

  protected readonly cells = computed<Date[]>(() => buildMonthCells(this.view()));

  protected readonly fieldClasses = computed(() =>
    cn(FIELD_CLASSES, 'flex items-center gap-2', this.invalid() ? FIELD_INVALID_CLASSES : ''),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.close());
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? null);
    if (value) {
      const date = parseIso(value);
      this.view.set({ year: date.getFullYear(), month: date.getMonth() });
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected cellKey(index: number): string {
    const cell = this.cells()[index];
    return toIso(cell);
  }

  protected isCurrentMonth(cell: Date): boolean {
    const { year, month } = this.view();
    return cell.getFullYear() === year && cell.getMonth() === month;
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

  protected isToday(cell: Date): boolean {
    return isSameDay(cell, new Date());
  }

  protected dayClasses(cell: Date): string {
    const selected = this.value() === toIso(cell);
    return cn(
      'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
      selected
        ? 'bg-brand-500 font-medium text-white'
        : this.isToday(cell)
          ? 'font-semibold text-brand-700 dark:text-brand-400 hover:bg-brand-500/10'
          : 'text-fg hover:bg-surface-2',
      !selected && !this.isCurrentMonth(cell) ? 'text-muted/60' : '',
      this.isDisabled(cell) ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
    );
  }

  protected shiftMonth(delta: number): void {
    this.view.update((view) => shiftMonth(view, delta));
  }

  protected shiftYear(delta: number): void {
    this.view.update(({ year, month }) => {
      const next = new Date(year + delta, month, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  protected shiftYearPage(delta: number): void {
    this.yearPageStart.update((v) => v + delta * 12);
  }

  protected toggleMode(): void {
    if (this.mode() === 'day') {
      this.mode.set('year');
    } else {
      this.mode.set('day');
    }
  }

  protected modeLabel(): string {
    if (this.mode() === 'day') {
      return this.monthLabel();
    }
    if (this.mode() === 'month') {
      return `${this.view().year}`;
    }
    return this.t('years');
  }

  protected t(key: UiStringKey): string {
    return this.localeService.translate(key, this.effectiveLocale());
  }

  protected shiftView(delta: number): void {
    if (this.mode() === 'day') {
      this.shiftMonth(delta);
    } else if (this.mode() === 'month') {
      this.shiftYear(delta);
    } else {
      this.shiftYearPage(delta);
    }
  }

  protected selectYear(year: number): void {
    this.view.update((v) => ({ year, month: v.month }));
    this.mode.set('month');
  }

  protected selectMonth(month: number): void {
    this.view.update((v) => ({ year: v.year, month }));
    this.mode.set('day');
  }

  protected selectDay(cell: Date): void {
    if (this.isDisabled(cell)) {
      return;
    }
    this.value.set(toIso(cell));
    this._onChange(toIso(cell));
    this.onTouched();
    // Reset editing flag so display shows formatted value
    this.editing.set(false);
    this.close();
  }

  protected selectToday(): void {
    const today = new Date();
    const iso = toIso(today);
    if (this.min() && today < parseIso(this.min()!)) {
      return;
    }
    if (this.max() && today > parseIso(this.max()!)) {
      return;
    }
    this.value.set(iso);
    this._onChange(iso);
    this.onTouched();
    this.view.set({ year: today.getFullYear(), month: today.getMonth() });
    this.close();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.open();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      // Only commit if the user is actively editing (typing).
      if (this.editing()) {
        this.commitQuery();
      }
      this.close();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  protected onInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const raw = inputEl.value;
    const inputEvent = event as InputEvent;
    const isDeleting =
      inputEvent.inputType === 'deleteContentBackward' ||
      inputEvent.inputType === 'deleteContentForward';

    // Detect ISO entry first
    if (/^\d{4}[-/]/.test(raw)) {
      this.query.set(raw);
      this.editing.set(true);
      return;
    }

    const digits = raw.replace(/\D/g, '').slice(0, 8);
    const pattern = this.datePattern();
    let masked = '';

    if (pattern === 'yyyy/MM/dd') {
      if (digits.length > 0) masked += digits.slice(0, 4);
      if (digits.length === 4 && !isDeleting) masked += '/';
      if (digits.length > 4) masked += '/' + digits.slice(4, 6);
      if (digits.length === 6 && !isDeleting) masked += '/';
      if (digits.length > 6) masked += '/' + digits.slice(6, 8);
    } else {
      if (digits.length > 0) masked += digits.slice(0, 2);
      if (digits.length === 2 && !isDeleting) masked += '/';
      if (digits.length > 2) masked += '/' + digits.slice(2, 4);
      if (digits.length === 4 && !isDeleting) masked += '/';
      if (digits.length > 4) masked += '/' + digits.slice(4, 8);
    }

    // Write the masked value back to the input
    if (inputEl.value !== masked) {
      inputEl.value = masked;
    }
    this.query.set(masked);
    this.editing.set(true);

    // Auto‑commit if the masked value forms a complete valid date
    if (masked.length === 10) {
      const iso = parseText(masked, pattern);
      if (iso && !this.isOutsideRange(iso)) {
        this.setValue(iso);
        const date = parseIso(iso);
        this.view.set({ year: date.getFullYear(), month: date.getMonth() });
        // Keep the formatted value visibly in the input instead of clearing it
        inputEl.value = formatDisplay(iso, pattern);
        this.editing.set(false);
        // Do not clear query – it is no longer needed for display
        this.query.set('');
      }
    }
  }

  protected onBlur(): void {
    this.editing.set(false);
    if (this.query().trim()) {
      this.commitQuery();
    }
  }

  private commitQuery(): void {
    const text = this.query().trim();
    if (!text) {
      this.setValue(null);
      this.query.set('');
      // Keep overlay open when clearing via typing
      return;
    }
    const iso = parseText(text, this.datePattern());
    if (!iso) {
      // Invalid or incomplete date – clear the field but keep overlay open
      this.setValue(null);
      this.query.set('');
      return;
    }
    if (this.isOutsideRange(iso)) {
      this.setValue(null);
      this.query.set('');
      return;
    }
    this.setValue(iso);
    const date = parseIso(iso);
    this.view.set({ year: date.getFullYear(), month: date.getMonth() });
    this.editing.set(false);
    this.query.set('');
    // Do not close overlay after successful entry
  }

  private setValue(iso: string | null): void {
    if (iso !== this.value()) {
      this.value.set(iso);
      this._onChange(iso);
      this.onTouched();
    }
  }

  private isOutsideRange(iso: string): boolean {
    const date = parseIso(iso);
    const minDate = parseIso(this.effectiveMin());
    if (date < minDate) {
      return true;
    }
    const maxDate = parseIso(this.effectiveMax());
    if (date > maxDate) {
      return true;
    }
    return false;
  }

  protected open(): void {
    if (this.overlayRef) {
      return;
    }
    const value = this.value();
    if (value) {
      const date = parseIso(value);
      this.view.set({ year: date.getFullYear(), month: date.getMonth() });
    } else {
      const today = new Date();
      this.view.set({ year: today.getFullYear(), month: today.getMonth() });
    }
    this.overlayRef = this.overlay.create({
      width: 320,
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
    this.closing = false;
  }

  private onOverlayDetached(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      if (this.overlayRef) {
        this.overlayRef.dispose();
        this.overlayRef = null;
      }
    }
  }
}
