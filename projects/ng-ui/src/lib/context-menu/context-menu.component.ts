import {
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  inject,
  input,
  output,
  signal,
  viewChild,
  type Type,
  HostListener,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgComponentOutlet } from '@angular/common';
import { filter } from 'rxjs';
import { cn } from '../utils/cn';

export interface UiContextMenuItem {
  id: string;
  label?: string;
  icon?: Type<unknown>;
  disabled?: boolean;
  danger?: boolean;
  shortcut?: string;
  separator?: boolean;
}

@Component({
  selector: 'ui-context-menu',
  standalone: true,
  imports: [NgComponentOutlet],
  template: `
    <div
      #trigger
      data-ctx-trigger
      role="button"
      tabindex="0"
      aria-haspopup="menu"
      [attr.aria-expanded]="open()"
      (contextmenu)="onContextMenu($event)"
      (keydown)="onTriggerKeydown($event)"
      (click)="onTriggerClick($event)"
    >
      <ng-content />
    </div>

    <ng-template #panel>
      <div
        data-ctx-panel
        role="menu"
        tabindex="-1"
        [attr.aria-label]="label()"
        class="min-w-40 max-w-56 animate-scale-in rounded-xl border border-default bg-surface p-1 shadow-pop"
        (keydown)="onPanelKeydown($event)"
      >
        @for (item of items(); track item.id) {
          @if (item.separator) {
            <div role="separator" class="mx-1 my-0.5 h-px bg-border-default"></div>
          } @else {
            <button
              type="button"
              role="menuitem"
              [attr.data-item-id]="item.id"
              [attr.aria-disabled]="item.disabled ? 'true' : null"
              [disabled]="item.disabled"
              [class]="itemClasses(item)"
              (click)="onItemClick(item)"
            >
              <span data-ctx-icon class="flex w-4 shrink-0 items-center justify-center">
                @if (item.icon) {
                  <svg
                    [ngComponentOutlet]="item.icon"
                    [ngComponentOutletInputs]="{ size: 16, strokeWidth: 2 }"
                  />
                }
              </span>
              <span class="flex-1 text-left truncate">{{ item.label }}</span>
              @if (item.shortcut) {
                <span class="text-xs text-muted shrink-0">{{ item.shortcut }}</span>
              }
            </button>
          }
        }
      </div>
    </ng-template>
  `,
})
export class ContextMenuComponent {
  readonly items = input<UiContextMenuItem[]>([]);
  readonly label = input('Menú contextual');
  readonly itemSelected = output<UiContextMenuItem>();

  protected readonly open = signal(false);

  private readonly triggerEl = viewChild('trigger', { read: ElementRef });
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);

  private overlayRef: OverlayRef | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.close());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.isTrigger(event.target)) {
      this.close();
    }
  }

  protected itemClasses(item: UiContextMenuItem): string {
    return cn(
      'flex w-full items-center gap-2 rounded-lg px-2 py-1 text-sm text-fg transition-colors',
      item.danger ? 'text-danger hover:bg-danger/10' : 'hover:bg-surface-2',
      item.disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent',
    );
  }

  protected onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    this.openPanel(event.clientX, event.clientY);
  }

  protected onTriggerClick(event: MouseEvent): void {
    event.preventDefault();
    if (this.open()) {
      this.close();
    } else {
      const rect = this.triggerEl()?.nativeElement.getBoundingClientRect();
      this.openPanel(rect?.left ?? 0, rect?.bottom ?? 0);
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Enter' ||
      event.key === ' ' ||
      event.key === 'ContextMenu' ||
      (event.shiftKey && event.key === 'F10')
    ) {
      event.preventDefault();
      const rect = this.triggerEl()?.nativeElement.getBoundingClientRect();
      this.openPanel(rect?.left ?? 0, rect?.bottom ?? 0);
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    const items = this.enabledItems();
    if (items.length === 0) return;
    const index = items.indexOf(document.activeElement as HTMLButtonElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      items[(index + 1) % items.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      items[index <= 0 ? items.length - 1 : index - 1]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      items[items.length - 1]?.focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const current = items[index];
      if (!current) return;
      const id = current.getAttribute('data-item-id');
      const item = this.items().find((i) => i.id === id);
      if (item) this.onItemClick(item);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  protected onItemClick(item: UiContextMenuItem): void {
    if (item.disabled || item.separator) return;
    this.itemSelected.emit(item);
    this.close();
  }

  private openPanel(x: number, y: number): void {
    if (this.overlayRef) return;

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().left(`${x}px`).top(`${y}px`),
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });

    this.overlayRef
      .outsidePointerEvents()
      .pipe(filter((event) => !this.isTrigger(event.target)))
      .subscribe(() => this.close());
    this.overlayRef
      .keydownEvents()
      .pipe(filter((event) => event.key === 'Escape'))
      .subscribe(() => this.close());
    this.overlayRef.detachments().subscribe(() => this.onOverlayDetached());

    const portal = new TemplatePortal(this.panelTemplate(), this.viewContainerRef);
    this.overlayRef.attach(portal);

    // Clamp after the overlay is rendered
    queueMicrotask(() => this.clampToViewport(x, y));

    this.open.set(true);
    this.focusFirstItem();
  }

  private clampToViewport(x: number, y: number): void {
    const ref = this.overlayRef;
    if (!ref) return;
    const el = ref.overlayElement;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxLeft = viewportWidth - rect.width - 8;
    const maxTop = viewportHeight - rect.height - 8;
    const left = Math.max(8, Math.min(x, maxLeft));
    const top = Math.max(8, Math.min(y, maxTop));
    if (left !== x || top !== y) {
      ref.updatePositionStrategy(
        this.overlay.position().global().left(`${left}px`).top(`${top}px`)
      );
    }
  }

  private focusFirstItem(): void {
    queueMicrotask(() => this.enabledItems()[0]?.focus());
  }

  private enabledItems(): HTMLButtonElement[] {
    const ref = this.overlayRef;
    if (!ref) return [];
    return Array.from(
      ref.overlayElement.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])'),
    );
  }

  private close(): void {
    const ref = this.overlayRef;
    this.overlayRef = null;
    if (ref) {
      ref.detach();
      ref.dispose();
    }
    this.open.set(false);
    this.triggerEl()?.nativeElement.focus();
  }

  private onOverlayDetached(): void {
    if (this.open()) {
      this.open.set(false);
      if (this.overlayRef) {
        this.overlayRef.dispose();
        this.overlayRef = null;
      }
    }
  }

  private isTrigger(target: EventTarget | null): boolean {
    const trigger = this.triggerEl();
    return !!trigger && !!target && trigger.nativeElement.contains(target as Node);
  }
}
