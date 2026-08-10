import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { StepperComponent } from './stepper.component';

@Component({
  selector: 'stepper-host',
  standalone: true,
  imports: [StepperComponent],
  template: ` <ui-stepper [steps]="steps()" [labels]="labels()" [(activeIndex)]="active" /> `,
})
class StepperHost {
  readonly steps = signal(4);
  readonly labels = signal(['A', 'B', 'C', 'D']);
  readonly active = signal(2);
}

describe('StepperComponent', () => {
  let fixture: ComponentFixture<StepperHost>;
  let host: StepperHost;
  let circles: HTMLElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StepperHost] }).compileComponents();
    fixture = TestBed.createComponent(StepperHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    circles = Array.from(
      fixture.nativeElement.querySelectorAll('ui-stepper .rounded-full'),
    ) as HTMLElement[];
  });

  it('renders one circle per step', () => {
    expect(circles.length).toBe(4);
  });

  it('marks the active step with aria-current', () => {
    expect(circles[2].getAttribute('aria-current')).toBe('step');
    expect(circles[0].getAttribute('aria-current')).toBeNull();
  });

  it('shows a check icon on completed steps', () => {
    expect(circles[0].querySelector('svg')).toBeTruthy();
    expect(circles[1].querySelector('svg')).toBeTruthy();
    expect(circles[2].querySelector('svg')).toBeNull();
  });

  it('shows the step number on the active and future steps', () => {
    expect(circles[2].textContent?.trim()).toBe('3');
    expect(circles[3].textContent?.trim()).toBe('4');
  });

  it('renders labels', () => {
    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('ui-stepper .px-1') as NodeListOf<HTMLElement>,
    ).map((n) => n.textContent?.trim());
    expect(labels).toEqual(['A', 'B', 'C', 'D']);
  });

  it('updates on programmatic activeIndex change', () => {
    host.active.set(0);
    fixture.detectChanges();
    expect(circles[0].getAttribute('aria-current')).toBe('step');
    expect(circles[2].getAttribute('aria-current')).toBeNull();
  });
});
