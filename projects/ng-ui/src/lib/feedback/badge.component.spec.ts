import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { BadgeComponent, BadgeVariant } from './badge.component';

@Component({
  selector: 'badge-host',
  standalone: true,
  imports: [BadgeComponent],
  template: ` <ui-badge [variant]="variant()">Nuevo</ui-badge> `,
})
class BadgeHost {
  readonly variant = signal<BadgeVariant>('default');
}

describe('BadgeComponent', () => {
  let fixture: ComponentFixture<BadgeHost>;
  let host: BadgeHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BadgeHost] }).compileComponents();
    fixture = TestBed.createComponent(BadgeHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const span = () => fixture.nativeElement.querySelector('span') as HTMLElement;

  it('renders projected content', () => {
    expect(span().textContent?.trim()).toBe('Nuevo');
  });

  it('applies the default variant classes', () => {
    expect(span().classList.contains('bg-surface-2')).toBe(true);
    expect(span().classList.contains('text-fg')).toBe(true);
  });

  it('applies variant-specific classes', () => {
    host.variant.set('brand');
    fixture.detectChanges();
    expect(span().classList.contains('bg-brand-500/10')).toBe(true);
    expect(span().classList.contains('text-brand-700')).toBe(true);

    host.variant.set('green');
    fixture.detectChanges();
    expect(span().classList.contains('bg-emerald-500/10')).toBe(true);

    host.variant.set('amber');
    fixture.detectChanges();
    expect(span().classList.contains('bg-amber-500/10')).toBe(true);

    host.variant.set('gray');
    fixture.detectChanges();
    expect(span().classList.contains('bg-slate-500/10')).toBe(true);
  });
});
