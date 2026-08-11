# @emc-dev/ng-ui

## 1.2.1

### Patch Changes

- 196e563: Major release: Angular 22 upgrade with standalone components.

  - Upgraded from Angular 18 to Angular 22
  - Migrated all components to standalone
  - Removed demo from library repository (moved to separate root demo)
  - Cleaned up unused files (angular.json, .storybook, projects, scripts/)
  - All 549 tests passing, lint and format clean

## 1.2.0

### Minor Changes

- 911e530: Accessibility pass: new `ui-skip-link` component for keyboard navigation,
  `autoFocus` input on `Modal` and `Drawer` (focus moves to the first focusable
  element and returns to the trigger on close), and localized overlay close
  labels (`Cerrar`/`Close`) via `LocaleService`.

## 1.1.0

### Minor Changes

- 8e7919b: Add i18n locale support. `DatePicker` and `DateRangePicker` accept a `locale`
  input that overrides `LOCALE_ID` for date formatting, month/weekday names and
  UI strings. Intl logic is centralized in a new `LocaleService` with cached
  month names, Monday-first weekday labels and an `es`/`en` UI-string dictionary;
  the date-range calendar navigation buttons also gained accessible names.

### Patch Changes

- 70baa84: Fix axe-core violations detected by the new WCAG A/AA accessibility suite. The
  pagination prev/next buttons now pass the accessible name via the button's
  `ariaLabel` input instead of `[attr.aria-label]` on the host element, and
  `aria-current` is applied to the inner button. The datepicker trigger now uses
  the combobox pattern (`role="combobox"`, `aria-haspopup="dialog"`,
  `aria-expanded`, and `aria-controls` pointing to the panel id) and the calendar
  navigation chevron buttons have `aria-label`s with `aria-hidden` icons.

## 1.0.0

### Major Changes

- Initial release of @emc-dev/ng-ui

  Angular UI component library with standalone components, Tailwind CSS v4, and CDK integration.

  ## Features
  - **35+ components**: Button, Input, Textarea, Select, MaskedInput, Combobox, MultiSelect, TagInput, DatePicker, TimePicker, DateRangePicker, PasswordStrengthMeter, Switch, Rating, Checkbox, RadioGroup
  - **Forms**: Field, FormSection, Label, FieldError
  - **Navigation**: Breadcrumb, Sidebar, Tabs, Pagination, Stepper
  - **Overlays**: Modal, ConfirmModal, Drawer, Popover, Dropdown, Tooltip
  - **Feedback**: Toast, Spinner, Skeleton, PageLoader, EmptyState, Badge, Progress
  - **Data Display**: Card, StatCard, ExpandableCard, Table, InfiniteScrollTable, VirtualScrollList, DragDropList, Avatar, AvatarGroup, Accordion, Sparkline
  - **Utils**: ScreenReaderOnly, CopyToClipboardButton, ThemeSwitcher

  ## Accessibility
  - WCAG 2.1 AA compliant
  - Focus visible rings (focus-visible)
  - ARIA labels, roles, live regions
  - Keyboard navigation
  - Reduced motion support
  - Color scheme (light/dark) with native scrollbars

  ## Styling
  - Tailwind CSS v4 with design tokens
  - CSS variables for theming
  - Pre-compiled CSS (`styles.css`) and source (`theme.css`)
  - Container queries ready

  ## Breaking changes
  - Package renamed from `emc-ui` to `@emc-dev/ng-ui`
  - Requires Angular 22+ and @lucide/angular 1.28+
  - All components are standalone

  ## Migration

  ```bash
  pnpm remove emc-ui
  pnpm add @emc-dev/ng-ui @angular/animations @angular/cdk @angular/common @angular/core @angular/forms @angular/router @lucide/angular
  ```

  Update imports:

  ```diff
  - import { ButtonComponent } from "emc-ui";
  + import { ButtonComponent } from "@emc-dev/ng-ui";
  ```

  Import styles:

  ```diff
  - import "emc-ui/styles.css";
  + import "@emc-dev/ng-ui/styles.css";
  ```
