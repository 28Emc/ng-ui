import { Component, computed, input, booleanAttribute } from '@angular/core';
import { LucideCircleAlert } from '@lucide/angular';
import { cn } from '../utils/cn';

@Component({
  selector: 'ui-form-section',
  standalone: true,
  imports: [LucideCircleAlert],
  template: `
    <section [attr.aria-labelledby]="titleId" [class]="classes()">
      <header class="border-b border-default px-5 py-4">
        <h3 [id]="titleId" class="text-balance text-base font-semibold text-fg">{{ title() }}</h3>
        @if (description()) {
          <p class="mt-1 text-sm text-muted">{{ description() }}</p>
        }
      </header>
      <div class="px-5 py-5">
        <ng-content />
      </div>
      @if (error()) {
        <p class="flex items-center gap-1.5 border-t border-default px-5 py-3 text-sm text-red-600">
          <svg lucideCircleAlert [size]="14" [strokeWidth]="2" />
          {{ error() }}
        </p>
      }
    </section>
  `,
})
export class FormSectionComponent {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly error = input<string | null>(null);

  protected readonly titleId = `ui-form-section-title-${Math.random().toString(36).slice(2, 9)}`;

  protected readonly classes = computed(() =>
    cn(
      'rounded-2xl border bg-surface text-fg shadow-soft',
      this.invalid() || !!this.error() ? 'border-red-500' : 'border-default',
    ),
  );
}
