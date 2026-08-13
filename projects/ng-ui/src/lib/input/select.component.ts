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

const SELECT_CHEVRON =
  "center right 0.75rem/1.125rem no-repeat url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

@Component({
  selector: 'ui-select',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  template: `
    <select
      [class]="classes()"
      [style.background]="chevron"
      [value]="value()"
      [attr.id]="id() || null"
      [attr.name]="name() || null"
      [attr.autocomplete]="autocomplete() || null"
      [attr.aria-label]="ariaLabel() || null"
      [disabled]="disabled() || formDisabled()"
      [attr.aria-invalid]="invalid() || null"
      [attr.aria-required]="ariaRequired() || null"
      [attr.aria-describedby]="describedBy() || null"
      (change)="onChange($event)"
      (blur)="onTouched()"
    >
      @if (placeholder()) {
        <option value="" disabled hidden>{{ placeholder() }}</option>
      }
      <ng-content />
    </select>
  `,
})
export class SelectComponent implements ControlValueAccessor {
  readonly placeholder = input('');
  readonly id = input<string>();
  readonly name = input<string>();
  readonly ariaLabel = input<string>();
  readonly autocomplete = input<string>();
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly field = inject(FIELD_CONTEXT);
  protected readonly describedBy = computed(() => {
    const ids = [this.field.errorId(), this.field.hintId()].filter(Boolean);
    return ids.length ? ids.join(' ') : null;
  });
  protected readonly ariaRequired = computed(() => this.field.required() || null);

  private _onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};
  protected readonly value = signal('');
  protected readonly formDisabled = signal(false);
  protected readonly chevron = SELECT_CHEVRON;

  protected readonly classes = computed(() =>
    cn(
      FIELD_CLASSES,
      'appearance-none pr-10 scheme-light dark:scheme-dark',
      this.invalid() ? FIELD_INVALID_CLASSES : '',
    ),
  );

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected onChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.value.set(value);
    this._onChange(value);
  }
}
