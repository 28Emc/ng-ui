import { Component, contentChildren, input, effect, booleanAttribute } from '@angular/core';
import { AccordionItemComponent } from './accordion-item.component';

@Component({
  selector: 'ui-accordion',
  standalone: true,
  template: `
    <div class="space-y-2">
      <ng-content />
    </div>
  `,
})
export class AccordionComponent {
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly items = contentChildren(AccordionItemComponent);

  constructor() {
    effect(() => {
      if (this.multiple()) return;
      let lastOpen: AccordionItemComponent | null = null;
      for (const item of this.items()) {
        if (item.open()) lastOpen = item;
      }
      if (lastOpen) {
        for (const item of this.items()) {
          if (item !== lastOpen) item.open.set(false);
        }
      }
    });
  }
}
