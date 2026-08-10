import { Component, Type, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LucideTrendingUp } from '@lucide/angular';
import { StatCardComponent, StatCardAccent } from './stat-card.component';

@Component({
  selector: 'stat-card-host',
  standalone: true,
  imports: [StatCardComponent],
  template: `
    <ui-stat-card
      [icon]="icon()"
      [label]="label()"
      [value]="value()"
      [sublabel]="sublabel()"
      [accent]="accent()"
    />
  `,
})
class StatCardHost {
  readonly icon = signal<Type<unknown> | null>(LucideTrendingUp);
  readonly label = signal('Ingresos');
  readonly value = signal('12.400');
  readonly sublabel = signal('+8% vs. mes anterior');
  readonly accent = signal<StatCardAccent>('brand');
}

describe('StatCardComponent', () => {
  let fixture: ComponentFixture<StatCardHost>;
  let host: StatCardHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StatCardHost] }).compileComponents();
    fixture = TestBed.createComponent(StatCardHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const el = () => fixture.nativeElement.querySelector('ui-stat-card') as HTMLElement;

  it('renders label, value and sublabel', () => {
    expect(el().textContent).toContain('Ingresos');
    expect(el().textContent).toContain('12.400');
    expect(el().textContent).toContain('+8% vs. mes anterior');
  });

  it('omits the sublabel when empty', () => {
    host.sublabel.set('');
    fixture.detectChanges();
    expect(el().textContent).not.toContain('+8%');
  });

  it('renders the icon with the accent classes', () => {
    const iconWrap = el().querySelector('span') as HTMLElement;
    expect(iconWrap.querySelector('svg')).toBeTruthy();
    expect(iconWrap.classList.contains('bg-brand-500/10')).toBe(true);
  });

  it('hides the icon container when no icon is provided', () => {
    host.icon.set(null);
    fixture.detectChanges();
    expect(el().querySelector('span')).toBeNull();
  });

  it('applies accent-specific classes', () => {
    const iconWrap = () => el().querySelector('span') as HTMLElement;
    host.accent.set('green');
    fixture.detectChanges();
    expect(iconWrap().classList.contains('bg-emerald-500/10')).toBe(true);
    host.accent.set('amber');
    fixture.detectChanges();
    expect(iconWrap().classList.contains('bg-amber-500/10')).toBe(true);
    host.accent.set('pink');
    fixture.detectChanges();
    expect(iconWrap().classList.contains('bg-pink-500/10')).toBe(true);
  });
});
