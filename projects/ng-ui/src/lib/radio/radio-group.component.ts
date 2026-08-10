import { Component, computed, forwardRef, signal, input, booleanAttribute } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cn } from '../utils/cn';
import { RADIO_GROUP_CONTEXT } from './radio-group.token';

@Component({
  selector: 'ui-radio-group',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroupComponent),
      multi: true,
    },
    {
      provide: RADIO_GROUP_CONTEXT,
      useFactory: (group: RadioGroupComponent) => ({
        value: group.value,
        disabled: () => group.disabled() || group.formDisabled(),
        onSelect: group.onSelect.bind(group),
        onTouched: group.onTouched.bind(group),
      }),
      deps: [RadioGroupComponent],
    },
  ],
  template: `
    <fieldset
      role="radiogroup"
      [class]="classes()"
      [attr.aria-labelledby]="label() ? labelId : null"
    >
      @if (label()) {
        <legend [id]="labelId" class="text-sm font-medium text-fg mb-2">
          {{ label() }}
        </legend>
      }
      <div class="space-y-2">
        <ng-content />
      </div>
    </fieldset>
  `,
})
export class RadioGroupComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly uid = `ui-radio-group-${Math.random().toString(36).slice(2, 9)}`;
  protected readonly labelId = `ui-radiogroup-label-${this.uid}`;

  protected readonly selectedValue = signal<string | null>(null);
  protected readonly formDisabled = signal(false);

  readonly value = computed(() => this.selectedValue());

  readonly onSelect = (value: string): void => {
    if (this.disabled() || this.formDisabled()) return;
    this.selectedValue.set(value);
    this._onChange(value);
    this.onTouched();
  };

  readonly onTouched = (): void => {
    this.touch();
  };

  protected readonly classes = computed(() =>
    cn('space-y-1', this.disabled() || this.formDisabled() ? 'opacity-50' : ''),
  );

  private _onChange: (value: string) => void = () => {};
  protected onTouchedFn: () => void = () => {};

  protected touch(): void {
    this.onTouchedFn();
  }

  writeValue(value: string | null): void {
    this.selectedValue.set(value ?? null);
  }

  registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
