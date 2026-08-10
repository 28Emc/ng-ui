import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AvatarGroupComponent, AvatarGroupUser } from './avatar-group.component';
import { AvatarSize } from './avatar.component';

const USERS: AvatarGroupUser[] = [
  { name: 'Ana López' },
  { name: 'Juan Pérez', color: '#6f86c9' },
  { name: 'María García' },
  { name: 'Carlos Ruiz', color: '#c2706a' },
  { name: 'Lucía Gómez' },
  { name: 'Pedro Sánchez' },
];

@Component({
  selector: 'avatar-group-host',
  standalone: true,
  imports: [AvatarGroupComponent],
  template: `<ui-avatar-group [avatars]="avatars()" [max]="max()" [size]="size()" />`,
})
class AvatarGroupHost {
  readonly avatars = signal<AvatarGroupUser[]>(USERS);
  readonly max = signal(5);
  readonly size = signal<AvatarSize>('md');
}

describe('AvatarGroupComponent', () => {
  let fixture: ComponentFixture<AvatarGroupHost>;
  let host: AvatarGroupHost;
  let el: HTMLElement;

  const avatars = () => Array.from(el.querySelectorAll('ui-avatar'));
  const counter = () => el.querySelector('[role="img"]') as HTMLElement | null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarGroupHost],
    }).compileComponents();
    fixture = TestBed.createComponent(AvatarGroupHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.nativeElement.querySelector('ui-avatar-group') as HTMLElement;
  });

  it('renders one avatar per visible user within max', () => {
    host.avatars.set(USERS.slice(0, 3));
    fixture.detectChanges();
    expect(avatars()).toHaveLength(3);
    expect(counter()).toBeNull();
  });

  it('shows the +N counter when the list exceeds max', () => {
    expect(avatars()).toHaveLength(5);
    const counterEl = counter();
    expect(counterEl).toBeTruthy();
    expect(counterEl?.textContent?.replace(/\s+/g, ' ').trim()).toBe('+1');
  });

  it('labels the counter with the total user count', () => {
    const counterEl = counter();
    expect(counterEl?.getAttribute('aria-label')).toBe('6 usuarios');
  });

  it('honors a custom max', () => {
    host.max.set(3);
    fixture.detectChanges();
    expect(avatars()).toHaveLength(3);
    expect(counter()?.textContent?.replace(/\s+/g, ' ').trim()).toBe('+3');
    expect(counter()?.getAttribute('aria-label')).toBe('6 usuarios');
  });

  it('adds no counter when max is not exceeded', () => {
    host.avatars.set(USERS);
    host.max.set(6);
    fixture.detectChanges();
    expect(avatars()).toHaveLength(6);
    expect(counter()).toBeNull();
  });

  it('describes the full group via aria-label', () => {
    const group = el.querySelector('[role="group"]') as HTMLElement;
    expect(group.getAttribute('aria-label')).toBe(
      '6 participantes: Ana López, Juan Pérez, María García, Carlos Ruiz, Lucía Gómez, Pedro Sánchez',
    );
  });

  it('overlaps avatars after the first one', () => {
    const wrappers = Array.from(avatars()).map((a) => a.parentElement as HTMLElement);
    expect(wrappers[0].classList.contains('ml-0')).toBe(true);
    expect(wrappers[1].classList.contains('-ml-2')).toBe(true);
  });

  it('passes custom colors and renders size classes', () => {
    const first = avatars()[0].querySelector('span') as HTMLElement;
    expect(first.classList.contains('h-10')).toBe(true);
    host.size.set('sm');
    fixture.detectChanges();
    expect(first.classList.contains('h-8')).toBe(true);
    host.size.set('lg');
    fixture.detectChanges();
    expect(first.classList.contains('h-12')).toBe(true);
    const second = avatars()[1].querySelector('span') as HTMLElement;
    expect(second.style.background).toBe('rgb(111, 134, 201)');
  });

  it('applies size classes to the counter', () => {
    const counterSpan = counter()?.querySelector('span') as HTMLElement;
    expect(counterSpan.classList.contains('h-10')).toBe(true);
    host.size.set('sm');
    fixture.detectChanges();
    expect(counterSpan.classList.contains('h-8')).toBe(true);
  });
});
