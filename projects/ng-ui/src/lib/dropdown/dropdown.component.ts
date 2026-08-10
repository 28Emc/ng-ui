import {
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { filter } from 'rxjs';
import { LucideChevronDown } from '@lucide/angular';
import { ButtonComponent } from '../button/button.component';
import { cn } from '../utils/cn';

@Component({
  selector: 'ui-dropdown',
  standalone: true,
  imports: [ButtonComponent, LucideChevronDown],
  template: `
    <ui-button
      #trigger
      variant="secondary"
      size="sm"
      [ariaExpanded]="isOpen().toString()"
      ariaHaspopup="menu"
      (click)="toggle()"
      (keydown)="onTriggerKeydown($event)"
    >
      {{ label() }}
      <svg lucideChevronDown [size]="14" [strokeWidth]="2" [class]="chevronClasses()" />
    </ui-button>

    <ng-template #panel>
      <div [class]="panelClasses()" role="menu" tabindex="-1" (keydown)="onMenuKeydown($event)">
        <ng-content />
      </div>
    </ng-template>
  `,
})
export class DropdownComponent {
  readonly label = input('');
  readonly align = input<'left' | 'right'>('right');

  protected readonly isOpen = signal(false);
  protected readonly chevronClasses = computed(() =>
    cn('transition-transform duration-150', this.isOpen() ? 'rotate-180' : ''),
  );
  protected readonly panelClasses = computed(() =>
    cn(
      'min-w-[12rem] rounded-xl border border-default bg-surface p-1.5 shadow-pop animate-scale-in',
    ),
  );

  private readonly triggerEl = viewChild.required('trigger', { read: ElementRef });
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private overlayRef: OverlayRef | null = null;
  private closing = false;
  private readonly onPanelClick = (): void => this.close();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.close());
  }

  protected toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.open();
    }
  }

  protected onMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const items = this.menuItems();
      if (!items.length) {
        return;
      }
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex = (currentIndex + delta + items.length) % items.length;
      items[nextIndex]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.menuItems()[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      const items = this.menuItems();
      items[items.length - 1]?.focus();
    }
  }

  private menuItems(): HTMLElement[] {
    return Array.from(
      this.overlayRef?.overlayElement.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
  }

  private open(): void {
    if (this.overlayRef) {
      return;
    }
    const align = this.align() === 'left' ? 'start' : 'end';
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.triggerEl())
        .withPositions([
          {
            originX: align,
            originY: 'bottom',
            overlayX: align,
            overlayY: 'top',
            offsetY: 8,
          },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.close(),
      usePopover: false,
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
    this.overlayRef.overlayElement.addEventListener('click', this.onPanelClick);
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate(), this.viewContainerRef));
    this.isOpen.set(true);
    const firstItem =
      this.overlayRef.overlayElement.querySelector<HTMLElement>('[role="menuitem"]');
    firstItem?.focus();
  }

  private close(): void {
    if (this.closing) return;
    this.closing = true;
    const wasOpen = this.isOpen();
    const ref = this.overlayRef;
    this.overlayRef = null;
    if (ref) {
      ref.overlayElement.removeEventListener('click', this.onPanelClick);
      ref.detach();
      ref.dispose();
    }
    this.isOpen.set(false);
    this.closing = false;
    if (wasOpen) {
      this.triggerEl().nativeElement.querySelector('button')?.focus();
    }
  }

  private onOverlayDetached(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      if (this.overlayRef) {
        this.overlayRef.overlayElement.removeEventListener('click', this.onPanelClick);
        this.overlayRef.dispose();
        this.overlayRef = null;
      }
    }
  }

  private isTrigger(target: EventTarget | null): boolean {
    const trigger = this.triggerEl();
    return !!target && trigger.nativeElement.contains(target as Node);
  }
}
