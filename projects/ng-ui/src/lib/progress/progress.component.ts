import { Component, computed, input, booleanAttribute } from '@angular/core';
import { cn } from '../utils/cn';

export type ProgressSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<ProgressSize, string> = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

@Component({
  selector: 'ui-progress',
  standalone: true,
  template: `
    <div
      role="progressbar"
      [attr.aria-valuenow]="indeterminate() ? null : normalizedValue()"
      [attr.aria-valuemin]="0"
      [attr.aria-valuemax]="max()"
      [attr.aria-label]="label() || null"
      [class]="trackClasses()"
    >
      @if (indeterminate()) {
        <div
          class="indeterminate-bar absolute top-0 h-full rounded-full animate-indeterminate"
          [style.background]="brandColor()"
        ></div>
      } @else {
        <div
          [class]="fillClasses()"
          [style.width.%]="percent()"
          [style.background]="brandColor()"
        ></div>
      }
    </div>
  `,
})
export class ProgressComponent {
  readonly value = input(0, { transform: (v: unknown) => Number(v) || 0 });
  readonly max = input(100, { transform: (v: unknown) => Number(v) || 100 });
  readonly size = input<ProgressSize>('md');
  readonly indeterminate = input(false, { transform: booleanAttribute });
  readonly label = input<string>();

  protected readonly percent = computed(() => {
    if (this.indeterminate()) return 0;
    const v = Math.max(0, Math.min(this.max(), this.value()));
    return Math.round((v / this.max()) * 100);
  });

  protected readonly normalizedValue = computed(() =>
    this.indeterminate() ? null : Math.max(0, Math.min(this.max(), this.value())),
  );

  protected readonly brandColor = computed(() => 'var(--color-brand-500)');

  protected readonly trackClasses = computed(() =>
    cn('relative w-full overflow-hidden rounded-full bg-surface-2', SIZE_CLASSES[this.size()]),
  );

  protected readonly fillClasses = computed(() =>
    cn('h-full rounded-full transition-[width] duration-200 ease-out'),
  );
}
