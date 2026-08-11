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

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
export type InputDensity = 'comfortable' | 'compact' | 'spacious';

@Component({
  selector: 'ui-input',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  host: {
    '[attr.data-density]': 'density()',
  },
  template: `
    <input
      [class]="classes()"
      [type]="type()"
      [value]="value()"
      [placeholder]="placeholder() || null"
      [id]="id() || null"
      [attr.name]="name() || null"
      [attr.autocomplete]="autocomplete() || null"
      [disabled]="disabled() || formDisabled()"
      [attr.aria-invalid]="invalid() || null"
      [attr.aria-required]="ariaRequired() || null"
      [attr.aria-describedby]="describedBy() || null"
      (input)="onInput($event)"
      (blur)="onTouched()"
    />
  `,
})
export class InputComponent implements ControlValueAccessor {
  readonly type = input<InputType>('text');
  readonly placeholder = input('');
  readonly id = input<string>();
  readonly name = input<string>();
  readonly autocomplete = input<string>();
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly density = input<InputDensity>('comfortable');

  private readonly field = inject(FIELD_CONTEXT);
  protected readonly describedBy = computed(() => {
    const ids = [this.field.errorId(), this.field.hintId()].filter(Boolean);
    return ids.length ? ids.join(' ') : null;
  });
  protected readonly ariaRequired = computed(() => this.field.required() || null);

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};
  protected readonly value = signal('');
  protected readonly formDisabled = signal(false);

  protected readonly classes = computed(() =>
    cn(
      FIELD_CLASSES,
      'density-compact:px-3 density-compact:py-2 density-spacious:px-4 density-spacious:py-3',
      this.invalid() ? FIELD_INVALID_CLASSES : '',
    ),
  );

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
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
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }
}
