import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ProgressComponent, ProgressSize } from './progress.component';

@Component({
  selector: 'progress-host',
  standalone: true,
  imports: [ProgressComponent],
  template: `
    <ui-progress
      [value]="value()"
      [max]="max()"
      [size]="size()"
      [indeterminate]="indeterminate()"
      [label]="label()"
    />
  `,
})
class ProgressHost {
  readonly value = signal(50);
  readonly max = signal(100);
  readonly size = signal<ProgressSize>('md');
  readonly indeterminate = signal(false);
  readonly label = signal('');
}

describe('ProgressComponent', () => {
  let fixture: ComponentFixture<ProgressHost>;
  let host: ProgressHost;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressHost],
    }).compileComponents();
    fixture = TestBed.createComponent(ProgressHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
  });

  it('renders a progressbar with correct ARIA attributes', () => {
    expect(el.getAttribute('role')).toBe('progressbar');
    expect(el.getAttribute('aria-valuenow')).toBe('50');
    expect(el.getAttribute('aria-valuemin')).toBe('0');
    expect(el.getAttribute('aria-valuemax')).toBe('100');
  });

  it('fills the bar to the correct percentage', () => {
    const fill = el.querySelector('[style*="width"]') as HTMLElement;
    expect(fill.style.width).toBe('50%');
  });

  it('clamps the value to the max', () => {
    host.value.set(150);
    fixture.detectChanges();
    expect(el.getAttribute('aria-valuenow')).toBe('100');
    const fill = el.querySelector('[style*="width"]') as HTMLElement;
    expect(fill.style.width).toBe('100%');
  });

  it('clamps negative values to zero', () => {
    host.value.set(-10);
    fixture.detectChanges();
    expect(el.getAttribute('aria-valuenow')).toBe('0');
  });

  it('supports a custom max', () => {
    host.value.set(5);
    host.max.set(10);
    fixture.detectChanges();
    expect(el.getAttribute('aria-valuenow')).toBe('5');
    const fill = el.querySelector('[style*="width"]') as HTMLElement;
    expect(fill.style.width).toBe('50%');
  });

  it('renders size classes', () => {
    expect(el.classList.contains('h-2')).toBe(true);
    host.size.set('sm');
    fixture.detectChanges();
    expect(el.classList.contains('h-1.5')).toBe(true);
    host.size.set('lg');
    fixture.detectChanges();
    expect(el.classList.contains('h-3')).toBe(true);
  });

  it('shows an indeterminate bar and hides value attributes', () => {
    host.indeterminate.set(true);
    fixture.detectChanges();
    expect(el.getAttribute('aria-valuenow')).toBeNull();
    const bar = el.querySelector('.indeterminate-bar') as HTMLElement | null;
    expect(bar).toBeTruthy();
    expect(bar?.classList.contains('animate-indeterminate')).toBe(true);
    expect(bar?.classList.contains('absolute')).toBe(true);
    expect(el.querySelector('[style*="width"]')).toBeNull();
  });

  it('sets the aria-label', () => {
    host.label.set('Carga');
    fixture.detectChanges();
    expect(el.getAttribute('aria-label')).toBe('Carga');
  });
});
