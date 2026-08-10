import { Component, computed, forwardRef, signal, input, booleanAttribute } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideCheck } from '@lucide/angular';
import { cn } from '../utils/cn';

@Component({
  selector: 'ui-checkbox',
  standalone: true,
  imports: [LucideCheck],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex items-start gap-3">
      <button
        type="button"
        role="checkbox"
        [attr.aria-checked]="checked()"
        [attr.aria-label]="label() || null"
        [disabled]="disabled() || formDisabled()"
        [class]="boxClasses()"
        (click)="toggle()"
      >
        @if (checked()) {
          <svg lucideCheck [size]="14" [strokeWidth]="2.5" class="text-white" />
        }
      </button>
      @if (label() || description()) {
        <div class="space-y-0.5">
          @if (label()) {
            <span class="block text-sm font-medium text-fg">{{ label() }}</span>
          }
          @if (description()) {
            <p class="text-xs text-muted">{{ description() }}</p>
          }
        </div>
      }
    </div>
  `,
})
export class CheckboxComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly description = input('');
  readonly disabled = input(false, { transform: booleanAttribute });

  private _onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};
  protected readonly checked = signal(false);
  protected readonly formDisabled = signal(false);

  protected readonly boxClasses = computed(() =>
    cn(
      'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
      'disabled:cursor-not-allowed disabled:opacity-50',
      this.checked()
        ? 'border-brand-500 bg-brand-500'
        : 'border-default bg-surface hover:bg-surface-2',
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
