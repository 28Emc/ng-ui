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
import { LucideChevronDown, LucideClock } from '@lucide/angular';
import { cn } from '../utils/cn';
import { FIELD_CLASSES, FIELD_INVALID_CLASSES } from '../input/field-base';

export type TimeValue = string | null;
export type TimeFormat = '12' | '24';
export type TimePeriod = 'AM' | 'PM';

function pad(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

let timepickerPanelSeq = 0;

function toMinutes(value: string | undefined): number | null {
  if (!value) {
    return null;
  }
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

function getTimeFormat(customFormat?: string): TimeFormat {
  if (customFormat) {
    return customFormat.toLowerCase().startsWith('h') ? '12' : '24';
  }
  return '24';
}

function formatDisplay(value: string | null, format: TimeFormat): string {
  if (!value) {
    return '';
  }
  const [h, m] = value.split(':').map(Number);
  if (format === '24') {
    return `${pad(h)}:${pad(m)}`;
  }
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const period = h < 12 ? 'AM' : 'PM';
  return `${pad(hour12)}:${pad(m)} ${period}`;
}

function parseTimeText(text: string): string | null {
  const trimmed = text.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }
  const match = /^(\d{1,2})(?::(\d{1,2}))?\s*([ap]\.?m\.?)?$/.exec(trimmed);
  if (!match) {
    return null;
  }
  const [, hourRaw, minuteRaw, periodRaw] = match;
  const hour = Number(hourRaw);
  const minute = minuteRaw ? Number(minuteRaw) : 0;
  if (isNaN(hour) || isNaN(minute) || minute < 0 || minute > 59) {
    return null;
  }
  let hour24 = hour;
  if (periodRaw) {
    if (hour < 1 || hour > 12) {
      return null;
    }
    const isPm = periodRaw.startsWith('p');
    if (hour === 12) {
      hour24 = isPm ? 12 : 0;
    } else if (isPm) {
      hour24 = hour + 12;
    } else {
      hour24 = hour;
    }
  } else if (hour > 23) {
    return null;
  }
  return `${pad(hour24)}:${pad(minute)}`;
}

@Component({
  selector: 'ui-timepicker',
  standalone: true,
  imports: [LucideChevronDown, LucideClock],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative">
      <div [class]="fieldClasses()">
        <svg lucideClock [size]="16" [strokeWidth]="2" class="shrink-0 text-muted" />
        <input
          #triggerEl
          type="text"
          inputmode="numeric"
          autocomplete="off"
          [attr.name]="name() || null"
          [placeholder]="effectivePlaceholder()"
          [value]="displayText()"
          [disabled]="disabled() || formDisabled()"
          [attr.aria-label]="'Seleccionar hora'"
          role="combobox"
          aria-haspopup="dialog"
          [attr.aria-controls]="panelId"
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
          [attr.aria-label]="'Alternar hora'"
          (click)="toggle()"
          class="-mr-1 shrink-0 rounded-md p-1 text-muted transition-colors duration-150 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
        >
          <svg lucideChevronDown [size]="16" [strokeWidth]="2" [class]="chevronClasses()" />
        </button>
      </div>
    </div>

    <ng-template #panel>
      <div
        [id]="panelId"
        class="w-60 rounded-xl border border-default bg-surface p-4 shadow-pop animate-scale-in"
      >
        <div class="mb-3 flex items-center justify-between">
          <span class="text-sm font-semibold text-fg">{{
            displayText() || 'Seleccionar hora'
          }}</span>
          @if (formatMode() === '12') {
            <div class="flex overflow-hidden rounded-lg border border-default text-xs font-medium">
              <button
                type="button"
                (mousedown)="$event.preventDefault()"
                (click)="togglePeriod('AM')"
                [class]="periodClasses('AM')"
              >
                AM
              </button>
              <button
                type="button"
                (mousedown)="$event.preventDefault()"
                (click)="togglePeriod('PM')"
                [class]="periodClasses('PM')"
              >
                PM
              </button>
            </div>
          }
        </div>

        <div class="flex gap-3">
          <div
            class="max-h-48 flex-1 overflow-y-auto overscroll-contain scrollbar-thin rounded-lg border border-default p-1"
          >
            @for (h of hours(); track h) {
              <button
                type="button"
                [attr.data-role]="'hour'"
                [attr.data-hour]="activeHour(h) ? '' : null"
                [disabled]="isHourDisabled(h)"
                [class]="timeItemClasses(activeHour(h))"
                (mousedown)="$event.preventDefault()"
                (click)="selectHour(h)"
              >
                {{ pad(h) }}
              </button>
            }
          </div>
          <div
            class="max-h-48 flex-1 overflow-y-auto overscroll-contain scrollbar-thin rounded-lg border border-default p-1"
          >
            @for (m of minutes(); track m) {
              <button
                type="button"
                [attr.data-role]="'minute'"
                [attr.data-minute]="m === previewMinute() ? '' : null"
                [disabled]="isMinuteDisabled(m)"
                [class]="timeItemClasses(m === previewMinute())"
                (mousedown)="$event.preventDefault()"
                (click)="selectMinute(m)"
              >
                {{ pad(m) }}
              </button>
            }
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between border-t border-default pt-3">
          <span class="text-xs text-muted">{{ displayText() || 'Sin hora' }}</span>
          <button
            type="button"
            (mousedown)="$event.preventDefault()"
            (click)="selectNow()"
            [disabled]="isNowDisabled()"
            class="text-xs font-medium text-brand-700 transition-colors duration-150 hover:text-brand-700 dark:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 rounded-md px-2 py-1"
          >
            Ahora
          </button>
        </div>
      </div>
    </ng-template>
  `,
})
export class TimePickerComponent implements ControlValueAccessor {
  readonly value = model<string | null>(null);
  readonly placeholder = input('');
  readonly format = input<string>();
  readonly min = input<string>();
  readonly max = input<string>();
  readonly minuteStep = input(1);
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly name = input<string>();

  protected readonly isOpen = signal(false);
  protected readonly formDisabled = signal(false);
  protected readonly editing = signal(false);
  protected readonly query = signal('');
  protected readonly panelId = `ui-timepicker-panel-${++timepickerPanelSeq}`;

  private readonly triggerEl = viewChild.required<ElementRef<HTMLInputElement>>('triggerEl');
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private overlayRef: OverlayRef | null = null;
  private closing = false;
  private _onChange: (value: string | null) => void = () => {};

  protected onTouched: () => void = () => {};

  protected readonly formatMode = computed<TimeFormat>(() => getTimeFormat(this.format()));

  protected readonly effectivePlaceholder = computed(() => {
    if (this.placeholder()) {
      return this.placeholder();
    }
    return this.formatMode() === '12' ? 'hh:mm' : 'HH:mm';
  });

  protected readonly displayText = computed(() => {
    if (this.editing()) {
      return this.query();
    }
    return formatDisplay(this.value(), this.formatMode());
  });

  protected readonly hours = computed(() => {
    const count = this.formatMode() === '12' ? 12 : 24;
    return Array.from({ length: count }, (_, i) => (this.formatMode() === '12' ? i + 1 : i));
  });

  protected readonly minutes = computed(() => {
    const step = Math.max(1, Math.floor(this.minuteStep()));
    const list: number[] = [];
    for (let i = 0; i < 60; i += step) {
      list.push(i);
    }
    return list;
  });

  protected readonly previewHour = computed(() => {
    const value = this.value();
    if (value) {
      return Number(value.split(':')[0]);
    }
    return 9;
  });

  protected readonly previewMinute = computed(() => {
    const value = this.value();
    if (value) {
      return Number(value.split(':')[1]);
    }
    return 0;
  });

  protected readonly displayHour = computed(() => {
    const hour = this.previewHour();
    if (this.formatMode() === '12') {
      return hour % 12 === 0 ? 12 : hour % 12;
    }
    return hour;
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

  writeValue(value: string | null): void {
    this.value.set(value ?? null);
    this.editing.set(false);
    this.query.set('');
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

  protected pad(value: number): string {
    return pad(value);
  }

  protected activeHour(hour: number): boolean {
    return hour === this.displayHour();
  }

  protected timeItemClasses(active: boolean): string {
    return cn(
      'w-full rounded-md px-2 py-1 text-center text-sm transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
      active ? 'bg-brand-500 font-medium text-white' : 'text-fg hover:bg-surface-2',
    );
  }

  protected periodClasses(period: TimePeriod): string {
    const active = this.previewHour() < 12 ? period === 'AM' : period === 'PM';
    return cn(
      'px-2.5 py-1 transition-colors duration-150 cursor-pointer',
      active ? 'bg-brand-500 text-white' : 'text-muted hover:text-fg',
    );
  }

  protected isHourDisabled(hour: number): boolean {
    const min = toMinutes(this.min());
    const max = toMinutes(this.max());
    if (min === null && max === null) {
      return false;
    }
    if (min !== null && hour * 60 + 59 < min) {
      return true;
    }
    if (max !== null && hour * 60 > max) {
      return true;
    }
    return false;
  }

  protected isMinuteDisabled(minute: number): boolean {
    const min = toMinutes(this.min());
    const max = toMinutes(this.max());
    if (min === null && max === null) {
      return false;
    }
    const value = this.previewHour() * 60 + minute;
    if (min !== null && value < min) {
      return true;
    }
    if (max !== null && value > max) {
      return true;
    }
    return false;
  }

  protected isNowDisabled(): boolean {
    const now = new Date();
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    return this.isOutsideRange(time);
  }

  protected selectHour(hour: number): void {
    let hour24 = hour;
    if (this.formatMode() === '12') {
      const period = this.previewHour() < 12 ? 'AM' : 'PM';
      hour24 = this.to24(hour, period);
    }
    this.setValueFromParts(hour24, this.previewMinute());
    this.scrollActiveIntoView();
  }

  protected selectMinute(minute: number): void {
    this.setValueFromParts(this.previewHour(), minute);
    this.scrollActiveIntoView();
  }

  protected togglePeriod(period: TimePeriod): void {
    const hour = this.previewHour();
    const currentPeriod: TimePeriod = hour < 12 ? 'AM' : 'PM';
    if (currentPeriod === period) {
      return;
    }
    const hour12 = hour % 12;
    const next = period === 'PM' ? (hour12 === 0 ? 12 : hour12 + 12) : hour12;
    this.setValueFromParts(next, this.previewMinute());
  }

  protected selectNow(): void {
    const now = new Date();
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    if (this.isOutsideRange(time)) {
      return;
    }
    this.setValue(time);
    this.editing.set(false);
    this.query.set('');
    this.close();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.isOpen()) {
        this.open();
        return;
      }
      const delta = event.key === 'ArrowDown' ? this.step() : -this.step();
      const minute = (((this.previewMinute() + delta) % 60) + 60) % 60;
      this.setValueFromParts(this.previewHour(), minute);
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

  protected onInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const raw = inputEl.value;
    const inputEvent = event as InputEvent;
    const isDeleting =
      inputEvent.inputType === 'deleteContentBackward' ||
      inputEvent.inputType === 'deleteContentForward';

    const suffixMatch = /([ap]\.?m\.?)$/i.exec(raw);
    const suffix = suffixMatch ? suffixMatch[1] : '';
    const body = (suffix ? raw.slice(0, raw.length - suffix.length) : raw)
      .replace(/[^\d:]/g, '')
      .slice(0, 5);

    let masked: string;
    if (body.includes(':')) {
      const [hh, mm] = body.split(':');
      masked = hh || mm ? `${hh.slice(0, 2)}:${mm.slice(0, 2)}` : '';
    } else {
      const digits = body.replace(/\D/g, '').slice(0, 4);
      masked = digits.slice(0, 2);
      if (digits.length === 2 && !isDeleting) {
        masked += ':';
      }
      if (digits.length > 2) {
        masked += ':' + digits.slice(2, 4);
      }
    }
    if (suffix) {
      masked += ` ${suffix.toUpperCase()}`;
    }

    if (inputEl.value !== masked) {
      inputEl.value = masked;
    }
    this.query.set(masked);
    this.editing.set(true);

    const totalDigits = raw.replace(/\D/g, '').length;
    if (totalDigits === 4 && !suffix && this.formatMode() === '24') {
      const time = parseTimeText(masked);
      if (time && !this.isOutsideRange(time)) {
        this.setValue(time);
        inputEl.value = formatDisplay(time, this.formatMode());
        this.editing.set(false);
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

  protected toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  private step(): number {
    return Math.max(1, Math.floor(this.minuteStep()));
  }

  private to24(hour12: number, period: TimePeriod): number {
    if (period === 'AM') {
      return hour12 === 12 ? 0 : hour12;
    }
    return hour12 === 12 ? 12 : hour12 + 12;
  }

  private setValueFromParts(hour: number, minute: number): void {
    const time = `${pad(hour)}:${pad(minute)}`;
    if (this.isOutsideRange(time)) {
      return;
    }
    this.setValue(time);
    this.editing.set(false);
    this.query.set('');
  }

  private commitQuery(): void {
    const text = this.query().trim();
    if (!text) {
      this.setValue(null);
      this.query.set('');
      return;
    }
    const time = parseTimeText(text);
    if (!time) {
      this.setValue(null);
      this.query.set('');
      return;
    }
    if (this.isOutsideRange(time)) {
      this.setValue(null);
      this.query.set('');
      return;
    }
    this.setValue(time);
    this.editing.set(false);
    this.query.set('');
  }

  private setValue(time: string | null): void {
    if (time !== this.value()) {
      this.value.set(time);
      this._onChange(time);
      this.onTouched();
    }
  }

  private isOutsideRange(time: string): boolean {
    const minutes = toMinutes(time);
    if (minutes === null) {
      return true;
    }
    const min = toMinutes(this.min());
    if (min !== null && minutes < min) {
      return true;
    }
    const max = toMinutes(this.max());
    if (max !== null && minutes > max) {
      return true;
    }
    return false;
  }

  private scrollActiveIntoView(): void {
    setTimeout(() => {
      const panel = this.overlayRef?.overlayElement;
      if (!panel) {
        return;
      }
      const hour = panel.querySelector<HTMLElement>('[data-hour]');
      if (hour && typeof hour.scrollIntoView === 'function') {
        hour.scrollIntoView({ block: 'nearest' });
      }
      const minute = panel.querySelector<HTMLElement>('[data-minute]');
      if (minute && typeof minute.scrollIntoView === 'function') {
        minute.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  protected open(): void {
    if (this.overlayRef) {
      return;
    }
    this.overlayRef = this.overlay.create({
      width: 260,
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
    this.scrollActiveIntoView();
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
