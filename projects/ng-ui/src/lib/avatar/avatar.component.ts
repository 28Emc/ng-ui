import { Component, computed, input } from '@angular/core';
import { cn } from '../utils/cn';
import { ensureContrast } from '../utils/color';

export type AvatarSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

@Component({
  selector: 'ui-avatar',
  standalone: true,
  template: `
    <span
      [class]="classes()"
      [class.bg-brand-gradient]="!color()"
      [style.background]="backgroundColor()"
    >
      {{ initials() }}
    </span>
  `,
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly color = input<string>();
  readonly size = input<AvatarSize>('md');

  protected readonly classes = computed(() =>
    cn(
      'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white',
      SIZE_CLASSES[this.size()],
    ),
  );

  protected readonly backgroundColor = computed(() => {
    const color = this.color();
    return color ? ensureContrast(color) : null;
  });

  protected readonly initials = computed(() => {
    const name = this.name().trim();
    if (!name) return '?';
    const parts = name.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });
}
