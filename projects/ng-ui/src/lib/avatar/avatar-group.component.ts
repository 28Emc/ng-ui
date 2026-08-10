import { Component, computed, input } from '@angular/core';
import { AvatarComponent, AvatarSize } from './avatar.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { cn } from '../utils/cn';

export interface AvatarGroupUser {
  name: string;
  color?: string;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

const OVERLAP: Record<AvatarSize, string> = {
  sm: '-ml-1.5',
  md: '-ml-2',
  lg: '-ml-2.5',
};

@Component({
  selector: 'ui-avatar-group',
  standalone: true,
  imports: [AvatarComponent, TooltipDirective],
  template: `
    <div class="flex items-center" role="group" [attr.aria-label]="ariaLabel()">
      @for (user of visibleUsers(); track user.name; let index = $index) {
        <div [uiTooltip]="user.name" placement="top" [class]="itemClass(index)">
          <ui-avatar [name]="user.name" [color]="user.color" [size]="size()" />
        </div>
      }
      @if (overflowCount() > 0) {
        <div
          [uiTooltip]="totalLabel()"
          placement="top"
          [class]="itemClass(visibleUsers().length)"
          role="img"
          [attr.aria-label]="totalLabel()"
        >
          <span [class]="counterClass()">+{{ overflowCount() }}</span>
        </div>
      }
    </div>
  `,
})
export class AvatarGroupComponent {
  readonly avatars = input.required<AvatarGroupUser[]>();
  readonly max = input(5);
  readonly size = input<AvatarSize>('md');

  protected readonly visibleUsers = computed(() =>
    this.avatars().slice(0, Math.max(1, this.max())),
  );

  protected readonly overflowCount = computed(() =>
    Math.max(0, this.avatars().length - this.max()),
  );

  protected readonly totalLabel = computed(() => {
    const count = this.avatars().length;
    return `${count} ${count === 1 ? 'usuario' : 'usuarios'}`;
  });

  protected readonly counterClass = computed(() =>
    cn(
      'inline-flex shrink-0 select-none items-center justify-center rounded-full bg-surface-2 font-semibold text-fg ring-2 ring-surface',
      SIZE_CLASSES[this.size()],
    ),
  );

  protected readonly itemClass = (index: number) =>
    cn(
      'relative rounded-full ring-2 ring-surface transition-transform duration-150 hover:-translate-y-0.5 hover:z-10',
      index === 0 ? 'ml-0' : OVERLAP[this.size()],
    );

  protected readonly ariaLabel = computed(() => {
    const count = this.avatars().length;
    if (count === 0) return '';
    const names = this.avatars()
      .map((user) => user.name)
      .join(', ');
    return `${count} ${count === 1 ? 'participante' : 'participantes'}: ${names}`;
  });
}
