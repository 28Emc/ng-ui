# Timely Forms AI — Design System

> Extraído del código fuente real (`src/index.css`, `src/components/ui/*`, `src/layouts/*`).
> Framework-agnostic por diseño: los tokens viven en **CSS puro** (Tailwind v4 `@theme` +
> custom properties), no en JS/JSX. Eso significa que este sistema se traslada a Angular
> (o cualquier otro framework) sin reescribir un solo valor — solo cambia la capa de
> componentes que consume las clases.

---

## 1. Filosofía

- **Base neutra + acento teal.** Superficies en blanco/gris muy claro (o casi negro en
  dark mode) con un único color de marca que hace todo el trabajo de jerarquía visual.
- **Tokens semánticos, no literales.** Los componentes nunca usan `bg-white` o `text-black`
  directo — usan `bg-surface`, `text-fg`, `text-muted`, que cambian de valor entre light/dark
  sin tocar ningún componente.
- **Micro-interacción constante.** Casi todo tiene una transición corta (150–300ms) y un
  `active:scale-[.98]` o `hover:-translate-y-0.5`. Nada es estático.
- **Radios grandes y sombras suaves.** `rounded-xl`/`rounded-2xl` en casi todo, sombras
  difusas de baja opacidad en vez de bordes duros.

---

## 2. Design Tokens

### 2.1 Color — escala de marca (teal)

| Token                     | Hex                   | Uso típico                                  |
| ------------------------- | --------------------- | ------------------------------------------- |
| `brand-50`                | `#e8f7f4`             | fondos sutiles (hover, badges)              |
| `brand-100`               | `#c7ece5`             | fondos sutiles dark-adjacent                |
| `brand-200`               | `#95dccd`             | bordes en variante `outline`                |
| `brand-300`               | `#5cc8b4`             | bordes en variante `outline`                |
| `brand-400`               | `#32b49f`             | focus ring, gradiente (extremo claro)       |
| `brand-500`               | `#15a18b`             | ring de foco, selección de texto            |
| `brand-600`               | `#0c8b7c`             | texto de acento, gradiente (extremo oscuro) |
| `brand-700`               | `#0b7064`             | texto sobre fondos claros                   |
| `brand-800` / `brand-900` | `#0c5a51` / `#0c4a43` | fondos oscuros en dark mode                 |

**Gradiente de marca** (para CTAs primarios): `linear-gradient(145deg, #32b49f 0%, #0c8b7c 100%)`

**Acentos decorativos** (para gráficos/analíticas, no para UI de acción):
`accent-gold #bfa23a` · `accent-coral #c2706a` · `accent-purple #7e6cc0` · `accent-blue #6f86c9`

### 2.2 Color — semántico (light / dark)

| Token         | Light     | Dark      |
| ------------- | --------- | --------- |
| `--app-bg`    | `#ffffff` | `#0a0c12` |
| `--surface`   | `#ffffff` | `#12151d` |
| `--surface-2` | `#f8fafc` | `#171b25` |
| `--border`    | `#e8ebf0` | `#232936` |
| `--fg`        | `#0f172a` | `#e9edf4` |
| `--fg-muted`  | `#64748b` | `#8a93a6` |

El dark mode se activa con una clase `.dark` en `<html>` — no con `prefers-color-scheme`,
así que es 100% controlable por el usuario (toggle manual).

### 2.3 Tipografía

- **Familia:** `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`
- **Escala observada:** `text-xs` (11–12px, metadatos) → `text-sm` (cuerpo/UI, el tamaño
  dominante) → `text-base` (botones `lg`) → `text-lg` (títulos de modal/drawer) →
  `text-3xl font-bold tracking-tight` (métricas grandes en `StatCard`)
- **Pesos:** `font-medium` para labels y botones, `font-semibold` para títulos y nombres,
  `font-bold` solo para números destacados

### 2.4 Espaciado y radios

- Radio estándar de tarjetas/inputs: `rounded-xl` (14px) y `rounded-2xl` (18px) — definidos
  como tokens propios `--radius-xl` / `--radius-2xl`, no los valores por defecto de Tailwind.
- Padding interno recurrente: `p-5` (cards, modales, drawers), `px-3.5 py-2.5` (inputs),
  `px-4`/`h-10` (botón `md`)
- Alturas de controles: `h-8` (sm) / `h-10` (md, default) / `h-12` (lg) — consistente entre
  botones e inputs

### 2.5 Sombras

| Token         | Valor                                                                | Uso                                               |
| ------------- | -------------------------------------------------------------------- | ------------------------------------------------- |
| `shadow-soft` | `0 1px 2px rgba(16,24,40,.04), 0 4px 16px rgba(16,24,40,.01)`        | estado default de cards/botones primarios         |
| `shadow-card` | `0 1px 3px rgba(16,24,40,.05), 0 12px 32px -12px rgba(16,24,40,.12)` | hover de cards                                    |
| `shadow-pop`  | `0 12px 40px -8px rgba(16,24,40,.22)`                                | modales, drawers, dropdowns (elementos flotantes) |

### 2.6 Movimiento

| Animación        | Timing                            | Uso                               |
| ---------------- | --------------------------------- | --------------------------------- |
| `fade-in`        | 0.25s ease-out                    | overlays/backdrops                |
| `slide-up`       | 0.3s cubic-bezier(.16,1,.3,1)     | entrada de contenido              |
| `scale-in`       | 0.18s ease-out                    | modales, dropdowns                |
| `pop`            | 0.4s cubic-bezier(.34,1.56,.64,1) | confirmaciones (overshoot bounce) |
| `slide-in-right` | 0.3s cubic-bezier(.16,1,.3,1)     | drawers laterales                 |

Micro-interacciones adicionales en casi todos los elementos clicables:
`active:scale-[.98]`, `hover:brightness-[1.06]` (botón primario), `hover:-translate-y-0.5` (cards).

### 2.7 Iconografía

- Librería: **lucide** (outline icons), `stroke-width` 1.8–2
- Tamaños: `h-4 w-4` (dentro de botones/menús) · `h-5 w-5` (default) · `h-7 w-7` (empty states)

---

## 3. Catálogo de componentes

Cada componente sigue el mismo patrón: **variantes de estilo + tamaños**, resueltos vía
un mapa de clases (no condicionales dispersos).

### Button

- **Variantes:** `primary` (gradiente + sombra), `secondary` (borde + superficie),
  `ghost` (transparente), `danger` (rojo sólido), `outline` (borde de marca), `subtle`
  (fondo de marca tenue)
- **Tamaños:** `sm` (h-8) · `md` (h-10, default) · `lg` (h-12) · `icon` / `icon-sm`
- **Estados:** loading (spinner inline), disabled (`opacity-50`), focus-visible (ring de marca)

### Input / Textarea / Select / Field

- Estilo base compartido entre los tres (`baseField`): fondo `surface-2/60`, borde por
  defecto, foco con `ring-4` de marca al 12% de opacidad
- Estado `invalid`: borde y ring rojos
- `Field` envuelve `Label` + control + `hint`/`FieldError` — patrón de composición, no un
  componente monolítico

### Card / StatCard

- `Card` base + `hover` opcional (elevación + traslado)
- `StatCard`: icono con fondo de color por "accent" (`brand`/`green`/`amber`/`pink`),
  valor grande, sublabel — patrón repetido en dashboards

### Modal / ConfirmModal / Drawer

- Overlay con blur + fade-in, contenido con scale-in (modal) o slide-in-right (drawer)
- Header con título + botón de cierre, body scrollable, footer opcional con acciones
- `ConfirmModal` es un preset de `Modal` para diálogos de confirmación (con variante `danger`)

### Feedback (Spinner, PageLoader, Skeleton, Badge, EmptyState)

- `Skeleton`: pulso animado, `bg-surface-2`
- `Badge`: 5 variantes semánticas (`default`, `brand`, `green`, `amber`, `gray`), forma pill
- `EmptyState`: icono en contenedor redondeado + título + descripción + acción opcional

### Switch

- Toggle binario custom (no `<input type=checkbox>` nativo), thumb blanco deslizante,
  color de marca cuando está activo

### Avatar

- Círculo con iniciales, color de fondo dinámico por usuario, 3 tamaños

### Dropdown / MenuItem / MenuDivider

- Menú flotante controlado por click-outside, alineación `left`/`right`,
  `MenuItem` con variante `danger` para acciones destructivas

---

## 4. Patrones de layout

- **Sidebar tipo "rail":** colapsada a solo-íconos (`w-20`), se expande a `w-64` en hover
  (`group-hover:opacity-100` en los labels) — patrón de navegación persistente
- **Contenido activo:** fondo oscuro (`bg-slate-900` / `bg-white` en dark) sobre el ícono
  activo, no solo un cambio de color de texto
- Scrollbars finas y temizadas (`scrollbar-thin`) en paneles internos (drawer body, sidebar)

---

## 5. Extrapolación a Angular

**El sistema de diseño en sí no cambia nada** — es CSS (Tailwind v4, config vía `@theme`
en `index.css`, sin `tailwind.config.js`). Lo único que cambia es cómo se _consume_ desde
componentes. Guía de migración:

| Pieza React                                            | Equivalente Angular                                                                                                                                                                    |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.css` con `@theme` + custom properties           | **Se copia literal.** Tailwind v4 es agnóstico de framework — se integra vía `@tailwindcss/postcss` en `angular.json` o el builder de Vite/esbuild de Angular. Cero cambios de tokens. |
| `cn()` (clsx + tailwind-merge)                         | Mismo paquete npm, se importa igual en un `.ts` — es JS puro, no JSX.                                                                                                                  |
| Mapa de variantes (`VARIANTS[variant]`, `SIZES[size]`) | `@Input() variant: 'primary' \| 'secondary' \| ...` + un getter que resuelve la clase, aplicado con `[class]` o `[ngClass]` en el template.                                            |
| `forwardRef` en `Input`/`Textarea`/`Select`            | `ControlValueAccessor` — permite que el componente se use con `formControlName` igual que un input nativo.                                                                             |
| `createPortal` (Modal, Drawer)                         | **Angular CDK Overlay** (`cdk-portal` / `OverlayModule`) — mismo concepto de "renderizar fuera del árbol".                                                                             |
| Toggle de dark mode (`.dark` en `<html>`)              | Idéntico — un servicio Angular que hace `document.documentElement.classList.toggle('dark')`.                                                                                           |
| `useEffect` para Escape/scroll-lock en Modal/Drawer    | `ngOnInit`/`ngOnDestroy` + `HostListener('document:keydown.escape')`.                                                                                                                  |

**Recomendación de estructura en Angular:**

```
src/app/ui/
  button/button.component.ts       (variant, size, loading como @Input)
  input/input.component.ts         (ControlValueAccessor)
  card/card.component.ts
  modal/modal.component.ts         (usa CDK Overlay)
  drawer/drawer.component.ts       (usa CDK Overlay)
  dropdown/dropdown.component.ts
  badge/badge.component.ts
  ...
styles.css                         (el mismo @theme, copiado literal)
```

Cada componente Angular expone los mismos nombres de variante (`primary`, `secondary`,
`ghost`, `danger`, `outline`, `subtle`) para que este documento siga siendo la fuente de
verdad, independientemente del framework que lo consuma.

---

## 6. Reglas rápidas (para nuevos componentes)

1. Nunca hardcodear un color hex — usar el token semántico (`text-fg`, `bg-surface`, etc.)
2. Todo elemento interactivo lleva `focus-visible:ring-2 ring-brand-500/50` y una
   transición de 150–200ms
3. Radio por defecto: `rounded-xl`; `rounded-2xl` solo en contenedores grandes (cards, modales)
4. Elementos flotantes (modal, dropdown, drawer) usan `shadow-pop` + animación de entrada
   (`scale-in` o `slide-in-right`)
5. Iconos de lucide, `stroke-width` 1.8–2, nunca rellenos (`fill`)
