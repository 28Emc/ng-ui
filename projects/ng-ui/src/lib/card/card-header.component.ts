import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-card-header',
  standalone: true,
  template: `
    <header
      class="flex flex-col items-start gap-3 px-4 pt-4 @sm:flex-row @sm:items-center @sm:justify-between @sm:gap-4 @sm:px-6 @sm:pt-6"
    >
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
