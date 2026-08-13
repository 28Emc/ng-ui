import { Component, computed, inject, input } from '@angular/core';
import { LocaleService } from '../locale/locale.service';
import { cn } from '../utils/cn';

@Component({
  selector: 'ui-skip-link',
  standalone: true,
  template: ` <a [href]="target()" [class]="classes()">{{ label() || defaultLabel() }}</a> `,
})
export class SkipLinkComponent {
  readonly target = input('#main');
  readonly label = input('');

  private readonly localeService = inject(LocaleService);

  protected readonly defaultLabel = computed(() => this.localeService.translate('skipToContent'));

  protected readonly classes = computed(() =>
    cn(
      'fixed left-4 top-4 z-[100] -translate-y-24 rounded-lg bg-brand-700 px-4 py-2',
      'text-sm font-medium text-white shadow-pop transition-transform duration-150',
      'opacity-0 focus:translate-y-0 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50',
    ),
  );
}
