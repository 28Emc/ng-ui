import { Component, input, computed } from '@angular/core';
import { ICON_PATHS } from './icon-paths';

@Component({
  selector: 'ui-icon',
  standalone: true,
  template: `
    <svg
      class="block shrink-0"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
})
export class UiIconComponent {
  readonly name = input<string>('');
  readonly size = input(16);
  readonly strokeWidth = input(2);

  protected readonly path = computed(() => {
    const p = ICON_PATHS[this.name()];
    if (!p) {
      console.warn(`Icon "${this.name()}" not found in ICON_PATHS`);
      return ICON_PATHS['alert-circle'];
    }
    return p;
  });
}