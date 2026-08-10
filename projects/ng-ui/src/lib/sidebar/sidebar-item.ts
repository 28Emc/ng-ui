import type { Type } from '@angular/core';

export interface UiSidebarItem {
  /** Identificador estable del ítem, usado para el estado activo y los sub-menús. */
  key: string;
  /** Texto visible del ítem. */
  label: string;
  /** Icono opcional (cualquier componente standalone que acepte inputs `size` y `strokeWidth`, p. ej. un icono de `@lucide/angular`). */
  icon?: Type<unknown>;
  /** Valor mostrado como badge a la derecha del ítem. */
  badge?: string | number;
  /** Ruta interna del router de Angular. */
  routerLink?: string | unknown[];
  /** URL externa nativa. */
  href?: string;
  /** Acción al hacer click (solo ítems hoja). */
  onClick?: (event: MouseEvent) => void;
  /** Deshabilita el ítem. */
  disabled?: boolean;
  /** Etiqueta ARIA personalizada. */
  ariaLabel?: string;
  /** Sub-ítems: convierte el ítem en un grupo plegable. */
  children?: UiSidebarItem[];
}
