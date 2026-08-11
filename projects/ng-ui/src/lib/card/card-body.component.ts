import { Component } from '@angular/core';

@Component({
  selector: 'ui-card-body',
  standalone: true,
  template: `
    <div class="p-4 @sm:p-6">
      <ng-content />
    </div>
  `,
})
export class CardBodyComponent {}
