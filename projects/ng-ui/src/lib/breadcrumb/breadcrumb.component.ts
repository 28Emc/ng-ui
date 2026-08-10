import {
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
  booleanAttribute,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { filter } from 'rxjs';
import { LucideChevronRight, LucideEllipsis } from '@lucide/angular';
import { cn } from '../utils/cn';
import { BreadcrumbItemComponent } from './breadcrumb-item.component';
import type { UiBreadcrumbItem } from './breadcrumb-item';

@Component({
  selector: 'ui-breadcrumb',
  standalone: true,
  imports: [BreadcrumbItemComponent, LucideChevronRight, LucideEllipsis],
  template: `
    <nav #nav [attr.aria-label]="ariaLabel()" class="flex min-w-0 items-center gap-1 text-sm">
      @if (collapsed()) {
        <div class="flex min-w-0 shrink-0 items-center gap-1">
          <button
            #overflowTrigger
            type="button"
            aria-haspopup="menu"
            [attr.aria-expanded]="overflowOpen()"
            [attr.aria-label]="overflowLabel"
            [class]="overflowTriggerClasses()"
            (click)="toggleOverflow()"
            (keydown)="onTriggerKeydown($event)"
          >
            <svg lucideEllipsis [size]="16" [strokeWidth]="2" />
          </button>
          <span aria-hidden="true" [class]="separatorClasses">
            <svg lucideChevronRight [size]="14" [strokeWidth]="2" />
          </span>
        </div>
      }
      @for (item of visibleItems(); track $index; let last = $last) {
        <div data-crumb class="flex min-w-0 shrink-0 items-center gap-1">
          <ui-breadcrumb-item [item]="item" [current]="last" />
          @if (!last) {
            <span aria-hidden="true" [class]="separatorClasses">
              <svg lucideChevronRight [size]="14" [strokeWidth]="2" />
            </span>
          }
        </div>
      }
    </nav>

    <ng-template #overflowMenu>
      <div
        role="menu"
        [attr.aria-label]="overflowLabel"
        tabindex="-1"
        [class]="menuClasses"
        (keydown)="onMenuKeydown($event)"
      >
        @for (item of hiddenItems(); track $index) {
          <ui-breadcrumb-item [item]="item" [menuItem]="true" />
        }
      </div>
    </ng-template>
  `,
})
export class BreadcrumbComponent {
  readonly items = input<UiBreadcrumbItem[]>([]);
  readonly ariaLabel = input('Ruta de navegación');
  readonly maxItems = input<number | null>(null);
  readonly responsive = input(true, { transform: booleanAttribute });

  protected readonly overflowLabel = 'Ver más niveles';
  protected readonly collapsed = signal(false);
  protected readonly overflowOpen = signal(false);

  protected readonly separatorClasses = 'flex shrink-0 items-center text-muted/50';
  protected readonly menuClasses = cn(
    'min-w-[10rem] max-h-64 overflow-auto rounded-xl border border-default bg-surface p-1.5 shadow-pop animate-scale-in scrollbar-thin',
  );

  protected readonly overflowTriggerClasses = computed(() =>
    cn(
      'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted',
      'transition-colors duration-150 hover:bg-surface-2 hover:text-fg',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
    ),
  );

  protected readonly visibleItems = computed<UiBreadcrumbItem[]>(() => {
    const items = this.items();
    if (!this.collapsed() || items.length <= 2) {
      return items;
    }
    return [items[0], items[items.length - 1]];
  });

  protected readonly hiddenItems = computed<UiBreadcrumbItem[]>(() => {
    const items = this.items();
    if (!this.collapsed() || items.length <= 2) {
      return [];
    }
    return items.slice(1, -1);
  });

  private readonly navEl = viewChild.required<ElementRef<HTMLElement>>('nav');
  private readonly overflowTrigger = viewChild('overflowTrigger', { read: ElementRef });
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('overflowMenu');
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private overlayRef: OverlayRef | null = null;
  private closing = false;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.resizeObserver?.disconnect());

    effect(() => {
      const nav = this.navEl();
      if (nav && !this.resizeObserver && typeof ResizeObserver !== 'undefined') {
        try {
          this.resizeObserver = new ResizeObserver(() => this.updateResponsive());
          this.resizeObserver.observe(nav.nativeElement);
        } catch {
          this.resizeObserver = null;
        }
      }
      const max = this.maxItems();
      const items = this.items();
      if (max !== null) {
        this.collapsed.set(items.length > max);
        return;
      }
      this.updateResponsive();
    });
  }

  protected toggleOverflow(): void {
    if (this.overflowOpen()) {
      this.closeOverflow();
    } else {
      this.openOverflow();
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.overflowOpen()) {
        this.openOverflow();
      }
    }
  }

  protected onMenuKeydown(event: KeyboardEvent): void {
    const items = this.menuItems();
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (items.length === 0) {
        return;
      }
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const next = (currentIndex + delta + items.length) % items.length;
      items[next]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      items[items.length - 1]?.focus();
    }
  }

  private updateResponsive(): void {
    if (this.maxItems() !== null) {
      return;
    }
    if (!this.responsive()) {
      this.collapsed.set(false);
      return;
    }
    if (this.items().length <= 2) {
      this.collapsed.set(false);
      return;
    }
    this.collapsed.set(false);
    queueMicrotask(() => {
      const nav = this.navEl()?.nativeElement;
      if (!nav) {
        return;
      }
      if (nav.scrollWidth > nav.clientWidth) {
        this.collapsed.set(true);
      }
    });
  }

  private readonly onPanelClick = (): void => this.closeOverflow();

  private menuItems(): HTMLElement[] {
    return Array.from(
      this.overlayRef?.overlayElement.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
  }

  private openOverflow(): void {
    const trigger = this.overflowTrigger();
    if (!trigger || this.overlayRef) {
      return;
    }
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(trigger)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
            offsetY: 8,
          },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });
    this.overlayRef.outsidePointerEvents().subscribe((event) => {
      const target = event.target as Node | null;
      if (target && !this.navEl().nativeElement.contains(target)) {
        this.closeOverflow();
      }
    });
    this.overlayRef
      .keydownEvents()
      .pipe(filter((event) => event.key === 'Escape'))
      .subscribe(() => this.closeOverflow());
    this.overlayRef.detachments().subscribe(() => this.onOverlayDetached());
    this.overlayRef.overlayElement.addEventListener('click', this.onPanelClick);
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate(), this.viewContainerRef));
    this.overflowOpen.set(true);
    this.menuItems()[0]?.focus();
  }

  private closeOverflow(): void {
    if (this.closing) return;
    this.closing = true;
    const wasOpen = this.overflowOpen();
    const ref = this.overlayRef;
    this.overlayRef = null;
    if (ref) {
      ref.overlayElement.removeEventListener('click', this.onPanelClick);
      ref.detach();
      ref.dispose();
    }
    this.overflowOpen.set(false);
    this.closing = false;
    if (wasOpen) {
      this.overflowTrigger()?.nativeElement.focus();
    }
  }

  private onOverlayDetached(): void {
    if (this.overflowOpen()) {
      this.overflowOpen.set(false);
      if (this.overlayRef) {
        this.overlayRef.overlayElement.removeEventListener('click', this.onPanelClick);
        this.overlayRef.dispose();
        this.overlayRef = null;
      }
    }
  }
}
