import { Component, computed, input } from '@angular/core';
import { LucideLoader2 } from '@lucide/angular';
import { cn } from '../utils/cn';

@Component({
  selector: 'ui-spinner',
  standalone: true,
  imports: [LucideLoader2],
  template: `
    <svg lucideLoader2 [class]="classes()" [size]="size()" [strokeWidth]="2" aria-hidden="true" />
  `,
})
export class SpinnerComponent {
  readonly size = input<number>(16);
  readonly class = input('');

  protected readonly classes = computed(() => cn('animate-spin text-brand-500', this.class()));
}
