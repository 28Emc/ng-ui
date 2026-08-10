import {
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  computed,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import type { ConnectionPositionPair } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { filter } from 'rxjs';
import { LucideChevronDown } from '@lucide/angular';
import { ButtonComponent } from '../button/button.component';
import { cn } from '../utils/cn';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';
export type PopoverAlign = 'start' | 'center' | 'end';

const FLIP: Record<PopoverPlacement, PopoverPlacement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

@Component({
  selector: 'ui-popover',
  standalone: true,
  imports: [ButtonComponent, LucideChevronDown],
  template: `
    <ui-button
      #trigger
      variant="secondary"
      size="sm"
      [ariaExpanded]="open().toString()"
      ariaHaspopup="dialog"
      (click)="toggle()"
      (keydown)="onTriggerKeydown($event)"
    >
      {{ label() }}
      <svg lucideChevronDown [size]="14" [strokeWidth]="2" [class]="chevronClasses()" />
    </ui-button>

    <ng-template #panel>
      <div
        [class]="panelClasses()"
        [style.min-width]="minWidth()"
        role="dialog"
        [attr.aria-label]="ariaLabel()"
        (keydown)="onPanelKeydown($event)"
      >
        <ng-content />
      </div>
    </ng-template>
  `,
})
export class PopoverComponent {
  readonly label = input('');
  readonly placement = input<PopoverPlacement>('bottom');
  readonly align = input<PopoverAlign>('center');
  readonly minWidth = input('16rem');
  readonly ariaLabel = input('Popover');
  readonly open = model(false);

  protected readonly chevronClasses = computed(() =>
    cn('transition-transform duration-150', this.open() ? 'rotate-180' : ''),
  );
  protected readonly panelClasses = computed(() =>
    cn(
      'max-w-[calc(100vw-2rem)] rounded-xl border border-default bg-surface p-4 shadow-pop overscroll-contain',
      'animate-scale-in',
    ),
  );

  private readonly triggerEl = viewChild('trigger', { read: ElementRef });
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private overlayRef: OverlayRef | null = null;
  private closing = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.close());
  }

  protected toggle(): void {
    if (this.open()) {
      this.close();
    } else {
      this.openPanel();
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      this.openPanel();
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  private openPanel(): void {
    if (this.overlayRef) return;
    const trigger = this.triggerEl();
    if (!trigger) return;

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(trigger)
        .withPositions([
          this.buildPosition(this.placement()),
          this.buildPosition(FLIP[this.placement()]),
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
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate(), this.viewContainerRef));
    this.open.set(true);
  }

  private close(): void {
    if (this.closing) return;
    this.closing = true;
    const wasOpen = this.open();
    const ref = this.overlayRef;
    this.overlayRef = null;
    if (ref) {
      ref.detach();
      ref.dispose();
    }
    this.open.set(false);
    this.closing = false;
    if (wasOpen) {
      this.triggerEl()?.nativeElement.querySelector('button')?.focus();
    }
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

  private buildPosition(placement: PopoverPlacement): ConnectionPositionPair {
    const vertical = placement === 'top' || placement === 'bottom';
    const align = this.align();
    if (vertical) {
      return {
        originX: align,
        originY: placement === 'top' ? 'top' : 'bottom',
        overlayX: align,
        overlayY: placement === 'top' ? 'bottom' : 'top',
        offsetY: placement === 'top' ? -8 : 8,
      };
    }
    return {
      originX: placement === 'left' ? 'start' : 'end',
      originY: this.verticalAlign(align),
      overlayX: placement === 'left' ? 'end' : 'start',
      overlayY: this.verticalAlign(align),
      offsetX: placement === 'left' ? -8 : 8,
    };
  }

  private verticalAlign(align: PopoverAlign): 'top' | 'center' | 'bottom' {
    if (align === 'start') return 'top';
    if (align === 'end') return 'bottom';
    return 'center';
  }
}
