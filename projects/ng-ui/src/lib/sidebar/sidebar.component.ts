import {
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { filter } from 'rxjs';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { cn } from '../utils/cn';
import type { UiSidebarItem } from './sidebar-item';

type FocusDirection = 'down' | 'up' | 'home' | 'end';

@Component({
  selector: 'ui-sidebar',
  standalone: true,
  imports: [NgComponentOutlet, NgTemplateOutlet, RouterLink, LucideChevronLeft, LucideChevronRight],
  template: `
    <aside data-sidebar [class]="rootClasses()">
      <nav
        #nav
        role="navigation"
        [attr.aria-label]="ariaLabel()"
        class="flex-1 overflow-y-auto p-2 scrollbar-thin"
      >
        <ul class="space-y-0.5">
          @for (item of items(); track item.key) {
            <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: item }" />
          }
        </ul>
      </nav>

      @if (collapsible()) {
        <div class="border-t border-default p-2">
          <button
            type="button"
            [attr.aria-label]="collapsed() ? 'Expandir barra lateral' : 'Colapsar barra lateral'"
            [class]="collapseButtonClasses()"
            (click)="toggleCollapsed()"
          >
            @if (collapsed()) {
              <svg lucideChevronRight [size]="18" [strokeWidth]="2" />
            } @else {
              <svg lucideChevronLeft [size]="18" [strokeWidth]="2" />
            }
          </button>
        </div>
      }

      <ng-template #itemTemplate let-item let-inFlyout="inFlyout">
        <li>
          @if (item.children && item.children.length > 0) {
            <button
              type="button"
              data-sidebar-row
              [attr.data-key]="item.key"
              [attr.role]="inFlyout ? 'menuitem' : null"
              [disabled]="item.disabled"
              [attr.aria-expanded]="parentAriaExpanded(item, inFlyout)"
              [attr.aria-haspopup]="collapsed() && !inFlyout ? 'menu' : null"
              [attr.aria-label]="item.ariaLabel || item.label"
              [attr.tabindex]="rowTabindex(item.key, inFlyout)"
              [class]="rowClasses(item, inFlyout)"
              (click)="onParentClick(item, inFlyout, $event)"
              (focus)="setFocused(item.key, inFlyout)"
              (keydown)="onRowKeydown($event, item, inFlyout)"
            >
              <ng-container
                *ngTemplateOutlet="rowContent; context: { $implicit: item, inFlyout: inFlyout }"
              />
              @if (!collapsed() || inFlyout) {
                <svg
                  lucideChevronRight
                  [size]="16"
                  [strokeWidth]="2"
                  class="shrink-0 text-muted transition-transform duration-150"
                  [class.rotate-90]="isOpen(item.key)"
                />
              }
            </button>
            @if ((!collapsed() || inFlyout) && isOpen(item.key)) {
              <ul class="ml-3 mt-0.5 space-y-0.5 border-l border-default pl-3">
                @for (child of item.children; track child.key) {
                  <ng-container
                    *ngTemplateOutlet="
                      itemTemplate;
                      context: { $implicit: child, inFlyout: inFlyout }
                    "
                  />
                }
              </ul>
            }
          } @else {
            @if (item.routerLink) {
              <a
                [routerLink]="item.routerLink"
                data-sidebar-row
                [attr.data-key]="item.key"
                [attr.role]="inFlyout ? 'menuitem' : null"
                [attr.aria-label]="item.ariaLabel || item.label"
                [attr.aria-disabled]="item.disabled || null"
                [attr.tabindex]="rowTabindex(item.key, inFlyout)"
                [class]="rowClasses(item, inFlyout)"
                (click)="onLeafActivate(item, inFlyout, $event)"
                (focus)="setFocused(item.key, inFlyout)"
                (keydown)="onRowKeydown($event, item, inFlyout)"
              >
                <ng-container
                  *ngTemplateOutlet="rowContent; context: { $implicit: item, inFlyout: inFlyout }"
                />
              </a>
            } @else if (item.href) {
              <a
                [href]="item.href"
                data-sidebar-row
                [attr.data-key]="item.key"
                [attr.role]="inFlyout ? 'menuitem' : null"
                [attr.aria-label]="item.ariaLabel || item.label"
                [attr.aria-disabled]="item.disabled || null"
                [attr.tabindex]="rowTabindex(item.key, inFlyout)"
                [class]="rowClasses(item, inFlyout)"
                (click)="onLeafActivate(item, inFlyout, $event)"
                (focus)="setFocused(item.key, inFlyout)"
                (keydown)="onRowKeydown($event, item, inFlyout)"
              >
                <ng-container
                  *ngTemplateOutlet="rowContent; context: { $implicit: item, inFlyout: inFlyout }"
                />
              </a>
            } @else {
              <button
                type="button"
                data-sidebar-row
                [attr.data-key]="item.key"
                [attr.role]="inFlyout ? 'menuitem' : null"
                [disabled]="item.disabled"
                [attr.aria-label]="item.ariaLabel || item.label"
                [attr.tabindex]="rowTabindex(item.key, inFlyout)"
                [class]="rowClasses(item, inFlyout)"
                (click)="onLeafClick(item, inFlyout, $event)"
                (focus)="setFocused(item.key, inFlyout)"
                (keydown)="onRowKeydown($event, item, inFlyout)"
              >
                <ng-container
                  *ngTemplateOutlet="rowContent; context: { $implicit: item, inFlyout: inFlyout }"
                />
              </button>
            }
          }
        </li>
      </ng-template>

      <ng-template #rowContent let-item let-inFlyout="inFlyout">
        @if (item.icon) {
          <ng-container [ngComponentOutlet]="item.icon" [ngComponentOutletInputs]="iconInputs" />
        } @else {
          @if (collapsed() && !inFlyout) {
            <span [class]="iconFallbackClasses">{{ item.label.charAt(0).toUpperCase() }}</span>
          }
        }
        <span [class]="labelClasses(inFlyout)">{{ item.label }}</span>
        @if (item.badge !== undefined && item.badge !== null) {
          <span [class]="badgeClasses(inFlyout)">{{ item.badge }}</span>
        }
      </ng-template>

      <ng-template #flyoutTemplate>
        <div
          data-flyout-panel
          role="menu"
          [attr.aria-label]="flyoutHeader()"
          tabindex="-1"
          [class]="flyoutClasses"
        >
          @if (flyoutHeader()) {
            <p class="px-2.5 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {{ flyoutHeader() }}
            </p>
          }
          <ul class="space-y-0.5">
            @for (child of flyoutRootItems(); track child.key) {
              <ng-container
                *ngTemplateOutlet="itemTemplate; context: { $implicit: child, inFlyout: true }"
              />
            }
          </ul>
        </div>
      </ng-template>
    </aside>
  `,
})
export class SidebarComponent {
  readonly items = input<UiSidebarItem[]>([]);
  readonly ariaLabel = input('Navegación principal');
  readonly collapsible = input(true, { transform: booleanAttribute });
  readonly collapsed = model(false);
  readonly activeKey = model<string | null>(null);
  readonly openKeys = model<string[]>([]);

  protected readonly iconInputs: Record<string, number> = { size: 18, strokeWidth: 2 };
  protected readonly iconFallbackClasses =
    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-500/10 text-xs font-semibold text-brand-700 dark:text-brand-300';

  protected readonly flyoutClasses = cn(
    'max-h-96 w-56 overflow-y-auto rounded-xl border border-default bg-surface p-2 shadow-pop scrollbar-thin animate-scale-in',
  );

  protected readonly flyoutHeader = signal('');
  protected readonly flyoutRootItems = signal<UiSidebarItem[]>([]);
  protected readonly flyoutKey = signal<string | null>(null);

  private readonly focusedKey = signal<string | null>(null);
  private readonly focusedFlyoutKey = signal<string | null>(null);

  private readonly navEl = viewChild.required<ElementRef<HTMLElement>>('nav');
  private readonly flyoutTemplate = viewChild.required<TemplateRef<unknown>>('flyoutTemplate');
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);

  private overlayRef: OverlayRef | null = null;
  private flyoutAnchor: HTMLElement | null = null;
  private flyoutPanelEl: HTMLElement | null = null;
  private closing = false;

  protected readonly rootClasses = computed(() =>
    cn(
      'flex h-full flex-col overflow-hidden border-r border-default bg-surface text-fg transition-[width] duration-200',
      this.collapsed() ? 'w-16' : 'w-64',
    ),
  );

  protected readonly collapseButtonClasses = computed(() =>
    cn(
      'flex w-full items-center justify-center rounded-lg px-2 py-2 text-muted',
      'transition-colors duration-150 hover:bg-surface-2 hover:text-fg',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
    ),
  );

  protected readonly defaultFocusKey = computed<string | null>(() => {
    const active = this.activeKey();
    if (active && this.hasKey(this.items(), active)) {
      return active;
    }
    return this.items()[0]?.key ?? null;
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.closeFlyout(false));

    effect(() => {
      if (this.collapsed()) {
        return;
      }
      const items = this.items();
      const key = this.activeKey();
      if (!key) {
        return;
      }
      const chain = collectAncestorKeys(items, key);
      const open = this.openKeys();
      const missing = chain.filter((ancestor) => !open.includes(ancestor));
      if (missing.length > 0) {
        this.openKeys.set([...open, ...missing]);
      }
    });

    effect(() => {
      if (!this.collapsed()) {
        this.closeFlyout(false);
      }
    });
  }

  protected isActive(item: UiSidebarItem): boolean {
    return item.key === this.activeKey();
  }

  protected isOpen(key: string): boolean {
    return this.openKeys().includes(key);
  }

  protected parentAriaExpanded(item: UiSidebarItem, inFlyout: boolean): boolean {
    if (this.collapsed() && !inFlyout) {
      return this.flyoutKey() === item.key;
    }
    return this.isOpen(item.key);
  }

  protected rowTabindex(key: string, inFlyout: boolean): string {
    const current = inFlyout
      ? (this.focusedFlyoutKey() ?? this.flyoutRootItems()[0]?.key ?? null)
      : (this.focusedKey() ?? this.defaultFocusKey());
    return current === key ? '0' : '-1';
  }

  protected setFocused(key: string, inFlyout: boolean): void {
    if (inFlyout) {
      this.focusedFlyoutKey.set(key);
    } else {
      this.focusedKey.set(key);
    }
  }

  protected labelClasses(inFlyout: boolean): string {
    return cn('truncate', this.collapsed() && !inFlyout ? 'hidden' : 'flex-1 text-left');
  }

  protected badgeClasses(inFlyout: boolean): string {
    return cn(
      'shrink-0 rounded-full bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-700 dark:text-brand-300',
      this.collapsed() && !inFlyout && 'hidden',
    );
  }

  protected rowClasses(item: UiSidebarItem, inFlyout: boolean): string {
    return cn(
      'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
      this.collapsed() && !inFlyout ? 'justify-center px-1.5' : '',
      this.isActive(item)
        ? 'bg-brand-500/10 font-medium text-brand-700 dark:text-brand-300'
        : 'text-fg hover:bg-surface-2 hover:text-fg',
      item.disabled ? 'pointer-events-none opacity-50' : '',
    );
  }

  protected toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
  }

  protected toggleOpen(key: string): void {
    this.openKeys.update((keys) =>
      keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key],
    );
  }

  protected onParentClick(item: UiSidebarItem, inFlyout: boolean, event: MouseEvent): void {
    if (item.disabled) {
      return;
    }
    if (this.collapsed() && !inFlyout) {
      this.toggleFlyout(item, event.currentTarget as HTMLElement);
    } else {
      this.toggleOpen(item.key);
    }
  }

  protected onLeafClick(item: UiSidebarItem, inFlyout: boolean, event: MouseEvent): void {
    if (item.disabled) {
      return;
    }
    this.activate(item);
    this.closeFlyout(false);
    item.onClick?.(event);
  }

  protected onLeafActivate(item: UiSidebarItem, inFlyout: boolean, event: MouseEvent): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    this.activate(item);
    this.closeFlyout(false);
  }

  protected onRowKeydown(event: KeyboardEvent, item: UiSidebarItem, inFlyout: boolean): void {
    const current = event.currentTarget as HTMLElement;
    const rows = this.rowsIn(inFlyout);
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        this.moveFocus(rows, current, event.key === 'ArrowDown' ? 'down' : 'up');
        break;
      case 'Home':
        event.preventDefault();
        this.moveFocus(rows, current, 'home');
        break;
      case 'End':
        event.preventDefault();
        this.moveFocus(rows, current, 'end');
        break;
      case ' ':
        event.preventDefault();
        current.click();
        break;
      case 'ArrowRight':
        if (!item.children || item.children.length === 0) {
          break;
        }
        event.preventDefault();
        if (this.collapsed() && !inFlyout) {
          this.toggleFlyout(item, current);
        } else if (!this.isOpen(item.key)) {
          this.toggleOpen(item.key);
          this.focusFirstChild(item, inFlyout);
        }
        break;
      case 'ArrowLeft':
        if (inFlyout) {
          event.preventDefault();
          this.closeFlyout();
        } else if (this.collapsed() && this.flyoutKey()) {
          event.preventDefault();
          this.closeFlyout();
        } else if (this.isOpen(item.key)) {
          event.preventDefault();
          this.toggleOpen(item.key);
        }
        break;
    }
  }

  protected toggleFlyout(item: UiSidebarItem, anchor: HTMLElement): void {
    if (this.flyoutKey() === item.key) {
      this.closeFlyout();
    } else {
      this.openFlyout(item, anchor, true);
    }
  }

  protected openFlyout(item: UiSidebarItem, anchor: HTMLElement, focusFirst: boolean): void {
    this.closeFlyout(false);
    this.flyoutKey.set(item.key);
    this.flyoutHeader.set(item.label);
    this.flyoutRootItems.set(item.children ?? []);
    this.flyoutAnchor = anchor;

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(anchor)
        .withPositions([
          { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 8 },
          { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -8 },
          { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: 8 },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });

    this.overlayRef.outsidePointerEvents().subscribe((event) => {
      const target = event.target as Node | null;
      if (target && this.flyoutAnchor && !this.flyoutAnchor.contains(target)) {
        this.closeFlyout(false);
      }
    });
    this.overlayRef
      .keydownEvents()
      .pipe(filter((event) => event.key === 'Escape'))
      .subscribe(() => this.closeFlyout());
    this.overlayRef.detachments().subscribe(() => this.onOverlayDetached());

    this.overlayRef.attach(new TemplatePortal(this.flyoutTemplate(), this.viewContainerRef));
    this.flyoutPanelEl =
      this.overlayRef.overlayElement.querySelector<HTMLElement>('[data-flyout-panel]') ?? null;

    if (focusFirst) {
      requestAnimationFrame(() => this.rowsIn(true)[0]?.focus());
    }
  }

  protected closeFlyout(restoreFocus = true): void {
    if (this.closing) return;
    this.closing = true;
    const anchor = this.flyoutAnchor;
    const wasOpen = this.flyoutKey() !== null;
    this.flyoutKey.set(null);
    this.flyoutHeader.set('');
    this.flyoutRootItems.set([]);
    this.flyoutPanelEl = null;
    const ref = this.overlayRef;
    this.overlayRef = null;
    if (ref) {
      ref.detach();
      ref.dispose();
    }
    this.flyoutAnchor = null;
    this.closing = false;
    if (restoreFocus && wasOpen) {
      anchor?.focus();
    }
  }

  private onOverlayDetached(): void {
    if (this.flyoutKey() !== null) {
      this.flyoutKey.set(null);
      this.flyoutHeader.set('');
      this.flyoutRootItems.set([]);
      this.flyoutPanelEl = null;
      this.flyoutAnchor = null;
      if (this.overlayRef) {
        this.overlayRef.dispose();
        this.overlayRef = null;
      }
    }
  }

  private activate(item: UiSidebarItem): void {
    this.activeKey.set(item.key);
  }

  private hasKey(items: UiSidebarItem[], key: string): boolean {
    for (const item of items) {
      if (item.key === key) {
        return true;
      }
      if (item.children && item.children.length > 0 && this.hasKey(item.children, key)) {
        return true;
      }
    }
    return false;
  }

  private rowsIn(inFlyout: boolean): HTMLElement[] {
    const container = inFlyout ? this.flyoutPanelEl : (this.navEl()?.nativeElement ?? null);
    if (!container) {
      return [];
    }
    return Array.from(container.querySelectorAll<HTMLElement>('[data-sidebar-row]'));
  }

  private focusFirstChild(item: UiSidebarItem, inFlyout: boolean): void {
    const keys = new Set((item.children ?? []).map((child) => child.key));
    const row = this.rowsIn(inFlyout).find((element) => {
      const key = element.dataset['key'];
      return key !== undefined && keys.has(key);
    });
    row?.focus();
  }

  private moveFocus(rows: HTMLElement[], current: HTMLElement, direction: FocusDirection): void {
    if (rows.length === 0) {
      return;
    }
    const index = rows.indexOf(current);
    let next: number;
    switch (direction) {
      case 'down':
        next = index < 0 ? 0 : (index + 1) % rows.length;
        break;
      case 'up':
        next = index < 0 ? rows.length - 1 : (index - 1 + rows.length) % rows.length;
        break;
      case 'home':
        next = 0;
        break;
      default:
        next = rows.length - 1;
    }
    rows[next]?.focus();
  }
}

function collectAncestorKeys(items: UiSidebarItem[], key: string): string[] {
  const chain: string[] = [];
  const walk = (nodes: UiSidebarItem[], parents: string[]): boolean => {
    for (const node of nodes) {
      if (node.key === key) {
        chain.push(...parents);
        return true;
      }
      if (node.children && node.children.length > 0) {
        if (walk(node.children, [...parents, node.key])) {
          return true;
        }
      }
    }
    return false;
  };
  walk(items, []);
  return chain;
}
