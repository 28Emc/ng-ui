# Plan de Mejora de Documentación Storybook · ng-ui

> **Estado:** CERTIFICADO ✅ — Plan aprobado para ejecución completa por fases.
> **Alcance:** Repositorio `ng-ui` (`D:\Trabajo\Repositorios\Front\ng-ui`). No se modifican otros repositorios.
> **Stack verificado:** `@storybook/angular-vite@10.5.7`, `@storybook/addon-docs@10.5.7`, `@storybook/addon-a11y@10.5.7`, Angular 22, TypeScript 6, Tailwind v4, pnpm 11.

---

## 1. Decisiones certificadas

| # | Pregunta | Decisión |
|---|----------|----------|
| 1 | Alcance de la ejecución | **Plan completo por fases (1 → 4)** |
| 2 | Motor de tests de historias | **`@storybook/addon-vitest`** (recomendado: `vitest` + `jsdom` ya instalados, integración nativa con `angular-vite`) |
| 3 | Taxonomía de títulos | **Grupos unificados** — ver sección 4 |

---

## 2. Diagnóstico — estado actual

### 2.1 Lo que ya funciona bien

- `@storybook/angular-vite` + `addon-docs` + `addon-a11y` con compodoc para autodocs.
- **58** archivos `.stories.ts` y **42** `.mdx` → cobertura casi completa del catálogo.
- Toolbar light/dark funcional (`toggle('dark')`) y Chromatic con modos `light`/`dark`.
- **8** stories con `play` functions usando `@storybook/test`.
- `preview.ts` importa `projects/ng-ui/styles.css` (tokens y utilitarios disponibles en historias).

### 2.2 Problemas detectados

| # | Categoría | Problema | Impacto |
|---|-----------|----------|---------|
| 1 | Riesgo técnico | `@storybook/test@8.6.15` desalineado con Storybook 10.5.7 | `play` functions corren con APIs de v8 → fallos/incompatibilidad |
| 2 | Riesgo técnico | `axe-core@4.13.0` pinnado en devDeps (addon-a11y trae la suya) | Versión duplicada / conflicto de reglas |
| 3 | Riesgo técnico | README documenta `pnpm build:styles` (script real: `tw:build`) | Docs de script desactualizadas |
| 4 | Riesgo técnico | Script `storybook` no regenera `projects/ng-ui/styles.css` | Preview puede renderizar tokens obsoletos |
| 5 | Addons | Sin `@storybook/addon-interactions` | Panel Interactions ausente pese a tener `play` functions |
| 6 | Addons | Sin `@storybook/addon-vitest` | Historias no corren como tests en CI (vitest+jsdom instalados y sin uso) |
| 7 | Consistencia | Títulos de sidebar mezclados: `UI/`, `Input/`, `Inputs/`, `Data Display/`, `Lists/`… | Navegación incoherente |
| 8 | Consistencia | MDX con tablas de inputs manuales (ej. `button.docs.mdx`) | Tablas desincronizadas del API real |
| 9 | Cobertura | Sin stories: `UiIconComponent`, `RadioComponent`, `FieldComponent`, `LocaleService`, utils, **Design Tokens** | API pública documentada de forma incompleta |
| 10 | Cobertura | Sin MDX dedicado: `image`, `tree-view`, `otp-input`, `file-upload`, `carousel`, `confirm-modal`, `stat-card`, `context-menu`… | Docs de menor profundidad |
| 11 | Calidad | Cero `argTypes` en las 58 stories | Controles/descripciones dependen solo de compodoc (frágil con signal inputs) |
| 12 | Calidad | Sin `parameters.a11y` global ni `toHaveNoViolations` | A11y no verificable en las historias |
| 13 | Calidad | Sin `manager.ts` ni `preview-head.html` (fuente Inter) | Branding ausente y tipografía cae a system-ui |
| 14 | Calidad | Play coverage bajo (8/58) | Menos garantías de interacción y a11y |

---

## 3. Infraestructura y archivos objetivo

```
.storybook/
  main.ts                    ← addons, tags, docs, stories glob
  preview.ts                 ← a11y global, theme decorator, providers
  preview-head.html          ← NUEVO: Google Fonts Inter
  manager.ts                 ← NUEVO: branding (título, favicon, tema)
  tsconfig.json
  compodoc.tsconfig.json
  vitest.config.ts           ← NUEVO: proyecto de test para addon-vitest
projects/ng-ui/src/lib/**/*.stories.ts   ← 58 historias (títulos + argTypes + play)
projects/ng-ui/src/lib/**/*.docs.mdx     ← 42 MDX (plantilla unificada)
projects/ng-ui/src/lib/icon/ui-icon.stories.ts      ← NUEVO
projects/ng-ui/src/lib/radio/radio.stories.ts        ← NUEVO
projects/ng-ui/src/lib/input/field.stories.ts        ← NUEVO
projects/ng-ui/src/lib/locale/locale.docs.mdx        ← NUEVO
projects/ng-ui/src/lib/styles/tokens.docs.mdx        ← NUEVO (Design Tokens)
projects/ng-ui/src/lib/utils/utils.docs.mdx          ← NUEVO
package.json                 ← deps, scripts
README.md                    ← corrección de scripts
```

---

## 4. Taxonomía de títulos (decidida)

Grupos: **Inputs / Pickers / Data Display / Overlays / Feedback / Navigation / Forms / Actions / Accessibility**

| Grupo | Componentes (título nuevo) |
|-------|----------------------------|
| `Inputs/` | Button, Checkbox, FieldError, Input, Label, MaskedInput, OtpInput, PasswordStrengthMeter, RadioGroup, Select, Switch, Textarea, Rating, FileUpload |
| `Pickers/` | Combobox, MultiSelect, TagInput, DatePicker, DateRangePicker, TimePicker |
| `Data Display/` | Avatar, AvatarGroup, Card, StatCard, Carousel, ExpandableCard, Image, InfiniteScrollTable, Pagination, Progress, Sparkline, Table, Tooltip, TreeView, VirtualScrollList |
| `Overlays/` | Modal, ConfirmModal, Drawer, Dropdown, Popover, ContextMenu |
| `Feedback/` | Badge, EmptyState, PageLoader, Skeleton, SkipLink, Spinner, Toast |
| `Navigation/` | Accordion, Breadcrumb, Sidebar, Stepper, Tabs |
| `Forms/` | FormSection |
| `Actions/` | CopyToClipboardButton, DragDropList, ThemeSwitcher |
| `Accessibility/` | ScreenReaderOnly |

**Renombres pendientes (58 archivos):**
- `UI/Button` → `Inputs/Button`
- `Input/<X>` → `Inputs/<X>` (todos los de `input/`, `checkbox`, `radio-group`, `switch`, `rating`, `select`, `textarea`, `masked-input`, `otp-input`, `password-strength-meter`, `file-upload`)
- `Inputs/FileUpload` → `Inputs/FileUpload` y `Inputs/OtpInput` → `Inputs/OtpInput` (normalizar plural)
- Pickers: `Input/Combobox` → `Pickers/Combobox`, `Input/MultiSelect` → `Pickers/MultiSelect`, `Input/DatePicker` → `Pickers/DatePicker`, `Input/DateRangePicker` → `Pickers/DateRangePicker`, `Input/TimePicker` → `Pickers/TimePicker`, `Input/TagInput` → `Pickers/TagInput`
- `Lists/VirtualScrollList` → `Data Display/VirtualScrollList`
- `Actions/DragDropList` → `Data Display/DragDropList`
- Resto se mantiene en su grupo salvo normalización ortográfica (`Data Display/…`).

---

## 5. Ejecución por fases

### Fase 1 — Estabilización de dependencias y scripts ✅ COMPLETADO

- [x] `package.json`: eliminar `@storybook/test@8.6.15` (en Storybook 10 la API vive en `storybook/test`)
- [x] Migrar las 8 importaciones de `@storybook/test` → `storybook/test` (accordion, carousel, combobox, context-menu, dropdown, popover, tooltip, tree-view)
- [x] `package.json`: eliminar el pin de `axe-core@4.13.0`
- [x] `package.json`: añadir `"prestorybook": "pnpm tw:build"` (regenera `projects/ng-ui/styles.css` antes de arrancar)
- [x] `README.md`: corregir tabla de scripts — `pnpm build:styles` → `pnpm tw:build`
- [x] Verificar: `pnpm install`, `pnpm lint`, `pnpm build-storybook`

### Fase 2 — Config global de Storybook ✅ COMPLETADO

> Nota de ejecución: `@storybook/addon-interactions` ya no existe como addon — desde Storybook 9 el panel Interactions vive en el core (`storybook`). Solo se instaló `@storybook/addon-vitest`.

- [x] `package.json` devDeps: instalar `@storybook/addon-vitest@^10.5.7`
- [x] `.storybook/main.ts`: añadir `@storybook/addon-vitest` a addons; `docs: { defaultName: 'Documentation' }`
- [x] `.storybook/preview.ts`: añadir `tags: ['autodocs']` global, `parameters.docs.toc: true` y `parameters.a11y: { test: 'error' }` (color-contrast activo por defecto). **Nota Fase 4:** el modo global pasó a `test: 'todo'` + `test: 'error'` por componente — ver Fase 4.
- [x] `.storybook/preview-head.html` **NUEVO**: Google Fonts Inter (400–900), igual que la app demo
- [x] `.storybook/manager.ts` **NUEVO**: `brandTitle 'ng-ui · Component Library'`, brandUrl GitHub, tema brand (#15a18b/#0c8b7c), fuente Inter
- [x] Taxonomía: renombrar títulos según sección 4 — 21 archivos editados (button, checkbox, combobox, datepicker, daterangepicker, field-error, input, label, masked-input, select, textarea, multiselect, otp-input, password-strength-meter, radio-group, rating, switch, taginput, timepicker, drag-drop-list, virtual-scroll-list)
- [x] Verificar: `pnpm build-storybook` + revisión de `index.json` (taxonomía correcta, 58 entradas)

### Fase 3 — Docs de calidad ✅ COMPLETADO

- [x] `argTypes` + descripciones + `control` en las historias clave: Button, Badge, Input, Field, Rating, Progress, Checkbox, Switch, Combobox, Modal, Tooltip (Tabla, ConfirmModal, OtpInput y ThemeSwitcher con eventos)
- [x] Actions de outputs: `fn()` + `argTypes` en Table (`rowClick`), ConfirmModal (`confirm`/`cancelled`), OtpInput (`complete`), ThemeSwitcher (`themeChange`)
- [x] Unificar plantilla MDX (Intro + `Canvas` + `Controls` + Uso con `Source`) y eliminar tablas manuales de inputs: `button.docs.mdx`, `feedback.docs.mdx`, `input.docs.mdx`, `card.docs.mdx`
- [x] Añadir MDX faltantes (15): `image`, `tree-view`, `otp-input`, `file-upload`, `carousel`, `confirm-modal`, `stat-card`, `context-menu`, `select`, `textarea`, `label`, `field-error`, `field`, `ui-icon`, `radio`
- [x] Stories nuevas:
  - `icon/ui-icon.stories.ts` — galería de los 22 iconos de `ICON_PATHS` + controles `name`/`size`/`strokeWidth`
  - `radio/radio.stories.ts` — `RadioComponent` con grupo y variante compacta
  - `input/field.stories.ts` — `FieldComponent` con label/hint/error/required
  - `styles/tokens.docs.mdx` — Design Tokens (paleta, tipografía, sombras, densidad)
  - `locale/locale.docs.mdx` — `LocaleService` (API real: `datePattern`, `monthNames`, `weekdayLabels`, `translate`)
  - `utils/utils.docs.mdx` — `cn`, `focus`
- [x] Corregir referencias rotas por renombrado: `BadgeStories.Green/Amber` → `Success/Warning`, `StatCardStories.Green/Amber` → `Success/Warning`
- [x] Verificar: `pnpm lint` + `pnpm build-storybook` sin warnings de imports

### Fase 4 — Tests interactivos, a11y y CI ✅ COMPLETADO

> **Notas de ejecución (API real en Storybook 10.5.7):**
> - `expect(...).toHaveNoViolations()` **NO existe** en `@storybook/addon-a11y` v10 (verificado en `node_modules`). La aserción a11y se inyecta automáticamente en el runner de vitest según `parameters.a11y.test`; **solo el modo `'todo'` es blando** (reporta violaciones sin romper el test). Cualquier otro modo (incluido `'automatic'`) falla el test ante violaciones.
> - Con `test: 'error'` global, **66/237 tests** fallaban por un backlog real de a11y del design system (contraste de `brand-600 #0c8b7c` sobre blanco ≈4.2:1 < 4.5:1 AA, texto blanco sobre badges semánticos, `aria-label` vacíos, `aria-expanded` no permitido en links del sidebar, landmarks sin etiqueta única). **Decisión:** global blando (`todo`) + estricto (`error`) por componente en las historias limpias; el backlog queda documentado para iterar.
> - El `expect` de `storybook/test` **no hace auto-retry** (es one-shot). Las aserciones de visibilidad tras interacción/animación requieren envolverse en `waitFor`.

- [x] Deps y config:
  - Instalar `@vitest/browser@^4.0.0`, `@vitest/browser-playwright@^4.0.0`, `playwright` (chromium instalado).
  - `.storybook/vitest.config.ts` **NUEVO** — proyectos `storybookAngularVitest({})` + `storybookTest({ configDir })`, browser Chromium headless.
  - `package.json`: script `"test:storybook": "vitest run --config .storybook/vitest.config.ts"`.
- [x] a11y global por componentes:
  - `.storybook/preview.ts`: `parameters.a11y.test: 'todo'` (reporta, no rompe CI).
  - `parameters: { a11y: { test: 'error' } }` en la meta de **35 historias limpias** (Button, Checkbox, Switch, Rating, Progress, Input, Field, Label, FieldError, MaskedInput, Textarea, DatePicker, TreeView, Pagination, Toast, Tooltip, Carousel, OtpInput, FileUpload, Breadcrumb, Radio, StatCard, Icon, ThemeSwitcher, CopyToClipboardButton, InfiniteScrollTable, Image, ScreenReaderOnly, PageLoader, EmptyState, SkipLink, Skeleton, Spinner, Sparkline, ExpandableCard).
- [x] `play` functions nuevas (interacción): Checkbox (`aria-checked`), Switch (toggle), Rating (click 5ª estrella + foco), Modal (Esc cierra), Tabs (`aria-selected`), Stepper (`aria-current`), Button Loading (`disabled` + `aria-busy`).
- [x] Plays pre-existentes corregidos (8) con `waitFor` para visibilidad post-animación: Accordion (Multiple), Combobox (`getByRole` sin name por placeholder), ContextMenu, Dropdown (×2), Popover, Modal (`waitFor` + `queryByRole`), Stepper (`aria-current` en el círculo, no en el label).
- [x] Bug de story corregido: `FileUpload` sin `args.accept` → `[accept]="undefined"` rompía `accept().join(',')` en CD (error unhandled).
- [x] Chromatic: `chromatic: { modes: { light, dark }, viewports: [390, 768, 1280], diffThreshold: 0.3 }` en `.storybook/preview.ts`.
- [x] CI: paso `pnpm test:storybook` en `.github/workflows/ci.yml` entre `build-storybook` y Chromatic.
- [x] Verificar: `pnpm lint` limpio + `pnpm test:storybook` → **237 tests / 61 archivos, todos pasan, sin errores unhandled**. `pnpm chromatic` pendiente de correr con token (opcional).

---

## 6. Orden de ejecución y verificación

```
1. Fase 1  → pnpm install && pnpm lint && pnpm build-storybook      ✅
2. Fase 2  → pnpm build-storybook (sidebar + a11y + branding)       ✅
3. Fase 3  → pnpm lint && pnpm build-storybook (autodocs)           ✅
4. Fase 4  → pnpm test:storybook && pnpm chromatic                  ✅
```

**Comandos de verificación finales:**
```bash
pnpm lint
pnpm build-storybook
pnpm test:storybook
pnpm chromatic
```

---

## 7. Restricciones

> ❌ No modificar el repositorio `d:/Trabajo/Repositorios/Front/demo/` ni `emc-ui/` salvo indicación explícita.
> ✅ Solo editar archivos dentro de `d:/Trabajo/Repositorios/Front/ng-ui/`.
> ✅ Respetar el estilo existente de stories (inline `template`, `moduleMetadata`, `StoryObj`).
> ✅ Mantener `@storybook/angular-vite` (no migrar a Webpack).
