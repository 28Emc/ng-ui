import { Component, computed, input, booleanAttribute } from '@angular/core';
import { RouterLink } from '@angular/router';
import { cn } from '../utils/cn';
import type { UiBreadcrumbItem } from './breadcrumb-item';

@Component({
  selector: 'ui-breadcrumb-item',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (current()) {
      <span aria-current="page" [class]="spanClasses()">{{ item().label }}</span>
    } @else if (item().routerLink) {
      <a
        [routerLink]="item().routerLink"
        [attr.role]="menuItem() ? 'menuitem' : null"
        [attr.aria-label]="item().ariaLabel || null"
        [attr.aria-disabled]="item().disabled || null"
        [class]="linkClasses()"
        (click)="onClick($event)"
        >{{ item().label }}</a
      >
    } @else if (item().href) {
      <a
        [href]="item().href"
        [attr.role]="menuItem() ? 'menuitem' : null"
        [attr.aria-label]="item().ariaLabel || null"
        [attr.aria-disabled]="item().disabled || null"
        [class]="linkClasses()"
        (click)="onClick($event)"
        >{{ item().label }}</a
      >
    } @else if (item().onClick) {
      <button
        type="button"
        [attr.role]="menuItem() ? 'menuitem' : null"
        [attr.aria-label]="item().ariaLabel || null"
        [disabled]="item().disabled"
        [class]="linkClasses()"
        (click)="onClick($event)"
      >
        {{ item().label }}
      </button>
    } @else {
      <span [class]="spanClasses()">{{ item().label }}</span>
    }
  `,
})
export class BreadcrumbItemComponent {
  readonly item = input.required<UiBreadcrumbItem>();
  readonly current = input(false, { transform: booleanAttribute });
  readonly menuItem = input(false, { transform: booleanAttribute });

  protected readonly linkClasses = computed(() =>
    cn(
      'flex items-center rounded-lg transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
      this.menuItem()
        ? 'w-full gap-2 px-3 py-2 text-left text-sm'
        : 'px-2 py-1 text-sm font-medium',
      this.item().disabled
        ? 'cursor-not-allowed text-muted/50 hover:bg-transparent hover:text-muted/50'
        : 'text-muted hover:text-brand-700 hover:bg-brand-500/5 dark:hover:text-brand-400',
    ),
  );

  protected readonly spanClasses = computed(() =>
    cn(
      'flex items-center text-sm font-medium',
      this.menuItem() ? 'w-full gap-2 px-3 py-2 text-left' : 'px-2 py-1',
      this.current() ? 'text-fg' : 'text-muted',
    ),
  );

  protected onClick(event: MouseEvent): void {
    if (this.item().disabled) {
      event.preventDefault();
      return;
    }
    this.item().onClick?.(event);
  }
}
