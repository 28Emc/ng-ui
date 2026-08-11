import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideCheckCircle2,
  LucideCircleAlert,
  LucideTriangleAlert,
  LucideInfo,
} from '@lucide/angular';
import { cn } from '../utils/cn';
import { LocaleService, UiStringKey } from '../locale/locale.service';
import { Toast, ToastVariant } from './toast.service';

const ICON_MAP: Record<ToastVariant, any> = {
  default: LucideInfo,
  success: LucideCheckCircle2,
  error: LucideCircleAlert,
  warning: LucideTriangleAlert,
};

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  default: 'border-default',
  success: 'border-success/30',
  error: 'border-danger/30',
  warning: 'border-warning/30',
};

@Component({
  selector: 'ui-toast',
  standalone: true,
  imports: [CommonModule, LucideInfo, LucideCheckCircle2, LucideCircleAlert, LucideTriangleAlert],
  // Lucide icons used dynamically via ngComponentOutlet/ICON_MAP
  template: `
    <!-- Lucide icons used dynamically via ICON_MAP/ngComponentOutlet -->
    <div style="display: none;">
      <svg lucideInfo [size]="1" />
      <svg lucideCheckCircle2 [size]="1" />
      <svg lucideCircleAlert [size]="1" />
      <svg lucideTriangleAlert [size]="1" />
    </div>
    <div
      role="status"
      [class]="classes()"
      [attr.data-variant]="toast().variant"
      (mouseenter)="pauseToast.emit(toast().id)"
      (mouseleave)="resumeToast.emit(toast().id)"
    >
      <span [class]="iconClasses()">
        <ng-container
          [ngComponentOutlet]="iconComponent()"
          [ngComponentOutletInputs]="{ size: 18, strokeWidth: 2 }"
        />
      </span>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-fg">{{ toast().title }}</p>
        @if (toast().description) {
          <p class="text-sm text-muted">{{ toast().description }}</p>
        }
        @if (toast().action) {
          <button type="button" [class]="actionClasses()" (click)="onAction()">
            {{ toast().action?.label }}
          </button>
        }
      </div>
      <button
        type="button"
        class="p-1 rounded-lg text-muted hover:text-fg hover:bg-surface-2 transition-colors duration-150"
        (click)="dismiss.emit(toast().id)"
        [attr.aria-label]="t('close') + ' ' + toast().title"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  `,
})
export class ToastComponent {
  readonly toast = input.required<Toast>();
  readonly dismiss = output<string>();
  readonly pauseToast = output<string>();
  readonly resumeToast = output<string>();

  private readonly localeService = inject(LocaleService);

  protected t(key: UiStringKey): string {
    return this.localeService.translate(key);
  }

  protected readonly iconComponent = computed(() => ICON_MAP[this.toast().variant]);
  protected readonly iconClasses = computed(() =>
    cn(
      'flex shrink-0 h-5 w-5 items-center justify-center rounded-lg',
      this.toast().variant === 'success' && 'bg-success/10 text-success',
      this.toast().variant === 'error' && 'bg-danger/10 text-danger',
      this.toast().variant === 'warning' && 'bg-warning/10 text-warning',
      this.toast().variant === 'default' && 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
    ),
  );

  protected readonly actionClasses = computed(() =>
    cn(
      'mt-2 inline-flex items-center rounded-lg bg-brand-500/10 px-2 py-1 text-xs font-semibold text-brand-600',
      'transition-colors duration-150 hover:bg-brand-500/20 dark:text-brand-400',
    ),
  );

  protected readonly classes = computed(() =>
    cn(
      'flex items-start gap-3 rounded-xl p-3.5 shadow-pop animate-slide-in-right',
      'pointer-events-auto bg-surface border',
      VARIANT_CLASSES[this.toast().variant],
    ),
  );

  protected onAction(): void {
    const action = this.toast().action;
    if (!action) return;
    action.onClick(this.toast().id);
    this.dismiss.emit(this.toast().id);
  }
}
