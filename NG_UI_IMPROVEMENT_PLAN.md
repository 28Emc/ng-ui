# Plan de Mejora · ng-ui (Documentación Storybook + Backlog de Librería)

> **Estado:** PARTE A (Storybook) ✅ COMPLETADA — PARTE B (mejoras de librería) 🔄 BACKLOG ABIERTO.
> **Alcance:** Repositorio `ng-ui` (`D:\Trabajo\Repositorios\Front\ng-ui`). No se modifican otros repositorios.
> **Stack verificado:** `@storybook/angular-vite@10.5.7`, `@storybook/addon-docs@10.5.7`, `@storybook/addon-a11y@10.5.7`, `@storybook/addon-vitest@10.5.7`, Angular 22, TypeScript 6, Tailwind v4, pnpm 11.

---

## PARTE A — Plan de Mejora de Documentación Storybook ✅ COMPLETADO

### 1. Decisiones certificadas

| # | Pregunta | Decisión |
|---|----------|----------|
| 1 | Alcance de la ejecución | **Plan completo por fases (1 → 4)** |
| 2 | Motor de tests de historias | **`@storybook/addon-vitest`** (recomendado: `vitest` + `jsdom` ya instalados, integración nativa con `angular-vite`) |
| 3 | Taxonomía de títulos | **Grupos unificados**: Inputs / Pickers / Data Display / Overlays / Feedback / Navigation / Forms / Actions / Accessibility |

### 2. Diagnóstico — estado inicial

| # | Categoría | Problema | Resuelto |
|---|-----------|----------|----------|
| 1 | Riesgo técnico | `@storybook/test@8.6.15` desalineado con Storybook 10.5.7 | ✅ F1 |
| 2 | Riesgo técnico | `axe-core@4.13.0` pinnado en devDeps | ✅ F1 |
| 3 | Riesgo técnico | README documenta `pnpm build:styles` (script real: `tw:build`) | ✅ F1 |
| 4 | Riesgo técnico | Script `storybook` no regenera `styles.css` | ✅ F1 |
| 5 | Addons | Sin addon-interactions (core en v10) | ✅ F2 |
| 6 | Addons | Sin `@storybook/addon-vitest` | ✅ F2 |
| 7 | Consistencia | Títulos de sidebar mezclados | ✅ F2 |
| 8 | Consistencia | MDX con tablas de inputs manuales | ✅ F3 |
| 9 | Cobertura | Sin stories: `UiIcon`, `Radio`, `Field`, `LocaleService`, utils, tokens | ✅ F3 |
| 10 | Cobertura | Sin MDX dedicado (15 componentes) | ✅ F3 |
| 11 | Calidad | Cero `argTypes` en las 58 stories | ✅ F3 |
| 12 | Calidad | Sin `parameters.a11y` global ni aserción a11y | ✅ F4 |
| 13 | Calidad | Sin `manager.ts` ni `preview-head.html` (fuente Inter) | ✅ F2 |
| 14 | Calidad | Play coverage bajo (8/58) | ✅ F4 |

### 3. Ejecución por fases

#### Fase 1 — Estabilización de dependencias y scripts ✅ COMPLETADO

- [x] `package.json`: eliminar `@storybook/test@8.6.15` (en Storybook 10 la API vive en `storybook/test`)
- [x] Migrar las 8 importaciones de `@storybook/test` → `storybook/test`
- [x] Eliminar el pin de `axe-core@4.13.0`
- [x] Añadir `"prestorybook": "pnpm tw:build"`
- [x] `README.md`: corregir tabla de scripts
- [x] Verificar: `pnpm install`, `pnpm lint`, `pnpm build-storybook`

#### Fase 2 — Config global de Storybook ✅ COMPLETADO

> Nota de ejecución: `@storybook/addon-interactions` ya no existe como addon — desde Storybook 9 el panel Interactions vive en el core (`storybook`).

- [x] Instalar `@storybook/addon-vitest@^10.5.7`
- [x] `.storybook/main.ts`: addon-vitest + `docs: { defaultName: 'Documentation' }`
- [x] `.storybook/preview.ts`: `tags: ['autodocs']`, `docs.toc`, `a11y.test` (luego ajustado en F4)
- [x] `.storybook/preview-head.html`: Google Fonts Inter
- [x] `.storybook/manager.ts`: branding
- [x] Taxonomía: renombrar títulos (21 archivos)
- [x] Verificar: `pnpm build-storybook` + `index.json`

#### Fase 3 — Docs de calidad ✅ COMPLETADO

- [x] `argTypes` + descripciones + `control` en historias clave (Button, Badge, Input, Field, Rating, Progress, Checkbox, Switch, Combobox, Modal, Tooltip)
- [x] Actions de outputs con `fn()`: Table (`rowClick`), ConfirmModal (`confirm`/`cancelled`), OtpInput (`complete`), ThemeSwitcher (`themeChange`)
- [x] Plantilla MDX unificada + eliminación de tablas manuales (`button`, `feedback`, `input`, `card`)
- [x] 15 MDX nuevos (`image`, `tree-view`, `otp-input`, `file-upload`, `carousel`, `confirm-modal`, `stat-card`, `context-menu`, `select`, `textarea`, `label`, `field-error`, `field`, `ui-icon`, `radio`)
- [x] Stories nuevas: `icon/ui-icon`, `radio/radio`, `input/field` + páginas `styles/tokens`, `locale/locale`, `utils/utils`
- [x] Corregir referencias rotas por renombrado (Badge/StatCard `Green/Amber` → `Success/Warning`)
- [x] Verificar: `pnpm lint` + `pnpm build-storybook`

#### Fase 4 — Tests interactivos, a11y y CI ✅ COMPLETADO

> **Notas de ejecución (API real en Storybook 10.5.7):**
> - `expect(...).toHaveNoViolations()` **NO existe** en `@storybook/addon-a11y` v10 (verificado en `node_modules`). La aserción a11y se inyecta automáticamente en el runner de vitest según `parameters.a11y.test`; **solo el modo `'todo'` es blando** (reporta violaciones sin romper el test). Cualquier otro modo (incluido `'automatic'`) falla el test ante violaciones.
> - Con `test: 'error'` global, **66/237 tests** fallaban por un backlog real de a11y del design system → **decisión:** global `todo` + estricto `error` por componente en historias limpias; el backlog se curará en la **Parte B (Fase 5)**.
> - El `expect` de `storybook/test` **no hace auto-retry** (es one-shot). Las aserciones de visibilidad tras interacción/animación requieren envolverse en `waitFor`.

- [x] Deps y config: `@vitest/browser@^4`, `@vitest/browser-playwright@^4`, `playwright`; `.storybook/vitest.config.ts`; script `"test:storybook": "vitest run --config .storybook/vitest.config.ts"`
- [x] a11y: global `test: 'todo'`; `test: 'error'` en la meta de **35 historias limpias** (Button, Checkbox, Switch, Rating, Progress, Input, Field, Label, FieldError, MaskedInput, Textarea, DatePicker, TreeView, Pagination, Toast, Tooltip, Carousel, OtpInput, FileUpload, Breadcrumb, Radio, StatCard, Icon, ThemeSwitcher, CopyToClipboardButton, InfiniteScrollTable, Image, ScreenReaderOnly, PageLoader, EmptyState, SkipLink, Skeleton, Spinner, Sparkline, ExpandableCard)
- [x] `play` nuevas: Checkbox (`aria-checked`), Switch (toggle), Rating (click + foco), Modal (Esc cierra), Tabs (`aria-selected`), Stepper (`aria-current`), Button Loading (`disabled` + `aria-busy`)
- [x] Plays pre-existentes corregidos con `waitFor` (8): Accordion, Combobox, ContextMenu, Dropdown (×2), Popover, Modal, Stepper
- [x] Bug de story: `FileUpload` sin `args.accept` rompía `accept().join(',')` (patrón a vigilar → Parte B, 5.4)
- [x] Chromatic: `modes` light/dark, `viewports [390, 768, 1280]`, `diffThreshold 0.3`
- [x] CI: paso `pnpm test:storybook` en `.github/workflows/ci.yml`
- [x] Verificar: `pnpm lint` + `pnpm test:storybook` → **237 tests / 61 archivos, todos pasan**. `pnpm chromatic` pendiente de token (opcional).

---

## PARTE B — Backlog de mejoras de la librería (post-Storybook) 🔄 ABIERTO

> Backlog surgido de la auditoría a11y (66 violaciones axe medidas) y de la revisión del código fuente durante las fases 1–4. Ordenado por impacto/beneficio.

### 5. Accesibilidad — contraste y ARIA (mayor impacto)

#### 5.1 Contraste de color (nivel token) — fallos medidos por axe

- [x] Texto `brand-600 #0c8b7c` sobre superficies claras = **4.2:1** (< 4.5 AA) → usar `brand-700 #0b7064` (5.5:1) en: tabs activos, chips de taginput, paginación de tabla, badges. Verificar usos en `tabs.stories`, `taginput`, `table`.
- [x] Badges semánticos con texto blanco bajo AA: `success #16a34a` ≈ 3.3, `warning #d97706` ≈ 3.0, `accent-coral #c2706a` ≈ 3.6, `accent-purple #7e6cc0` ≈ 4.4. Definir pares seguros (variantes 700 con tinte claro o token `--text-on-<color>`).
- [ ] Revisar usos con alpha (`text-muted/60`, `text-muted/70`) que degradan `--fg-muted #64748b`.
- [x] Verificar contraste también en dark mode (`--fg-muted #8a93a6` sobre `--surface #12151d`).

#### 5.2 ARIA estructural

- [x] Sidebar: `aria-expanded`/`role` en filas `<a>` y `role=menuitem` en flyout (violación `aria-allowed-attr` de axe).
- [x] Iconos decorativos sin `aria-hidden` (lucide inline en botones/filas).
- [x] `aria-labelledby` rotos apuntando a `#null` (overlays/pickers).
- [x] Inputs de pickers con label accesible real (timepicker usa `aria-label` fijo hardcodeado).
- [x] Landmarks únicos en composiciones (stories) — documentar patrón.

#### 5.3 Estrategia de cierre

- [x] Subir historias del modo global `todo` → `error` por componente a medida que se corrigen (35/61 ya estrictas; cerrar las 26 restantes). Global en `.storybook/preview.ts` elevado a `test: 'error'`: **61/61 archivos y 237/237 tests estrictos en light + dark, sin violaciones**.

### 6. i18n — consistencia de idioma (LocaleService)

- [ ] Solo 7 componentes usan `LocaleService` (datepicker, daterangepicker, drawer, modal, toast, skip-link). Mover strings hardcodeados a `UiStringKey`: timepicker ("Seleccionar hora", "Alternar hora"), combobox ("Alternar opciones"), pagination, table, drag-drop-list, carousel, multiselect, taginput, sidebar, breadcrumb.
- [ ] Tests de claves es/en (completitud de `UiStringKey`).

### 7. IDs deterministas

- [ ] Crear utilidad `uid()` (contador + prefijo) y reemplazar los 8 usos de `Math.random().toString(36)` en: accordion, expandable-card, form-section, radio-group, tabs, file-upload, toast, drag-drop-list. Previene mismatches de hydration/SSR y tests no deterministas. (Combobox ya usa `++uidCounter` — unificar el patrón.)

### 8. Robustez de API

- [ ] Revisar `input()` con arrays/objetos default frente a `undefined` explícito (bug real: `FileUpload.accept` → `accept().join(',')`). Aplicar guardas `?? []` o `transform` en `options`, `accept`, `files`, `items`, etc.

### 9. Testing y CI

- [ ] Subir cobertura de plays de teclado/foco en pickers, tree-view, carousel, drawer.
- [ ] Evaluar umbral de cobertura (`@vitest/coverage-v8`) en CI.
- [ ] Chromatic: revisar `--exit-zero-on-changes` (aceptar snapshots explícitos).

### 10. Documentación

- [ ] Página `Accessibility` en Storybook: patrones ARIA por componente, decisiones de contraste, soporte de teclado.
- [ ] Guía de contribución: historias con `a11y.test: 'error'` + uso de `waitFor` (el `expect` es one-shot).

---

## 11. Orden de ejecución y verificación

```
PARTE A:
1. Fase 1  → pnpm install && pnpm lint && pnpm build-storybook      ✅
2. Fase 2  → pnpm build-storybook (sidebar + a11y + branding)       ✅
3. Fase 3  → pnpm lint && pnpm build-storybook (autodocs)           ✅
4. Fase 4  → pnpm test:storybook && pnpm chromatic                  ✅

PARTE B (backlog):
5. Fase 5  → 5.1 contraste → 5.2 ARIA → 5.3 subir 'error'           ✅
6. Fase 6  → i18n (UiStringKey) + uid() + robustez de API          🔄
7. Fase 7  → testing/CI + página Accessibility + guía de contribución 🔄
```

**Comandos de verificación:**
```bash
pnpm lint
pnpm build-storybook
pnpm test:storybook
pnpm chromatic
```

---

## 12. Restricciones

> ❌ No modificar el repositorio `d:/Trabajo/Repositorios/Front/demo/` ni `emc-ui/` salvo indicación explícita.
> ✅ Solo editar archivos dentro de `d:/Trabajo/Repositorios/Front/ng-ui/`.
> ✅ Respetar el estilo existente de stories (inline `template`, `moduleMetadata`, `StoryObj`).
> ✅ Mantener `@storybook/angular-vite` (no migrar a Webpack).
