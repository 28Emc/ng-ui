import {
  AfterContentChecked,
  Component,
  computed,
  ElementRef,
  booleanAttribute,
  effect,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { ScreenReaderOnlyComponent } from '../screen-reader-only/screen-reader-only.component';
import { cn } from '../utils/cn';

const SWIPE_THRESHOLD = 50;

@Component({
  selector: 'ui-carousel',
  standalone: true,
  imports: [LucideChevronLeft, LucideChevronRight, ScreenReaderOnlyComponent],
  styles: [
    `
      :host ::ng-deep .carousel-track > * {
        flex: 0 0 100%;
        width: 100%;
      }
    `,
  ],
  template: `
    <div
      class="relative"
      role="region"
      aria-roledescription="carrusel"
      [attr.aria-label]="label()"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
    >
      <div class="overflow-hidden rounded-2xl">
        <div
          data-track
          #track
          class="carousel-track flex transition-transform duration-300 ease-out will-change-transform"
          [style.transform]="trackTransform()"
          (pointerdown)="onPointerDown($event)"
          (pointermove)="onPointerMove($event)"
          (pointerup)="onPointerUp()"
          (pointerleave)="onPointerUp()"
        >
          <ng-content />
        </div>
      </div>

      @if (showArrows()) {
        <button
          type="button"
          data-prev
          [disabled]="prevDisabled()"
          [attr.aria-label]="prevLabel()"
          (click)="prev()"
          class="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 text-fg shadow-pop backdrop-blur transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500/50 disabled:pointer-events-none disabled:opacity-40"
        >
          <svg lucideChevronLeft [size]="20" [strokeWidth]="2" />
        </button>
        <button
          type="button"
          data-next
          [disabled]="nextDisabled()"
          [attr.aria-label]="nextLabel()"
          (click)="next()"
          class="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 text-fg shadow-pop backdrop-blur transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500/50 disabled:pointer-events-none disabled:opacity-40"
        >
          <svg lucideChevronRight [size]="20" [strokeWidth]="2" />
        </button>
      }

      @if (showDots()) {
        <div class="mt-3 flex items-center justify-center gap-1.5">
          @for (dot of dotIndexes(); track dot) {
            <button
              type="button"
              data-dot
              [attr.aria-label]="dotLabel() + ' ' + (dot + 1) + ' de ' + totalSlides()"
              [attr.aria-current]="dot === index() ? 'true' : null"
              (click)="goTo(dot)"
              [class]="dotClasses(dot)"
            ></button>
          }
        </div>
      }

      <ui-screen-reader-only>
        <span aria-live="polite">{{ index() + 1 }} de {{ totalSlides() }}</span>
      </ui-screen-reader-only>
    </div>
  `,
})
export class CarouselComponent implements AfterContentChecked {
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  readonly index = model(0);
  readonly loop = input(true, { transform: booleanAttribute });
  readonly autoplay = input(false, { transform: booleanAttribute });
  readonly autoplayInterval = input(5000, { transform: (v: unknown) => Number(v) || 0 });
  readonly pauseOnHover = input(true, { transform: booleanAttribute });
  readonly showArrows = input(true, { transform: booleanAttribute });
  readonly showDots = input(true, { transform: booleanAttribute });
  readonly swipeable = input(true, { transform: booleanAttribute });
  readonly label = input('Carrusel de contenido');
  readonly prevLabel = input('Diapositiva anterior');
  readonly nextLabel = input('Diapositiva siguiente');
  readonly dotLabel = input('Ir a la diapositiva');

  protected readonly slideCount = signal(0);
  protected readonly totalSlides = this.slideCount;
  protected readonly hovered = signal(false);
  protected readonly dotIndexes = computed(() =>
    Array.from({ length: this.slideCount() }, (_, i) => i),
  );

  protected readonly trackTransform = computed(() => `translateX(${this.index() * -100}%)`);

  protected readonly prevDisabled = computed(() => {
    if (this.loop()) return false;
    return this.index() <= 0;
  });

  protected readonly nextDisabled = computed(() => {
    if (this.loop()) return false;
    return this.index() >= this.slideCount() - 1;
  });

  protected readonly dotClasses = (dot: number): string =>
    cn(
      'h-2 rounded-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-500/50',
      dot === this.index() ? 'w-6 bg-brand-500' : 'w-2 bg-surface-2 hover:bg-brand-400/50',
    );

  private readonly autoplayTimer = signal<ReturnType<typeof setInterval> | null>(null);

  constructor() {
    effect(() => {
      const enabled = this.autoplay() && !this.hovered() && this.pauseOnHover();
      if (enabled) {
        const interval = Math.max(this.autoplayInterval(), 500);
        const timer = setInterval(() => this.next(), interval);
        this.autoplayTimer.set(timer);
        return () => {
          clearInterval(timer);
          this.autoplayTimer.set(null);
        };
      }
      const current = this.autoplayTimer();
      if (current) {
        clearInterval(current);
        this.autoplayTimer.set(null);
      }
      return;
    });
  }

  protected next(): void {
    const total = this.slideCount();
    if (total === 0) return;
    const current = this.index();
    if (this.loop()) {
      this.index.set((current + 1) % total);
    } else {
      this.index.set(Math.min(current + 1, total - 1));
    }
  }

  protected prev(): void {
    const total = this.slideCount();
    if (total === 0) return;
    const current = this.index();
    if (this.loop()) {
      this.index.set((current - 1 + total) % total);
    } else {
      this.index.set(Math.max(current - 1, 0));
    }
  }

  protected goTo(slide: number): void {
    if (slide < 0 || slide >= this.slideCount()) return;
    this.index.set(slide);
  }

  ngAfterContentChecked(): void {
    const total = this.track().nativeElement.children.length;
    if (total !== this.slideCount()) {
      this.slideCount.set(total);
    }
    if (total > 0 && this.index() >= total) {
      this.index.set(Math.max(0, total - 1));
    }
  }

  protected onMouseEnter(): void {
    this.hovered.set(true);
  }

  protected onMouseLeave(): void {
    this.hovered.set(false);
  }

  private readonly startX = { value: 0 };
  private isSwiping = false;

  protected onPointerDown(event: PointerEvent | { clientX: number }): void {
    if (!this.swipeable()) return;
    this.startX.value = event.clientX;
    this.isSwiping = true;
  }

  protected onPointerMove(event: PointerEvent | { clientX: number }): void {
    if (!this.isSwiping) return;
    const dx = event.clientX - this.startX.value;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    this.isSwiping = false;
    if (dx < 0) {
      this.next();
    } else {
      this.prev();
    }
  }

  protected onPointerUp(): void {
    this.isSwiping = false;
  }
}
