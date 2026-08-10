import { Component } from '@angular/core';

@Component({
  selector: 'ui-screen-reader-only',
  standalone: true,
  host: { class: 'sr-only' },
  template: `<ng-content />`,
})
export class ScreenReaderOnlyComponent {}
