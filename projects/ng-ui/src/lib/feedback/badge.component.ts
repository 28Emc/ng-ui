import { Component, computed, input } from '@angular/core';
import { cn } from '../utils/cn';

export type BadgeVariant =
  'default' | 'brand' | 'success' | 'warning' | 'info' | 'danger' | 'gray' | 'green' | 'amber';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-surface-2 text-fg',
  brand: 'bg-brand-500/10 text-brand-700 dark:text-brand-300',
  success: 'bg-success/10 text-success-strong',
  warning: 'bg-warning/10 text-warning-strong',
  info: 'bg-info/10 text-info-strong',
  danger: 'bg-danger/10 text-danger-strong',
  gray: 'bg-muted/10 text-muted-strong',
  green: 'bg-success/10 text-success-strong',
  amber: 'bg-warning/10 text-warning-strong',
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
