import { Component, input, booleanAttribute } from '@angular/core';

@Component({
  selector: 'ui-label',
  standalone: true,
  template: `
    <label [attr.for]="htmlFor() || null" class="block text-sm font-medium text-fg">
      <ng-content />
      @if (required()) {
        <span class="text-red-500">*</span>
      }
    </label>
  `,
})
export class LabelComponent {
  readonly htmlFor = input<string>();
  readonly required = input(false, { transform: booleanAttribute });
}
