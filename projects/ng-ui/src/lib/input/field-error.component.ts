import { Component, input } from '@angular/core';
import { LucideCircleAlert } from '@lucide/angular';

@Component({
  selector: 'ui-field-error',
  standalone: true,
  imports: [LucideCircleAlert],
  template: `
    <p [attr.id]="id() || null" class="flex items-center gap-1.5 text-sm text-red-600">
      <svg lucideCircleAlert [size]="14" [strokeWidth]="2" />
      <ng-content />
    </p>
  `,
})
export class FieldErrorComponent {
  readonly id = input<string>();
}
