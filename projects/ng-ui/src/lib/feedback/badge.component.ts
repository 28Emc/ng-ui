import { Component, computed, input } from '@angular/core';
import { cn } from '../utils/cn';

export type BadgeVariant = 'default' | 'brand' | 'green' | 'amber' | 'gray';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-surface-2 text-fg',
  brand: 'bg-brand-500/10 text-brand-700 dark:text-brand-300',
  green: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  gray: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
};

@Component({
  selector: 'ui-badge',
  standalone: true,
  template: `
    <span [class]="classes()">
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');

  protected readonly classes = computed(() =>
    cn(
      'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium',
      VARIANT_CLASSES[this.variant()],
    ),
  );
}
