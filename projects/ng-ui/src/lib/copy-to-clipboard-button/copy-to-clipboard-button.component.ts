import { Component, computed, input, booleanAttribute, signal, OnDestroy } from '@angular/core';
import { LucideCheck, LucideCopy } from '@lucide/angular';
import { ButtonComponent, ButtonSize, ButtonVariant } from '../button/button.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { copyTextToClipboard } from './copy-to-clipboard';

const RESET_DELAY = 2000;

@Component({
  selector: 'ui-copy-button',
  standalone: true,
  imports: [ButtonComponent, TooltipDirective, LucideCheck, LucideCopy],
  template: `
    <ui-button
      type="button"
      [variant]="variant()"
      [size]="size()"
      [disabled]="disabled()"
      [ariaLabel]="ariaLabel()"
      [uiTooltip]="tooltipText()"
      (click)="copy()"
    >
      @if (copied()) {
        <svg lucideCheck [size]="iconSize()" [strokeWidth]="2" class="text-green-600" />
      } @else {
        <svg lucideCopy [size]="iconSize()" [strokeWidth]="2" />
      }
    </ui-button>
  `,
})
export class CopyToClipboardButtonComponent implements OnDestroy {
  readonly text = input.required<string>();
  readonly label = input('Copiar');
  readonly copiedLabel = input('¡Copiado!');
  readonly variant = input<ButtonVariant>('ghost');
  readonly size = input<ButtonSize>('icon');
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly copied = signal(false);
  protected readonly tooltipText = computed(() =>
    this.copied() ? this.copiedLabel() : this.label(),
  );
  protected readonly ariaLabel = computed(() =>
    this.copied() ? this.copiedLabel() : this.label(),
  );
  protected readonly iconSize = computed(() => {
    switch (this.size()) {
      case 'sm':
      case 'icon-sm':
        return 14;
      case 'lg':
        return 18;
      default:
        return 16;
    }
  });

  private resetTimer: ReturnType<typeof setTimeout> | null = null;

  protected async copy(): Promise<void> {
    if (this.disabled()) return;
    try {
      await copyTextToClipboard(this.text());
      this.copied.set(true);
      clearTimeout(this.resetTimer ?? undefined);
      this.resetTimer = setTimeout(() => this.copied.set(false), RESET_DELAY);
    } catch {
      this.copied.set(false);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.resetTimer ?? undefined);
  }
}
