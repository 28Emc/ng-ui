import { Component, computed, input } from '@angular/core';
import { cn } from '../utils/cn';

@Component({
  selector: 'ui-skeleton',
  standalone: true,
  template: ` <div [class]="classes()" aria-hidden="true"></div> `,
})
export class SkeletonComponent {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn('animate-pulse rounded-lg bg-surface-2', this.class()),
  );
}
