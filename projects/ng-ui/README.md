# @emc-dev/ng-ui

Angular 22 UI component library (standalone components, `ui-*` selectors).
Built on Angular CDK, Forms, Overlay, and Router with Tailwind CSS v4.

## Installation

```bash
pnpm add @emc-dev/ng-ui @angular/animations @angular/cdk @angular/common @angular/core @angular/forms @angular/router @lucide/angular
```

## Usage

```ts
import { Component } from '@angular/core';
import { ButtonComponent } from '@emc-dev/ng-ui';

@Component({
  selector: 'app-root',
  imports: [ButtonComponent],
  template: `<ui-button variant="primary">Click me</ui-button>`,
})
export class AppComponent {}
```

Import the compiled theme styles once:

```css
@import '@emc-dev/ng-ui/styles.css';
```

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md).
