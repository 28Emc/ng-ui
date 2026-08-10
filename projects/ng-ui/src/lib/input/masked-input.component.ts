import {
  Component,
  computed,
  forwardRef,
  inject,
  signal,
  input,
  booleanAttribute,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cn } from '../utils/cn';
import { FIELD_CLASSES, FIELD_INVALID_CLASSES } from './field-base';
import { FIELD_CONTEXT } from './field-context.token';
import { cursorAtRawCount, extractMaskDigits, formatMask, placeholderFromMask } from './mask-utils';

@Component({
  selector: 'ui-masked-input',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaskedInputComponent),
      multi: true,
    },
  ],
  template: `
    <input
      [class]="classes()"
      type="text"
      [value]="display()"
      [placeholder]="placeholder() || derivedPlaceholder()"
      [id]="id() || null"
      [attr.name]="name() || null"
      [attr.autocomplete]="autocomplete() || null"
      [disabled]="disabled() || formDisabled()"
      [attr.inputmode]="inputmode()"
      [attr.aria-invalid]="invalid() || null"
      [attr.aria-required]="ariaRequired() || null"
      [attr.aria-describedby]="describedBy() || null"
      (input)="onInput($event)"
      (keydown)="onKeydown($event)"
      (blur)="onTouched()"
    />
  `,
})
export class MaskedInputComponent implements ControlValueAccessor {
  readonly mask = input.required<string>();
  readonly maskChar = input('#');
  readonly placeholder = input('');
  readonly id = input<string>();
  readonly name = input<string>();
  readonly autocomplete = input<string>();
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly emitMasked = input(false, { transform: booleanAttribute });

  private readonly field = inject(FIELD_CONTEXT);
  private readonly raw = signal('');

  protected readonly display = computed(() => formatMask(this.raw(), this.mask(), this.maskChar()));
  protected readonly derivedPlaceholder = computed(() =>
    placeholderFromMask(this.mask(), this.maskChar()),
  );
  protected readonly inputmode = computed(() =>
    this.mask().includes(this.maskChar()) ? 'numeric' : 'text',
  );
  protected readonly describedBy = computed(() => {
    const ids = [this.field.errorId(), this.field.hintId()].filter(Boolean);
    return ids.length ? ids.join(' ') : null;
  });
  protected readonly ariaRequired = computed(() => this.field.required() || null);

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};
  protected readonly formDisabled = signal(false);

  protected readonly classes = computed(() =>
    cn(FIELD_CLASSES, this.invalid() ? FIELD_INVALID_CLASSES : ''),
  );

  writeValue(value: string | null): void {
    this.raw.set(extractMaskDigits(value ?? ''));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected onInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const raw = extractMaskDigits(inputEl.value);
    const masked = formatMask(raw, this.mask(), this.maskChar());
    if (masked !== inputEl.value) {
      const cursor = inputEl.selectionStart ?? inputEl.value.length;
      const digitsBefore = extractMaskDigits(inputEl.value.slice(0, cursor)).length;
      const nextCursor = cursorAtRawCount(masked, digitsBefore);
      inputEl.value = masked;
      inputEl.setSelectionRange(nextCursor, nextCursor);
    }
    this.raw.set(raw);
    this.onChange(this.emitMasked() ? masked : raw);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Backspace') return;
    const inputEl = event.target as HTMLInputElement;
    if (inputEl.selectionStart === null || inputEl.selectionStart !== inputEl.selectionEnd) {
      return;
    }
    const position = inputEl.selectionStart;
    if (position === 0) return;
    if (/\d/.test(inputEl.value[position - 1] ?? '')) return;
    let target = position - 1;
    while (target >= 0 && !/\d/.test(inputEl.value[target])) {
      target--;
    }
    if (target < 0) return;
    const digitIndex = extractMaskDigits(inputEl.value.slice(0, target)).length;
    const raw = extractMaskDigits(inputEl.value);
    const nextRaw = raw.slice(0, digitIndex) + raw.slice(digitIndex + 1);
    const masked = formatMask(nextRaw, this.mask(), this.maskChar());
    inputEl.value = masked;
    this.raw.set(nextRaw);
    this.onChange(this.emitMasked() ? masked : nextRaw);
    event.preventDefault();
    const cursor = cursorAtRawCount(masked, digitIndex);
    inputEl.setSelectionRange(cursor, cursor);
  }
}
