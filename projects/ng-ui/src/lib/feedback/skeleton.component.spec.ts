import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { SkeletonComponent } from './skeleton.component';

@Component({
  selector: 'skeleton-host',
  standalone: true,
  imports: [SkeletonComponent],
  template: ` <ui-skeleton [class]="extraClass()" /> `,
})
class SkeletonHost {
  readonly extraClass = signal('');
}

describe('SkeletonComponent', () => {
  let fixture: ComponentFixture<SkeletonHost>;
  let host: SkeletonHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SkeletonHost] }).compileComponents();
    fixture = TestBed.createComponent(SkeletonHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a hidden placeholder block', () => {
    const el = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('applies the pulse placeholder classes', () => {
    const el = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(el.classList.contains('animate-pulse')).toBe(true);
    expect(el.classList.contains('bg-surface-2')).toBe(true);
  });

  it('merges an extra class', () => {
    host.extraClass.set('h-20');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(el.classList.contains('h-20')).toBe(true);
  });
});
