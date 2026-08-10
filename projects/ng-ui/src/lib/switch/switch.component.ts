import { Component, computed, forwardRef, signal, input, booleanAttribute } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cn } from '../utils/cn';

@Component({
  selector: 'ui-switch',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex items-center justify-between gap-4">
      <div class="space-y-0.5">
        @if (label()) {
          <span class="block text-sm font-medium text-fg">{{ label() }}</span>
        }
        @if (description()) {
          <p class="text-xs text-muted">{{ description() }}</p>
        }
      </div>
      <button
        type="button"
        role="switch"
        [attr.aria-checked]="checked()"
        [attr.aria-label]="label() || null"
        [disabled]="disabled() || formDisabled()"
        [class]="trackClasses()"
        (click)="toggle()"
      >
        <span [class]="thumbClasses()"></span>
      </button>
    </div>
  `,
})
export class SwitchComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly description = input('');
  readonly disabled = input(false, { transform: booleanAttribute });

  private _onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};
  protected readonly checked = signal(false);
  protected readonly formDisabled = signal(false);

  protected readonly trackClasses = computed(() =>
    cn(
      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5',
      'transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
      'disabled:cursor-not-allowed disabled:opacity-50',
      this.checked() ? 'bg-brand-500' : 'bg-surface-2',
    ),
  );

  protected readonly thumbClasses = computed(() =>
    cn(
      'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-150',
      this.checked() ? 'translate-x-5' : 'translate-x-0',
    ),
  );

  writeValue(value: boolean | null): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected toggle(): void {
    this.checked.set(!this.checked());
    this._onChange(this.checked());
    this.onTouched();
  }
}
