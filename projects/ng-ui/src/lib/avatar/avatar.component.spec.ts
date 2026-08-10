import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AvatarComponent, AvatarSize } from './avatar.component';

@Component({
  selector: 'avatar-host',
  standalone: true,
  imports: [AvatarComponent],
  template: ` <ui-avatar [name]="name()" [color]="color()" [size]="size()" /> `,
})
class AvatarHost {
  readonly name = signal('Ana López');
  readonly color = signal('');
  readonly size = signal<AvatarSize>('md');
}

describe('AvatarComponent', () => {
  let fixture: ComponentFixture<AvatarHost>;
  let host: AvatarHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AvatarHost] }).compileComponents();
    fixture = TestBed.createComponent(AvatarHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const span = () => fixture.nativeElement.querySelector('span') as HTMLElement;

  it('computes initials from first and last names', () => {
    expect(span().textContent?.trim()).toBe('AL');
  });

  it('uses the first two letters of a single-name user', () => {
    host.name.set('Ana');
    fixture.detectChanges();
    expect(span().textContent?.trim()).toBe('AN');
  });

  it('renders a fallback for an empty name', () => {
    host.name.set('  ');
    fixture.detectChanges();
    expect(span().textContent?.trim()).toBe('?');
  });

  it('applies the brand gradient by default', () => {
    expect(span().classList.contains('bg-brand-gradient')).toBe(true);
    expect(span().style.background).toBe('');
  });

  it('applies a custom background color', () => {
    host.color.set('#6f86c9');
    fixture.detectChanges();
    expect(span().style.background).toBe('rgb(111, 134, 201)');
    expect(span().classList.contains('bg-brand-gradient')).toBe(false);
  });

  it('switches between sizes', () => {
    expect(span().classList.contains('h-10')).toBe(true);
    host.size.set('sm');
    fixture.detectChanges();
    expect(span().classList.contains('h-8')).toBe(true);
    host.size.set('lg');
    fixture.detectChanges();
    expect(span().classList.contains('h-12')).toBe(true);
  });
});
