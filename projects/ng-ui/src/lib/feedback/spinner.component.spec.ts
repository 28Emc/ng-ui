import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { SpinnerComponent } from './spinner.component';

@Component({
  selector: 'spinner-host',
  standalone: true,
  imports: [SpinnerComponent],
  template: ` <ui-spinner [size]="size()" class="custom" /> `,
})
class SpinnerHost {
  readonly size = signal(16);
}

describe('SpinnerComponent', () => {
  let fixture: ComponentFixture<SpinnerHost>;
  let host: SpinnerHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SpinnerHost] }).compileComponents();
    fixture = TestBed.createComponent(SpinnerHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders an svg spinner with the configured size', () => {
    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('width')).toBe('16');
    host.size.set(28);
    fixture.detectChanges();
    expect(svg.getAttribute('width')).toBe('28');
  });

  it('applies the spin and brand classes plus custom class', () => {
    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('class')).toContain('animate-spin');
    expect(svg.getAttribute('class')).toContain('text-brand-500');
    expect(svg.getAttribute('class')).toContain('custom');
  });
});
