import { Component, computed, input, model, booleanAttribute } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { cn } from '../utils/cn';

@Component({
  selector: 'ui-accordion-item',
  standalone: true,
  imports: [LucideChevronDown],
  template: `
    <div [class]="itemClasses()">
      <button
        type="button"
        class="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
        [attr.aria-expanded]="open()"
        [disabled]="disabled()"
        (click)="toggle()"
      >
        <span class="text-sm font-medium text-fg">{{ title() }}</span>
        <svg
          lucideChevronDown
          [size]="18"
          [strokeWidth]="2"
          [class]="chevronClasses()"
          class="text-muted flex-shrink-0"
        />
      </button>
      @if (open()) {
        <div class="animate-slide-up px-4 pb-3" role="region" [attr.aria-labelledby]="titleId">
          @if (description()) {
            <p class="text-sm text-muted mb-3">{{ description() }}</p>
          }
          <ng-content />
        </div>
      }
    </div>
  `,
})
export class AccordionItemComponent {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly open = model(false);

  protected readonly titleId = `ui-accordion-title-${Math.random().toString(36).slice(2, 9)}`;

  protected readonly chevronClasses = computed(() =>
    cn('transition-transform duration-150', this.open() ? 'rotate-180' : ''),
  );

  protected readonly itemClasses = computed(() =>
    cn('rounded-xl border border-default bg-surface', this.disabled() ? 'opacity-50' : ''),
  );

  protected toggle(): void {
    if (!this.disabled()) this.open.set(!this.open());
  }
}
