import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-card-header',
  standalone: true,
  template: `
    <header class="flex items-center justify-between gap-4 px-6 pt-6">
      <div class="space-y-0.5">
        @if (title()) {
          <h3 class="text-balance text-base font-semibold text-fg">{{ title() }}</h3>
        }
        @if (subtitle()) {
          <p class="text-sm text-muted">{{ subtitle() }}</p>
        }
      </div>
      <ng-content />
    </header>
  `,
})
export class CardHeaderComponent {
  readonly title = input('');
  readonly subtitle = input('');
}
