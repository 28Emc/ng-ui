import {
  Component,
  computed,
  forwardRef,
  inject,
  input,
  signal,
  booleanAttribute,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideCheck, LucideEye, LucideEyeOff } from '@lucide/angular';
import { cn } from '../utils/cn';
import { FIELD_CLASSES, FIELD_INVALID_CLASSES } from '../input/field-base';
import { FIELD_CONTEXT } from '../input/field-context.token';
import {
  PASSWORD_CRITERIA,
  PASSWORD_LEVEL_LABELS,
  PASSWORD_SEGMENTS,
  evaluatePassword,
  type PasswordStrengthLevel,
} from './password-strength.utils';

const LEVEL_TEXT_CLASSES: Record<PasswordStrengthLevel, string> = {
  empty: 'text-muted',
  weak: 'text-red-700 dark:text-red-400',
  fair: 'text-amber-700 dark:text-amber-400',
  good: 'text-lime-700 dark:text-lime-400',
  strong: 'text-green-700 dark:text-green-400',
};

const LEVEL_BAR_CLASSES: Record<PasswordStrengthLevel, string> = {
  empty: 'bg-surface-2',
  weak: 'bg-red-500',
  fair: 'bg-amber-500',
  good: 'bg-lime-500',
  strong: 'bg-green-500',
};

@Component({
  selector: 'ui-password-strength-meter',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordStrengthMeterComponent),
      multi: true,
    },
  ],
  imports: [LucideCheck, LucideEye, LucideEyeOff],
  template: `
    <div>
      <div class="relative">
        <input
          [class]="classes()"
          [type]="revealed() ? 'text' : 'password'"
          [value]="password()"
          [placeholder]="placeholder()"
          [attr.id]="id() || null"
          [disabled]="disabled() || formDisabled()"
          [attr.autocomplete]="autocomplete()"
          [attr.aria-invalid]="invalid() || null"
          [attr.aria-required]="ariaRequired() || null"
          [attr.aria-describedby]="describedBy() || null"
          (input)="onInput($event)"
          (blur)="onTouched()"
        />
        <button
          type="button"
          [attr.aria-label]="revealed() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          [attr.aria-pressed]="revealed()"
          [disabled]="disabled() || formDisabled()"
          (click)="revealed.update((value) => !value)"
          class="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          @if (revealed()) {
            <svg lucideEyeOff [size]="16" [strokeWidth]="2" />
          } @else {
            <svg lucideEye [size]="16" [strokeWidth]="2" />
          }
        </button>
      </div>

      @if (strength().level !== 'empty') {
        <div
          class="mt-2"
          role="meter"
          aria-label="Fortaleza de la contraseña"
          aria-valuemin="0"
          [attr.aria-valuemax]="segmentCount"
          [attr.aria-valuenow]="strength().score"
          [attr.aria-valuetext]="strengthLabel()"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium" [class]="strengthTextClass()">
              {{ strengthLabel() }}
            </span>
            <span class="text-xs text-muted">{{ strength().score }} / {{ segmentCount }}</span>
          </div>
          <div class="mt-1.5 flex gap-1" aria-hidden="true">
            @for (segment of segments; track $index) {
              <span
                class="h-1 flex-1 rounded-full transition-colors duration-200"
                [class]="segmentClass(segment)"
              ></span>
            }
          </div>
        </div>

        @if (showCriteria()) {
          <ul class="mt-2.5 space-y-1">
            @for (criterion of criteria; track criterion.key) {
              <li
                class="flex items-center gap-1.5 text-xs"
                [class]="checks()[criterion.key] ? 'text-fg' : 'text-muted'"
              >
                @if (checks()[criterion.key]) {
                  <svg
                    lucideCheck
                    [size]="13"
                    [strokeWidth]="2.5"
                    class="shrink-0 text-green-700 dark:text-green-400"
                  />
                } @else {
                  <span class="h-1.5 w-1.5 shrink-0 rounded-full border border-default"></span>
                }
                {{ criterion.label }}
              </li>
            }
          </ul>
        }
      }
    </div>
  `,
})
export class PasswordStrengthMeterComponent implements ControlValueAccessor {
  readonly placeholder = input('Contraseña');
  readonly id = input<string>();
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly showCriteria = input(true, { transform: booleanAttribute });
  readonly autocomplete = input('current-password');

  protected readonly segmentCount = PASSWORD_SEGMENTS;
  protected readonly segments = Array.from({ length: PASSWORD_SEGMENTS }, (_, index) => index);
  protected readonly criteria = PASSWORD_CRITERIA;

  private readonly field = inject(FIELD_CONTEXT);
  protected readonly password = signal('');
  protected readonly revealed = signal(false);

  protected readonly strength = computed(() => evaluatePassword(this.password()));
  protected readonly checks = computed(() => this.strength().checks);
  protected readonly strengthLabel = computed(() => PASSWORD_LEVEL_LABELS[this.strength().level]);
  protected readonly strengthTextClass = computed(() => LEVEL_TEXT_CLASSES[this.strength().level]);
  protected readonly strengthBarClass = computed(() => LEVEL_BAR_CLASSES[this.strength().level]);
  protected readonly describedBy = computed(() => {
    const ids = [this.field.errorId(), this.field.hintId()].filter(Boolean);
    return ids.length ? ids.join(' ') : null;
  });
  protected readonly ariaRequired = computed(() => this.field.required() || null);

  protected readonly classes = computed(() =>
    cn(FIELD_CLASSES, 'pr-11', this.invalid() ? FIELD_INVALID_CLASSES : ''),
  );

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};
  protected readonly formDisabled = signal(false);

  protected segmentClass(index: number): string {
    return index < this.strength().score ? this.strengthBarClass() : 'bg-surface-2';
  }

  writeValue(value: string | null): void {
    this.password.set(value ?? '');
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
    this.password.set(value);
    this.onChange(value);
  }
}
