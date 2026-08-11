import { Component, computed, input, booleanAttribute } from '@angular/core';
import { cn } from '../utils/cn';

@Component({
  selector: 'ui-card',
  standalone: true,
  template: `
    <div [class]="classes()">
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  readonly hover = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() =>
    cn(
      '@container rounded-2xl border border-default bg-surface text-fg shadow-soft',
      this.hover()
        ? 'transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-card'
        : '',
    ),
  );
}
