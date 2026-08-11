import { Component, computed, input, signal, booleanAttribute } from '@angular/core';
import { cn } from '../utils/cn';
import { LucideImageOff } from '@lucide/angular';

export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

const OBJECT_FIT_CLASSES: Record<ImageFit, string> = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  none: 'object-none',
  'scale-down': 'object-scale-down',
};

@Component({
  selector: 'ui-image',
  standalone: true,
  imports: [LucideImageOff],
  template: `
    <div class="relative overflow-hidden bg-surface-2" [style.aspect-ratio]="aspectRatio()">
      @if (blurSrc(); as blur) {
        <img
          data-blur
          [src]="blur"
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          class="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
        />
      }

      @if (!failed()) {
        <img
          data-main
          [src]="src()"
          [alt]="alt()"
          [attr.srcset]="srcset() || null"
          [attr.sizes]="sizes() || null"
          [attr.width]="width() || null"
          [attr.height]="height() || null"
          [attr.loading]="loading()"
          [attr.fetchpriority]="priority() ? 'high' : null"
          [attr.decoding]="priority() ? 'sync' : 'async'"
          [style.objectPosition]="objectPosition() || null"
          [class]="mainClasses()"
          (load)="onLoad()"
          (error)="onError()"
        />
      } @else {
        <div
          data-fallback
          role="img"
          [attr.aria-label]="alt()"
          class="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted"
        >
          <svg lucideImageOff [size]="24" [strokeWidth]="1.8" />
          <span class="px-4 text-center text-xs">{{ fallbackLabel() }}</span>
        </div>
      }
    </div>
  `,
})
export class ImageComponent {
  readonly src = input.required<string>();
  readonly alt = input.required<string>();
  readonly width = input<number>();
  readonly height = input<number>();
  readonly loading = input<'lazy' | 'eager'>('lazy');
  readonly priority = input(false, { transform: booleanAttribute });
  readonly blurSrc = input<string>();
  readonly srcset = input<string>();
  readonly sizes = input<string>();
  readonly objectFit = input<ImageFit>('cover');
  readonly objectPosition = input<string>();
  readonly fallbackLabel = input('No se pudo cargar la imagen');

  protected readonly loaded = signal(false);
  protected readonly failed = signal(false);

  protected readonly aspectRatio = computed(() => {
    const w = this.width();
    const h = this.height();
    return w && h ? `${w} / ${h}` : null;
  });

  protected readonly mainClasses = computed(() =>
    cn(
      'h-full w-full transition-opacity duration-300',
      OBJECT_FIT_CLASSES[this.objectFit()],
      this.loaded() ? 'opacity-100' : 'opacity-0',
    ),
  );

  protected onLoad(): void {
    this.loaded.set(true);
  }

  protected onError(): void {
    this.failed.set(true);
  }
}
