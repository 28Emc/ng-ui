import { Component, computed, inject, input, booleanAttribute } from '@angular/core';
import { cn } from '../utils/cn';
import { RADIO_GROUP_CONTEXT } from './radio-group.token';

@Component({
  selector: 'ui-radio',
  standalone: true,
  template: `
    <button
      type="button"
      role="radio"
      [attr.aria-checked]="checked()"
      [attr.aria-label]="label() || null"
      [disabled]="isDisabled()"
      [class]="buttonClasses()"
      (click)="select()"
    >
      <span [class]="outerClasses()">
        @if (checked()) {
          <span class="block h-2 w-2 rounded-full bg-white"></span>
        }
      </span>
      <span class="space-y-0.5">
        @if (label()) {
          <span class="block text-sm font-medium text-fg">{{ label() }}</span>
        }
        @if (description()) {
          <p class="text-xs text-muted">{{ description() }}</p>
        }
      </span>
    </button>
  `,
})
export class RadioComponent {
  readonly value = input.required<string>();
  readonly label = input('');
  readonly description = input('');
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly context = inject(RADIO_GROUP_CONTEXT);

  protected readonly checked = computed(() => this.context.value() === this.value());
  protected readonly isDisabled = computed(() => this.disabled() || this.context.disabled());

  protected readonly outerClasses = computed(() =>
    cn(
      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
      this.checked() ? 'border-brand-500 bg-brand-500' : 'border-default bg-surface',
    ),
  );

  protected readonly buttonClasses = computed(() =>
    cn(
      'flex w-full items-start gap-3 text-left px-2 py-1 rounded-xl transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2',
      this.isDisabled() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-2',
    ),
  );

  protected select(): void {
    if (this.isDisabled()) return;
    this.context.onSelect(this.value());
  }
}
