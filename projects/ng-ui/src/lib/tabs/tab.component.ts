import { Component, computed, input, viewChild, booleanAttribute } from '@angular/core';
import { TemplateRef } from '@angular/core';

@Component({
  selector: 'ui-tab',
  standalone: true,
  template: `<ng-template #content><ng-content /></ng-template>`,
})
export class TabComponent {
  readonly label = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly contentTpl = viewChild.required<TemplateRef<unknown>>('content');

  // Internal ID for accessibility
  readonly id = computed(() => `ui-tab-${Math.random().toString(36).slice(2, 9)}`);
}
