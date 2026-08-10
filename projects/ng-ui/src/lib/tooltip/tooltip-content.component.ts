import { Component, computed, signal } from '@angular/core';
import { cn } from '../utils/cn';

@Component({
  selector: 'ui-tooltip-content',
  standalone: true,
  template: ` <span [class]="classes()">{{ content() }}</span> `,
})
export class TooltipContentComponent {
  readonly content = signal('');

  protected readonly classes = computed(() =>
    cn(
      'pointer-events-none block max-w-xs rounded-lg px-2.5 py-1 text-xs font-medium shadow-pop',
      'bg-fg text-app',
    ),
  );
}
