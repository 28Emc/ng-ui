# @emc-dev/ng-ui

Angular 22 UI component library (standalone components, `ui-*` selectors) with Storybook. Built with Angular CDK, Forms, Overlay, and Router on Tailwind CSS v4.

[![npm version](https://img.shields.io/npm/v/@emc-dev/ng-ui.svg)](https://www.npmjs.com/package/@emc-dev/ng-ui)
[![license](https://img.shields.io/npm/l/@emc-dev/ng-ui.svg)](./projects/ng-ui/LICENSE)
[![peer deps](https://img.shields.io/badge/peer%20deps-Angular%2022-blue.svg)](./projects/ng-ui/package.json)

---

## Overview

**@emc-dev/ng-ui** is a component library for Angular applications. It provides a collection of accessible, themeable, standalone components designed for consistency, reusability, and developer experience.

The library is distributed as a single npm package under the `@emc-dev` scope and includes:

- **80+ exported components, directives, and utilities** covering forms, navigation, overlays, feedback, data display, and utilities
- **Tailwind CSS v4** theming with CSS custom properties, light/dark mode, and container queries
- **Storybook 10** documentation with autodocs, controls, accessibility addon, and Vitest/Playwright interaction testing
- **Accessibility validation** via axe-core (WCAG 2.1 A/AA) across 59 components
- **Visual regression testing** via Chromatic
- **Changesets-based versioning** with automated npm publishing via GitHub Actions (Trusted Publishing)

---

## Features

| Category              | Components                                                                                                                                                                                                                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Buttons & Actions** | `ui-button`, `ui-copy-to-clipboard-button`                                                                                                                                                                                                                                                          |
| **Form Inputs**       | `ui-input`, `ui-textarea`, `ui-select`, `ui-masked-input`, `ui-combobox`, `ui-multiselect`, `ui-taginput`, `ui-datepicker`, `ui-timepicker`, `ui-daterangepicker`, `ui-otp-input`, `ui-password-strength-meter`, `ui-checkbox`, `ui-radio`, `ui-radio-group`, `ui-switch`, `ui-rating`, `ui-slider` |
| **Form Layout**       | `ui-field`, `ui-label`, `ui-field-error`, `ui-form-section`, `ui-field-base`                                                                                                                                                                                                                        |
| **Navigation**        | `ui-breadcrumb`, `ui-sidebar`, `ui-pagination`, `ui-tabs`, `ui-stepper`, `ui-tree-view`                                                                                                                                                                                                             |
| **Overlays**          | `ui-modal`, `ui-confirm-modal`, `ui-drawer`, `ui-popover`, `ui-dropdown`, `ui-tooltip`, `ui-context-menu`                                                                                                                                                                                           |
| **Feedback**          | `ui-toast`/`ToastService`, `ui-spinner`, `ui-skeleton`, `ui-page-loader`, `ui-empty-state`, `ui-badge`, `ui-progress`, `ui-skip-link`                                                                                                                                                               |
| **Data Display**      | `ui-card`, `ui-card-header`, `ui-card-body`, `ui-stat-card`, `ui-expandable-card`, `ui-table`, `ui-infinite-scroll-table`, `ui-virtual-scroll-list`, `ui-drag-drop-list`, `ui-avatar`, `ui-avatar-group`, `ui-accordion`, `ui-sparkline`, `ui-carousel`, `ui-image`, `ui-file-upload`               |
| **Utilities**         | `ui-screen-reader-only`, `ui-theme-switcher`/`ThemeService`, `LocaleService`, `cn` (classname utility), `focus` utilities                                                                                                                                                                           |
| **Icons**             | `ui-icon` (inline SVG icon component for Lucide icons)                                                                                                                                                                                                                                              |

All components are **standalone**, use `ui-*` selectors, and are exported via `public-api.ts`.

---

## Requirements

| Tool            | Version                                              |
| --------------- | ---------------------------------------------------- |
| Node.js         | >= 20                                                |
| pnpm            | 11.5.0 (see `packageManager` in root `package.json`) |
| Angular         | ^22.0.0 (peer dependency)                            |
| @angular/cdk    | ^22.0.0 (peer dependency)                            |
| @angular/forms  | ^22.0.0 (peer dependency)                            |
| @angular/router | ^22.0.0 (peer dependency)                            |
| @lucide/angular | ^1.28.0 (peer dependency)                            |

---

## Installation

```bash
pnpm add @emc-dev/ng-ui @angular/animations @angular/cdk @angular/common @angular/core @angular/forms @angular/router @lucide/angular
```

> **Note:** The peer dependencies must be installed explicitly. The library does not bundle Angular or CDK.

---

## Usage

### Import a component

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

### Import styles

Import the pre-compiled theme CSS once in your global stylesheet:

```css
@import '@emc-dev/ng-ui/styles.css';
```

Or in `angular.json`:

```json
"styles": [
  "node_modules/@emc-dev/ng-ui/styles.css",
  "src/styles.css"
]
```

### Enable dark mode

The library uses a `dark` class on the HTML element for color-scheme switching. Toggle it via the `ThemeService` or manually:

```ts
document.documentElement.classList.add('dark');
```

---

## Components

The public API is defined in [`projects/ng-ui/src/public-api.ts`](projects/ng-ui/src/public-api.ts). Key exports:

```ts
// Buttons
export { ButtonComponent } from './lib/button/button.component';

// Form fields
export {
  FieldComponent,
  LabelComponent,
  FieldErrorComponent,
  InputComponent,
  TextareaComponent,
  SelectComponent,
  MaskedInputComponent,
  ComboboxComponent,
  MultiSelectComponent,
  TagInputComponent,
  DatePickerComponent,
  TimePickerComponent,
  DateRangePickerComponent,
  OTPInputComponent,
  PasswordStrengthMeterComponent,
  CheckboxComponent,
  RadioComponent,
  RadioGroupComponent,
  SwitchComponent,
  RatingComponent,
} from './lib/...';

// Navigation
export {
  BreadcrumbComponent,
  SidebarComponent,
  PaginationComponent,
  TabsComponent,
  TabComponent,
  StepperComponent,
  TreeViewComponent,
} from './lib/...';

// Overlays
export {
  ModalComponent,
  ConfirmModalComponent,
  DrawerComponent,
  PopoverComponent,
  DropdownComponent,
  MenuItemComponent,
  MenuDividerComponent,
  TooltipDirective,
  TooltipContentComponent,
  ContextMenuComponent,
} from './lib/...';

// Feedback
export {
  ToastComponent,
  ToastService,
  ToastHostComponent,
  SpinnerComponent,
  SkeletonComponent,
  PageLoaderComponent,
  EmptyStateComponent,
  BadgeComponent,
  ProgressComponent,
  SkipLinkComponent,
} from './lib/...';

// Data display
export {
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  StatCardComponent,
  ExpandableCardComponent,
  TableComponent,
  InfiniteScrollTableComponent,
  VirtualScrollListComponent,
  DragDropListComponent,
  AvatarComponent,
  AvatarGroupComponent,
  AccordionComponent,
  AccordionItemComponent,
  SparklineComponent,
  CarouselComponent,
  ImageComponent,
  FileUploadComponent,
} from './lib/...';

// Utilities
export {
  ScreenReaderOnlyComponent,
  ThemeSwitcherComponent,
  ThemeService,
  LocaleService,
  cn,
  focus,
} from './lib/...';

// Icons
export { UiIconComponent } from './lib/icon/ui-icon.component';
```

See individual component stories in Storybook for complete API documentation (inputs, outputs, slots, variants).

---

## Theming & Styling

- **Tailwind CSS v4** with `@theme` configuration in `projects/ng-ui/src/lib/styles/theme.css`
- **CSS custom properties** for colors, spacing, typography, motion, and semantic tokens (`--color-success`, `--color-warning`, `--color-danger`, `--color-info`)
- **Light/dark mode** via `dark` class on `:root` / `html`
- **Container queries** on `ui-card` and `ui-table` (`@container` / `@sm:` / `@wide:` variants)
- **Density variants** (`comfortable` / `compact` / `spacious`) on `ui-button`, `ui-input`, and form fields via `data-density` attribute
- **Pre-compiled CSS** (`styles.css`) generated at build time via `pnpm tw:build`
- **No runtime Tailwind** in consumers — only the compiled `styles.css` is required

Customize the theme by overriding CSS variables or extending `theme.css` before running `pnpm tw:build`.

---

## Accessibility

The library includes an **automated accessibility test suite** (`projects/ng-ui/src/lib/a11y/a11y.spec.ts`) using **axe-core** that validates **59 components** against **WCAG 2.1 A/AA** rules (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`).

### Validation approach

| Layer      | Tool                       | Scope                             |
| ---------- | -------------------------- | --------------------------------- |
| Unit tests | axe-core + Angular TestBed | 59 components, rendered in JSDOM  |
| Storybook  | `@storybook/addon-a11y`    | Interactive review in browser     |
| CI         | `pnpm test:storybook`      | Vitest + Playwright browser tests |

### Running accessibility checks

```bash
# Unit test suite (axe-core in JSDOM)
pnpm test

# Storybook interaction + a11y tests (real browser via Playwright)
pnpm test:storybook
```

> **Status:** The test suite enforces zero violations for the tested components. This is a validation strategy, not a blanket "WCAG compliant" claim — coverage is limited to the components and states exercised by the test hosts.

---

## Documentation

### Storybook (local)

```bash
pnpm storybook        # Dev server at http://localhost:6006
pnpm build-storybook  # Static build to storybook-static/
```

Storybook includes:

- **Autodocs** for all components (`.docs.mdx` files)
- **Controls** for interactive prop editing
- **Accessibility panel** (`@storybook/addon-a11y`) with live axe-core scans
- **Theme toolbar** (light/dark/global)
- **Vitest integration** (`@storybook/addon-vitest`) for interaction tests
- **Chromatic modes** configured for light/dark at 390/768/1280 viewports

Component stories live alongside sources: `projects/ng-ui/src/lib/**/*.stories.ts`.

### Architecture docs

See [`docs/`](./docs) for:

- `AGENT_PROMPT.md` — implementation roadmap
- `DESIGN.md` — design system tokens and principles
- `FUTURE_IMPLEMENTATIONS.md` — planned components

---

## Testing

| Command               | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| `pnpm test`           | Angular unit tests (Karma/Jasmine via `ng test ng-ui`)            |
| `pnpm test:storybook` | Storybook interaction + a11y tests (Vitest + Playwright/Chromium) |
| `pnpm lint`           | ESLint + Angular ESLint                                           |
| `pnpm format:check`   | Prettier formatting check                                         |

### Test structure

- **Unit tests**: `*.component.spec.ts` beside each component
- **Accessibility tests**: `projects/ng-ui/src/lib/a11y/a11y.spec.ts` (59 component hosts)
- **Storybook tests**: `*.stories.ts` with play functions + `@storybook/addon-vitest`

---

## Development

### Setup

```bash
pnpm install
```

### Common scripts

| Script                 | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `pnpm build`           | Build library (`ng build ng-ui`) + Tailwind CSS     |
| `pnpm tw:build`        | Compile `theme.css` → `styles.css`                  |
| `pnpm build:prod`      | Production build with optimizations                 |
| `pnpm analyze`         | Bundle size report → `dist/bundle-stats/ng-ui.html` |
| `pnpm lint`            | Run ESLint                                          |
| `pnpm format`          | Format with Prettier                                |
| `pnpm storybook`       | Start Storybook dev server (port 6006)              |
| `pnpm build-storybook` | Build static Storybook                              |
| `pnpm test:storybook`  | Run Storybook interaction + a11y tests              |
| `pnpm chromatic`       | Submit build to Chromatic (visual regression)       |
| `pnpm changeset`       | Create a changeset entry                            |
| `pnpm release`         | Build + `changeset publish` (used by CI)            |

---

## Project Structure

```
ng-ui/
├── projects/
│   └── ng-ui/                    # @emc-dev/ng-ui library
│       ├── src/
│       │   ├── lib/              # Component source (80+ folders)
│       │   ├── public-api.ts     # Public exports
│       │   └── styles/theme.css  # Tailwind v4 theme source
│       ├── ng-package.json       # ng-packagr config
│       ├── CHANGELOG.md          # Release history
│       ├── LICENSE               # MIT license
│       └── README.md             # Package README (published to npm)
├── .storybook/                   # Storybook 10 config
│   ├── main.ts                   # Stories, addons, framework
│   ├── preview.ts                # Global decorators, a11y, chromatic
│   └── vitest.config.ts          # Vitest + Playwright for storybook tests
├── .github/workflows/
│   ├── ci.yml                    # Build, lint, test, storybook, chromatic
│   └── release.yml               # Changesets release + npm publish (OIDC)
├── scripts/
│   ├── analyze-ng-ui.mjs         # Bundle analysis (esbuild + gzip)
│   └── patch-ng-ui-exports.mjs   # Post-build export patching
├── docs/                         # Architecture & design docs
├── package.json                  # Root workspace config
├── pnpm-workspace.yaml           # pnpm workspace definition
└── README.md                     # This file
```

---

## Build

```bash
pnpm build          # Development build
pnpm build:prod     # Production build (AOT, optimizations)
```

Output: `dist/ng-ui/` with:

- ESM2022 + type declarations
- `styles.css` (pre-compiled Tailwind)
- `theme.css` (source)
- `LICENSE`
- `README.md`

The `postbuild` script runs `scripts/patch-ng-ui-exports.mjs` to ensure correct export maps.

---

## Versioning

This project uses **Changesets** for version management and changelog generation.

### Workflow

1. Create a changeset: `pnpm changeset` (creates `changesets/*.md`)
2. Commit and push to `main`
3. GitHub Actions `release.yml` opens a **Version PR** with updated versions and `CHANGELOG.md`
4. Merge the Version PR → triggers **npm publish** via Trusted Publishing (OIDC)

No manual `npm publish` or version bumping is required.

---

## Publishing

Publishing is fully automated via **GitHub Actions** (`.github/workflows/release.yml`):

- **Trusted Publishing** (OIDC) — no npm tokens stored in GitHub
- **Access**: `public` (configured in `publishConfig`)
- **Output directory**: `dist/ng-ui` (via `ng-package.json` assets)
- **Trigger**: Merge of Changesets Version PR to `main`

To release locally (maintainers only):

```bash
pnpm release
```

---

## Contributing

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Create a feature branch
4. Make changes with:
   - Component implementation in `projects/ng-ui/src/lib/`
   - Unit tests (`*.spec.ts`)
   - Storybook stories (`*.stories.ts`, `*.docs.mdx`)
   - Accessibility test host in `projects/ng-ui/src/lib/a11y/a11y.spec.ts`
5. Run validation before PR:
   ```bash
   pnpm lint
   pnpm format:check
   pnpm test
   pnpm test:storybook
   pnpm build
   ```
6. Create a changeset: `pnpm changeset`
7. Open a Pull Request

CI will run the full validation pipeline (lint, format, build, unit tests, Storybook build, Storybook tests, Chromatic).

---

## License

MIT License — see [`projects/ng-ui/LICENSE`](projects/ng-ui/LICENSE) for details.

Copyright (c) 2026 Edinson Medina Chinga
