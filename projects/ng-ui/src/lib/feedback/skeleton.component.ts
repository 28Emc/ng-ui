import { Component, computed, input } from '@angular/core';
import { cn } from '../utils/cn';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

@Component({
  selector: 'ui-skeleton',
  standalone: true,
  template: ` <div [class]="classes()" [style.width]="width()" [style.height]="height()" aria-hidden="true"></div> `,
})
export class SkeletonComponent {
  readonly class = input('');
  readonly width = input<string | number>('100%');
  readonly height = input<string | number>('1rem');
  readonly variant = input<SkeletonVariant>('text');

  protected readonly classes = computed(() =>
    cn(
      'animate-pulse bg-surface-2',
      this.variant() === 'circular' && 'rounded-full',
      this.variant() === 'rectangular' && 'rounded-lg',
      this.variant() === 'text' && 'rounded-lg',
      this.class(),
    ),
  );
}
