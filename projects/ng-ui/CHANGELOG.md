# @emc-dev/ng-ui

## 1.3.4

### Patch Changes

- 9ca5a2f: Fase 5 accesibilidad: contraste (brand-700, tokens -strong, avatar ensureContrast), ARIA (attr.id fix, ariaLabel bindings, combobox aria-controls, aria-disabled, landmarks). Suite a11y estricta 237/237 stories light+dark.

## 1.3.3

### Patch Changes

- fix(context-menu): replace `NgComponentOutlet`-based icons with a new `ui-icon` component that renders inline SVG paths, so icon size and stroke width apply correctly. `UiContextMenuItem.icon` is now a string icon name. Add `class` field to `UiContextMenuItem` for custom item styling. Align icons with the label text via a fixed-width icon slot.

## 1.3.2

### Patch Changes

- fix: regenerate styles.css so the published package includes all utility classes used by context-menu, dropdown, modal, drawer and other overlays. Also add `tw:build`/`prebuild` so the CSS is regenerated on every build and can never go stale again.

## 1.3.1

### Patch Changes

- fix(context-menu): viewport clamping + max-width + click toggle + external close
  fix(stepper): clamp activeIndex internally via effect
  feat(skeleton): add width/height/variant inputs with circular/rectangular variants

## 1.3.0

### Minor Changes

- 606aac6: New `ui-carousel` component: `index` two-way model, `loop` with wrap-around, `autoplay` (min 500ms interval, pause on hover), `showArrows`/`showDots`, swipe gestures with a 50px threshold, `aria-current`/`aria-live` announcements, and an automatic index clamp when projected slides shrink.
- 606aac6: Container queries: `ui-card` and `ui-table` now act as query containers (`container-type: inline-size`). `ui-card-header`/`ui-card-body` stack and tighten padding below 24rem and expand above it (`@sm:` variants); `ui-table` cells scale with `@narrow`/`@wide` tokens (new `--container-narrow: 22.5rem` and `--container-wide: 44rem`), the table text compacts under 22.5rem, and the pagination bar stacks on narrow containers and lays out inline above 44rem. New `Responsive` stories demonstrate both behaviors.
- 606aac6: New `ui-context-menu` component: opens on right-click (or `ContextMenu`/`Shift+F10`/arrow keys from the trigger) positioned at the pointer with viewport clamping, `UiContextMenuItem` model with `label`/`icon`/`shortcut`/`danger`/`disabled`/`separator`, `itemSelected` output, WAI-ARIA `menu`/`menuitem` roles, full keyboard navigation (arrows, Home/End, Enter, Space, Escape) and close on outside click.
- 606aac6: New `ui-file-upload` component: drag & drop or click-to-browse dropzone with type/size/count validation (`accept`, `maxSize`, `maxFiles`), image previews via object URLs, reorderable file list (reuses `ui-drag-drop-list`), per-file progress (`ui-progress`), `upload`/`rejected`/`fileRemoved` outputs, and rejection toasts via `ToastService`. New public helpers: `validateUploadFiles`, `matchesAccept`, `fileSizeLabel`, `buildUploadFile`.
- 606aac6: New `ui-image` component (Next.js-style): lazy/eager loading, `priority` (fetchpriority high + sync decoding), responsive `srcset`/`sizes`, blur-up placeholder via `blurSrc`, aspect-ratio reservation from `width`/`height` to avoid CLS, `objectFit`/`objectPosition`, fade-in on load and a localizable failure fallback.
- 606aac6: New `ui-otp-input` component: two-way `value`, configurable `length`, numeric-only or alphanumeric modes, auto-focus, auto-advance while typing, backspace/arrow navigation, paste support, `complete` output when every box is filled, `disabled` state and per-box `aria-label`s in a `role="group"`.
- 606aac6: Design-system maturity: semantic color tokens (`--color-success`/`--color-warning`/`--color-info`/`--color-danger` with automatic light/dark values), motion tokens (`duration-fast/normal/slow`, `ease-standard/emphasized/out-expo`), a display/heading/body/caption typography scale, and `@layer components` primitives (`.kicker`, `.page-title`, `.card-surface`). `ui-badge`, `ui-stat-card`, `ui-toast`, `ui-button` (danger) and field invalid states now use semantic tokens. Density variants via `data-density="compact|spacious"` added to `ui-button` and `ui-input`.
- 606aac6: New `ui-tree-view` component: nested `UiTreeNode` model with `id`/`label`/`children`/`disabled`/`initiallyExpanded`, two-way `selection` (single or multi) and `expandedIds` models, recursive expansion/collapse, WAI-ARIA `tree`/`treeitem` roles with `aria-level`/`aria-expanded`/`aria-selected`, full keyboard navigation (arrows, Enter, Space), and an optional custom `itemTemplate` with `$implicit` node and `depth`.

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
