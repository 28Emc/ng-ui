import {
  ComponentRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  ViewContainerRef,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TooltipContentComponent } from './tooltip-content.component';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

const PLACEMENTS: Record<
  TooltipPlacement,
  {
    originX: 'center' | 'start' | 'end';
    originY: 'top' | 'bottom' | 'center';
    overlayX: 'center' | 'start' | 'end';
    overlayY: 'top' | 'bottom' | 'center';
    offsetX: number;
    offsetY: number;
  }
> = {
  top: {
    originX: 'center',
    originY: 'top',
    overlayX: 'center',
    overlayY: 'bottom',
    offsetX: 0,
    offsetY: -8,
  },
  bottom: {
    originX: 'center',
    originY: 'bottom',
    overlayX: 'center',
    overlayY: 'top',
    offsetX: 0,
    offsetY: 8,
  },
  left: {
    originX: 'start',
    originY: 'center',
    overlayX: 'end',
    overlayY: 'center',
    offsetX: -8,
    offsetY: 0,
  },
  right: {
    originX: 'end',
    originY: 'center',
    overlayX: 'start',
    overlayY: 'center',
    offsetX: 8,
    offsetY: 0,
  },
};

@Directive({
  selector: '[uiTooltip]',
  standalone: true,
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focusin)': 'show()',
    '(focusout)': 'hide()',
  },
})
export class TooltipDirective implements OnDestroy {
  readonly uiTooltip = input<string>();
  readonly placement = input<TooltipPlacement>('top');

  private readonly overlay = inject(Overlay);
  private readonly elementRef = inject(ElementRef);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private overlayRef: OverlayRef | null = null;
  private tooltipRef: ComponentRef<TooltipContentComponent> | null = null;
  private showTimeout: ReturnType<typeof setTimeout> | null = null;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const content = this.uiTooltip();
      if (this.tooltipRef) this.tooltipRef.instance.content.set(content ?? '');
    });
  }

  show(): void {
    if (!this.uiTooltip() || this.overlayRef) return;
    clearTimeout(this.hideTimeout ?? undefined);
    this.showTimeout = setTimeout(() => this.open(), 200);
  }

  hide(): void {
    clearTimeout(this.showTimeout ?? undefined);
    this.hideTimeout = setTimeout(() => this.close(), 100);
  }

  private open(): void {
    if (this.overlayRef || !this.uiTooltip()) return;
    const p = PLACEMENTS[this.placement()];

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.elementRef)
        .withPositions([{ ...p }, { ...PLACEMENTS[this.flipPlacement(this.placement())] }]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    const portal = new ComponentPortal(TooltipContentComponent);
    this.tooltipRef = this.overlayRef.attach(portal);
    this.tooltipRef.instance.content.set(this.uiTooltip() ?? '');
  }

  private close(): void {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = null;
      this.tooltipRef = null;
    }
  }

  private flipPlacement(p: TooltipPlacement): TooltipPlacement {
    const map: Record<TooltipPlacement, TooltipPlacement> = {
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left',
    };
    return map[p];
  }

  ngOnDestroy(): void {
    this.close();
    clearTimeout(this.showTimeout ?? undefined);
    clearTimeout(this.hideTimeout ?? undefined);
  }
}
