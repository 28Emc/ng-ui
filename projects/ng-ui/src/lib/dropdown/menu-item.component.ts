import { Component, computed, input, booleanAttribute } from '@angular/core';
import { cn } from '../utils/cn';

@Component({
  selector: 'ui-menu-item',
  standalone: true,
  template: `
    <button type="button" role="menuitem" [class]="classes()">
      <ng-content />
    </button>
  `,
})
export class MenuItemComponent {
  readonly danger = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() =>
    cn(
      'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
      this.danger()
        ? 'text-red-600 hover:bg-red-500/10 dark:text-red-400'
        : 'text-fg hover:bg-surface-2',
    ),
  );
}
