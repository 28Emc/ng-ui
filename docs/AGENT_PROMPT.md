# Prompt para agente de IA (opencode / similar)

> Copia todo el bloque de abajo (desde "## Rol y objetivo" hasta el final) y pégalo como
> prompt inicial en tu agente. Está en inglés porque los agentes de codificación siguen
> instrucciones técnicas con más precisión en ese idioma, pero puedes traducirlo si prefieres.

---

## Rol y objetivo

You are setting up a pnpm monorepo that contains an **Angular component library**
(design system) plus a **demo app** that showcases every component. The library must
later be publishable to a private/public npm registry. Work in small, verifiable steps —
after each step, the workspace must build and run without errors before moving to the next.

## Tech stack

- **Package manager:** pnpm (workspace via `pnpm-workspace.yaml`)
- **Framework:** Angular (latest stable), **standalone components only** — no NgModules
- **Library packaging:** `ng-packagr` (via `ng generate library`)
- **Styling:** Tailwind CSS v4, config **entirely in CSS** via `@theme` (no `tailwind.config.js`) — mirror the token file given below verbatim
- **Styles distribution — IMPORTANT:** the consuming application must **not** need Tailwind installed or configured. The `ui` library build must compile Tailwind against its own source (templates in `projects/ui/src/lib/**`) and emit a single self-contained `styles.css` bundled as an `ng-package.json` asset, published as e.g. `dist/ui/styles.css` and importable as `emc-ui/styles.css`. Do **not** rely on the consumer's Tailwind `content` globs picking up `node_modules/emc-ui/**` — that pattern is fragile and silently breaks if the consumer forgets to configure it.
- **Icons:** `lucide-angular` (Angular port of lucide, same icon set as the source React app)
- **Utility for class merging:** `clsx` + `tailwind-merge` (same packages the source app uses, framework-agnostic)
- **Forms:** Reactive Forms — form-capable components (`Input`, `Textarea`, `Select`, `Switch`) must implement `ControlValueAccessor`
- **Overlay-based components** (`Modal`, `Drawer`, `Dropdown`): use `@angular/cdk/overlay`, not manual DOM portals

## Workspace structure

```
design-system/
  pnpm-workspace.yaml
  package.json
  projects/
    ui/                          ← the publishable library
      src/
        lib/
          button/
          input/                 ← Input, Textarea, Select, Label, Field, FieldError
          card/                  ← Card, CardHeader, CardBody, StatCard
          modal/                 ← Modal, ConfirmModal
          drawer/
          dropdown/               ← Dropdown, MenuItem, MenuDivider
          switch/
          avatar/
          feedback/               ← Spinner, PageLoader, Skeleton, Badge, EmptyState
          styles/
            theme.css             ← the @theme token file (see below), imported by the library AND the demo
          public-api.ts           ← barrel export of everything above
      ng-package.json
      package.json                ← published package metadata (name it @<scope>/ui, placeholder scope for now)
    demo/                         ← Angular app that imports from the built library, one route/page per component with all variants rendered
  README.md                       ← how to build the lib, run the demo, and publish
```

## Design tokens — copy this into `projects/ui/src/lib/styles/theme.css` verbatim

```css
@import 'tailwindcss';
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;

  --color-brand-50: #e8f7f4;
  --color-brand-100: #c7ece5;
  --color-brand-200: #95dccd;
  --color-brand-300: #5cc8b4;
  --color-brand-400: #32b49f;
  --color-brand-500: #15a18b;
  --color-brand-600: #0c8b7c;
  --color-brand-700: #0b7064;
  --color-brand-800: #0c5a51;
  --color-brand-900: #0c4a43;

  --color-accent-gold: #bfa23a;
  --color-accent-coral: #c2706a;
  --color-accent-purple: #7e6cc0;
  --color-accent-blue: #6f86c9;

  --radius-xl: 0.875rem;
  --radius-2xl: 1.125rem;

  --shadow-soft: 0 1px 2px rgba(16, 24, 40, 0.04), 0 4px 16px rgba(16, 24, 40, 0.01);
  --shadow-card: 0 1px 3px rgba(16, 24, 40, 0.05), 0 12px 32px -12px rgba(16, 24, 40, 0.12);
  --shadow-pop: 0 12px 40px -8px rgba(16, 24, 40, 0.22);

  --animate-fade-in: fade-in 0.25s ease-out;
  --animate-slide-up: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  --animate-scale-in: scale-in 0.18s ease-out;
  --animate-pop: pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  --animate-slide-in-right: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  60% {
    transform: scale(1.12);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@utility bg-brand-gradient {
  background-image: linear-gradient(145deg, #32b49f 0%, #0c8b7c 100%);
}
@utility text-brand-gradient {
  background-image: linear-gradient(145deg, #32b49f, #0c8b7c);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

:root {
  --app-bg: #ffffff;
  --surface: #ffffff;
  --surface-2: #f8fafc;
  --border: #e8ebf0;
  --fg: #0f172a;
  --fg-muted: #64748b;
}
.dark {
  --app-bg: #0a0c12;
  --surface: #12151d;
  --surface-2: #171b25;
  --border: #232936;
  --fg: #e9edf4;
  --fg-muted: #8a93a6;
}

@layer base {
  * {
    border-color: var(--border);
  }
  html {
    scroll-behavior: smooth;
  }
  body {
    margin: 0;
    background-color: var(--app-bg);
    color: var(--fg);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  ::selection {
    background: var(--color-brand-500);
    color: white;
  }
}

@layer utilities {
  .bg-app {
    background-color: var(--app-bg);
  }
  .bg-surface {
    background-color: var(--surface);
  }
  .bg-surface-2 {
    background-color: var(--surface-2);
  }
  .text-fg {
    color: var(--fg);
  }
  .text-muted {
    color: var(--fg-muted);
  }
  .border-default {
    border-color: var(--border);
  }
  .glass {
    background: color-mix(in srgb, var(--surface) 72%, transparent);
    backdrop-filter: blur(14px) saturate(160%);
  }
  .scrollbar-thin::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 999px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
}
```

## Component specs

Implement each as a **standalone Angular component**. Match these APIs exactly (prop
names as `@Input()`s), so consumers migrating from the React version recognize them
immediately.

### `Button`

- `@Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'subtle' = 'primary'`
- `@Input() size: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' = 'md'`
- `@Input() loading = false` → shows a spinning `Loader2` icon, disables the button
- `@Input() disabled = false`
- Variant/size class maps identical in spirit to the source (gradient primary, bordered secondary, etc. — see DESIGN.md if available, otherwise use sensible teal-brand equivalents)
- Focus-visible ring in brand-500 at 50% opacity, `active:scale-[.98]`

### `Input` / `Textarea` / `Select` / `Label` / `Field` / `FieldError`

- Shared base field styling: `surface-2/60` background, brand-colored focus ring (`ring-4` at 12% opacity), red border/ring when `invalid`
- All three (`Input`, `Textarea`, `Select`) implement `ControlValueAccessor` so they work with `formControlName`
- `Field` is a composition wrapper: `label` + projected control + `hint`/`error` text
- `Select` needs a custom chevron background (SVG data-URI, matches source) since native selects need appearance reset

### `Card` / `CardHeader` / `CardBody` / `StatCard`

- `Card`: `@Input() hover = false` → adds elevation + `-translate-y-0.5` on hover
- `StatCard`: `@Input() icon`, `label`, `value`, `sublabel`, `accent: 'brand' | 'green' | 'amber' | 'pink' = 'brand'`

### `Modal` / `ConfirmModal`

- Use CDK Overlay. `@Input() open`, `open` change closes on outside click, `Escape` key, and body scroll lock while open
- `@Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md'` maps to max-width
- `ConfirmModal` wraps `Modal` with Cancel/Confirm footer buttons, `@Input() danger` swaps confirm button to `danger` variant

### `Drawer`

- Right-side slide-in panel, same overlay/escape/scroll-lock behavior as Modal
- `@Input() width` (max-width class), header with title/subtitle + close button, scrollable body, optional footer

### `Dropdown` / `MenuItem` / `MenuDivider`

- Click-to-open floating panel, closes on outside click and on item click
- `@Input() align: 'left' | 'right' = 'right'`
- `MenuItem`: `@Input() danger` for destructive actions (red hover state)

### `Switch`

- Custom toggle (not native checkbox), implements `ControlValueAccessor`
- `@Input() label`, `description`

### `Avatar`

- `@Input() name`, `color` (background hex), `size: 'sm' | 'md' | 'lg' = 'md'`
- Renders initials computed from `name`

### Feedback group: `Spinner`, `PageLoader`, `Skeleton`, `Badge`, `EmptyState`

- `Spinner`: spinning brand-colored icon
- `PageLoader`: centered spinner + label, used for full-page loading states
- `Skeleton`: pulsing placeholder block
- `Badge`: `@Input() variant: 'default' | 'brand' | 'green' | 'amber' | 'gray' = 'default'`
- `EmptyState`: `@Input() icon`, `title`, `description`; content-projected `action` slot

## Global interaction rules (apply everywhere)

1. Never hardcode a hex color in a component — always use the semantic tokens (`text-fg`, `bg-surface`, etc.) or brand scale
2. Every interactive element gets `focus-visible:ring-2 ring-brand-500/50` and a 150–200ms transition
3. Default radius `rounded-xl`; `rounded-2xl` only on large containers (cards, modals, drawers)
4. Floating elements (modal, dropdown, drawer) use `shadow-pop` + entrance animation (`scale-in` or `slide-in-right`)
5. Icons from `lucide-angular`, `stroke-width` 1.8–2, never filled

## Demo app requirements

- One route per component (or grouped by category: Inputs, Overlays, Feedback, Layout)
- Each page renders **every variant × size combination** side by side, with the prop values labeled
- Include a dark-mode toggle in the demo shell (adds/removes `.dark` on `<html>`) so both themes are checkable at a glance
- Demo imports components **only** from the built library entry point (`@<scope>/ui`), never via relative paths into `projects/ui/src` — this validates the public API surface

## Execution plan (do these in order, verify build after each)

1. Scaffold pnpm workspace + Angular workspace with `projects/ui` (library) and `projects/demo` (app)
2. Wire Tailwind v4 into both projects, drop in `theme.css`, confirm base styles render in the demo shell
3. Implement `Button`, `Badge`, `Avatar`, `Spinner` first (no overlay/forms complexity) — get the build + publish-from-dist pipeline working end to end early
4. Implement form components (`Input`, `Textarea`, `Select`, `Switch`) with `ControlValueAccessor`
5. Implement `Card`/`StatCard`
6. Implement overlay components (`Modal`, `ConfirmModal`, `Drawer`, `Dropdown`) with CDK Overlay
7. Implement remaining `Feedback` components (`PageLoader`, `Skeleton`, `EmptyState`)
8. Build the demo pages for every component
9. Set up the Tailwind build step that emits a single compiled `styles.css` from `projects/ui/src/lib/**`, wire it into `ng-package.json` as an asset, and confirm it appears at `dist/ui/styles.css` after `ng build ui`
10. Verify `ng build ui` produces a clean `dist/ui` with type definitions **and** `styles.css`, then dry-run `pnpm publish --dry-run` from `dist/ui`
11. Write `projects/ui/README.md` (ships inside the published package — consumer-facing: install, peer deps, importing `styles.css`, dark mode toggle, per-component usage, theming/token overrides) and the workspace-root `README.md` (contributor-facing: how to run the demo, how to build/publish the library)

## Definition of done

- `pnpm install` at the workspace root succeeds
- `ng build ui` succeeds with no errors/warnings
- `ng serve demo` runs and every component page renders correctly in both light and dark mode
- No component in `projects/ui` imports anything from `projects/demo`
- All form components work correctly with `formControlName` in a real `FormGroup`
- `dist/ui` contains a self-contained `styles.css`; a fresh Angular app with **no Tailwind installed** can consume the library and render it correctly by only importing that one stylesheet
- `projects/ui/README.md` exists and a developer who has never seen this repo could install and use the library from it alone
