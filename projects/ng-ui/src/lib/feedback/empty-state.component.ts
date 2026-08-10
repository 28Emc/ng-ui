import { Component, Type, computed, contentChildren, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { EmptyStateActionDirective } from './empty-state-action.directive';

@Component({
  selector: 'ui-empty-state',
  standalone: true,
  imports: [NgComponentOutlet],
  template: `
    <div class="flex flex-col items-center justify-center px-6 py-16 text-center">
      @if (icon()) {
        <div
          class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 text-muted"
        >
          <ng-container
            [ngComponentOutlet]="icon()"
            [ngComponentOutletInputs]="{ size: 24, strokeWidth: 2 }"
          />
        </div>
      }
      <h3 class="text-balance text-lg font-semibold text-fg">{{ title() }}</h3>
      @if (description()) {
        <p class="mt-1 max-w-sm text-sm text-muted">{{ description() }}</p>
      }
      @if (hasAction()) {
        <div class="mt-6">
          <ng-content select="[uiEmptyStateAction]" />
        </div>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input<Type<unknown> | null>(null);
  readonly title = input('');
  readonly description = input('');

  private readonly actionSlot = contentChildren(EmptyStateActionDirective);
  protected readonly hasAction = computed(() => this.actionSlot().length > 0);
}
