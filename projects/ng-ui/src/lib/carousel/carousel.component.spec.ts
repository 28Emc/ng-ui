import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CarouselComponent } from './carousel.component';

@Component({
  selector: 'carousel-host',
  standalone: true,
  imports: [CarouselComponent],
  template: `
    <ui-carousel
      [index]="index()"
      (indexChange)="onIndexChange($event)"
      [loop]="loop()"
      [autoplay]="autoplay()"
      [autoplayInterval]="1000"
    >
      @for (slide of slides(); track slide) {
        <div class="w-full shrink-0" data-slide>{{ slide }}</div>
      }
    </ui-carousel>
  `,
})
class CarouselHost {
  readonly index = signal(0);
  readonly loop = signal(true);
  readonly autoplay = signal(false);
  readonly slides = signal(['Slide A', 'Slide B', 'Slide C']);
  readonly indices: number[] = [];

  onIndexChange(index: number): void {
    this.indices.push(index);
    this.index.set(index);
  }
}

describe('CarouselComponent', () => {
  let fixture: ComponentFixture<CarouselHost>;
  let host: CarouselHost;
  let component: CarouselComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CarouselHost] }).compileComponents();
    fixture = TestBed.createComponent(CarouselHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    component = fixture.debugElement.query(By.directive(CarouselComponent)).componentInstance;
  });

  function track(): HTMLElement {
    return fixture.nativeElement.querySelector('[data-track]') as HTMLElement;
  }

  function slides(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[data-slide]')) as HTMLElement[];
  }

  function prevButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('[data-prev]') as HTMLButtonElement;
  }

  function nextButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('[data-next]') as HTMLButtonElement;
  }

  function dots(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[data-dot]')) as HTMLButtonElement[];
  }

  it('renders all projected slides and a dot per slide', () => {
    expect(slides()).toHaveLength(3);
    expect(dots()).toHaveLength(3);
    expect(track().style.transform).toBe('translateX(0%)');
  });

  it('moves to the next slide and updates the model', () => {
    nextButton().click();
    fixture.detectChanges();

    expect(host.index()).toBe(1);
    expect(host.indices).toEqual([1]);
    expect(track().style.transform).toBe('translateX(-100%)');
  });

  it('moves to the previous slide', () => {
    host.index.set(2);
    fixture.detectChanges();
    prevButton().click();
    fixture.detectChanges();

    expect(host.index()).toBe(1);
    expect(track().style.transform).toBe('translateX(-100%)');
  });

  it('wraps from the last slide to the first when loop is enabled', () => {
    host.index.set(2);
    fixture.detectChanges();
    nextButton().click();
    fixture.detectChanges();

    expect(host.index()).toBe(0);
    expect(track().style.transform).toBe('translateX(0%)');
  });

  it('does not wrap and disables arrows at the ends when loop is disabled', () => {
    host.loop.set(false);
    fixture.detectChanges();

    expect(prevButton().disabled).toBe(true);

    host.index.set(2);
    fixture.detectChanges();
    nextButton().click();
    fixture.detectChanges();

    expect(host.index()).toBe(2);
    expect(nextButton().disabled).toBe(true);
  });

  it('clamps the index when slides are removed', () => {
    host.index.set(2);
    fixture.detectChanges();
    host.slides.update((s) => s.slice(0, 2));
    fixture.detectChanges();

    expect(host.index()).toBe(1);
    expect(track().style.transform).toBe('translateX(-100%)');
  });

  it('advances on a left swipe and goes back on a right swipe', () => {
    (
      component as unknown as {
        onPointerDown(event: { clientX: number }): void;
        onPointerMove(event: { clientX: number }): void;
      }
    ).onPointerDown({ clientX: 200 });
    (
      component as unknown as {
        onPointerMove(event: { clientX: number }): void;
      }
    ).onPointerMove({ clientX: 100 });
    fixture.detectChanges();
    expect(host.index()).toBe(1);

    (
      component as unknown as {
        onPointerDown(event: { clientX: number }): void;
        onPointerMove(event: { clientX: number }): void;
      }
    ).onPointerDown({ clientX: 100 });
    (
      component as unknown as {
        onPointerMove(event: { clientX: number }): void;
      }
    ).onPointerMove({ clientX: 200 });
    fixture.detectChanges();
    expect(host.index()).toBe(0);
  });

  it('autoplays when enabled and advances on the interval', () => {
    vi.useFakeTimers();
    host.autoplay.set(true);
    fixture.detectChanges();

    vi.advanceTimersByTime(1000);
    expect(host.index()).toBe(1);

    vi.advanceTimersByTime(1000);
    expect(host.index()).toBe(2);

    vi.useRealTimers();
  });

  it('navigates to a slide when a dot is clicked', () => {
    dots()[2].click();
    fixture.detectChanges();

    expect(host.index()).toBe(2);
    expect(track().style.transform).toBe('translateX(-200%)');
  });

  it('marks the active dot with aria-current', () => {
    host.index.set(1);
    fixture.detectChanges();

    expect(dots()[1].getAttribute('aria-current')).toBe('true');
    expect(dots()[0].getAttribute('aria-current')).toBeNull();
  });
});
