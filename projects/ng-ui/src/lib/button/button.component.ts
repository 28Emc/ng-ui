import { Component, computed, input, booleanAttribute } from '@angular/core';
import { cn } from '../utils/cn';
import { SpinnerComponent } from '../feedback/spinner.component';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'subtle';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';
export type ButtonDensity = 'comfortable' | 'compact' | 'spacious';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-gradient text-white shadow-soft hover:brightness-[1.06]',
  secondary: 'border border-default bg-surface text-fg hover:bg-surface-2',
  ghost: 'text-fg hover:bg-surface-2',
  danger: 'bg-danger text-white hover:bg-danger/90',
  outline:
    'border border-brand-300 text-brand-700 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-500/10',
  subtle: 'bg-brand-500/10 text-brand-700 hover:bg-brand-500/20 dark:text-brand-300',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-sm density-compact:h-7 density-compact:px-2.5 density-spacious:h-9',
  md: 'h-10 gap-2 px-4 text-sm density-compact:h-9 density-compact:px-3 density-spacious:h-11',
  lg: 'h-12 gap-2 px-6 text-base density-compact:h-11 density-spacious:h-14',
  icon: 'h-10 w-10 density-compact:h-9 density-compact:w-9 density-spacious:h-11 density-spacious:w-11',
  'icon-sm':
    'h-8 w-8 density-compact:h-7 density-compact:w-7 density-spacious:h-9 density-spacious:w-9',
};

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [SpinnerComponent],
  host: {
    '[attr.data-density]': 'density()',
  },
  template: `
    <button
      [type]="type()"
      [class]="classes()"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading() || null"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-expanded]="ariaExpanded() || null"
      [attr.aria-haspopup]="ariaHaspopup() || null"
      [attr.aria-current]="ariaCurrent() || null"
    >
      @if (loading()) {
        <ui-spinner [size]="spinnerSize()" class="text-current" />
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly density = input<ButtonDensity>('comfortable');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string>();
  readonly ariaExpanded = input<string>();
  readonly ariaHaspopup = input<string>();
  readonly ariaCurrent = input<string | null>();

  protected readonly classes = computed(() =>
    cn(
      'inline-flex select-none items-center justify-center whitespace-nowrap rounded-xl font-medium',
      'transition-[background-color,border-color,color,box-shadow,filter,transform] duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
      'active:scale-[.98] disabled:pointer-events-none disabled:opacity-50',
      VARIANT_CLASSES[this.variant()],
      SIZE_CLASSES[this.size()],
      this.variant() === 'danger' ? 'focus-visible:ring-danger/50' : '',
    ),
  );

  protected readonly spinnerSize = computed(() => {
    switch (this.size()) {
      case 'sm':
      case 'icon-sm':
        return 14;
      case 'lg':
        return 18;
      default:
        return 16;
    }
  });
}
