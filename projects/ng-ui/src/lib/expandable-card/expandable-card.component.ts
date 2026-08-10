import { Component, computed, input, model } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { cn } from '../utils/cn';

@Component({
  selector: 'ui-expandable-card',
  standalone: true,
  imports: [LucideChevronDown],
  template: `
    <div class="rounded-2xl border border-default bg-surface text-fg shadow-soft">
      <button
        type="button"
        [id]="triggerId"
        class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 rounded-2xl"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="bodyId"
        (click)="toggle()"
      >
        <span class="flex flex-col">
          <span class="text-sm font-semibold text-fg">{{ title() }}</span>
          @if (subtitle()) {
            <span class="mt-0.5 text-xs text-muted">{{ subtitle() }}</span>
          }
        </span>
        <svg
          lucideChevronDown
          [size]="18"
          [strokeWidth]="2"
          [class]="chevronClasses()"
          class="flex-shrink-0 text-muted"
        />
      </button>
      @if (open()) {
        <div
          [id]="bodyId"
          role="region"
          [attr.aria-labelledby]="triggerId"
          class="animate-slide-up border-t border-default px-5 py-4"
        >
          <ng-content />
        </div>
      }
    </div>
  `,
})
export class ExpandableCardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly open = model(false);

  protected readonly triggerId = `ui-expandable-trigger-${Math.random().toString(36).slice(2, 9)}`;
  protected readonly bodyId = `ui-expandable-body-${Math.random().toString(36).slice(2, 9)}`;

  protected readonly chevronClasses = computed(() =>
    cn('transition-transform duration-150', this.open() ? 'rotate-180' : ''),
  );

  protected toggle(): void {
    this.open.set(!this.open());
  }
}
