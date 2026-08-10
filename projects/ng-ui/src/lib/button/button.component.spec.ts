import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ButtonComponent, ButtonSize, ButtonVariant } from './button.component';

@Component({
  selector: 'button-host',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <ui-button
      [type]="type()"
      [variant]="variant()"
      [size]="size()"
      [loading]="loading()"
      [disabled]="disabled()"
      [ariaLabel]="ariaLabel()"
      [ariaExpanded]="ariaExpanded()"
      ariaHaspopup="menu"
      (click)="onClick()"
    >
      Guardar
    </ui-button>
  `,
})
class ButtonHost {
  readonly type = signal<'button' | 'submit' | 'reset'>('button');
  readonly variant = signal<ButtonVariant>('primary');
  readonly size = signal<ButtonSize>('md');
  readonly loading = signal(false);
  readonly disabled = signal(false);
  readonly ariaLabel = signal('');
  readonly ariaExpanded = signal('');
  clicks = 0;

  onClick(): void {
    this.clicks++;
  }
}

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<ButtonHost>;
  let host: ButtonHost;
  let btn: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ButtonHost] }).compileComponents();
    fixture = TestBed.createComponent(ButtonHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  });

  it('renders projected content with type button by default', () => {
    expect(btn.textContent?.trim()).toBe('Guardar');
    expect(btn.type).toBe('button');
  });

  it('applies the primary variant and md size classes by default', () => {
    expect(btn.classList.contains('bg-brand-gradient')).toBe(true);
    expect(btn.classList.contains('h-10')).toBe(true);
  });

  it('switches variant and size classes', () => {
    host.variant.set('outline');
    host.size.set('sm');
    fixture.detectChanges();
    expect(btn.classList.contains('border-brand-300')).toBe(true);
    expect(btn.classList.contains('h-8')).toBe(true);
  });

  it('renders a spinner and disables the button while loading', () => {
    host.loading.set(true);
    fixture.detectChanges();
    expect(btn.querySelector('svg')).toBeTruthy();
    expect(btn.disabled).toBe(true);
    expect(btn.getAttribute('aria-busy')).toBe('true');
  });

  it('disables the button via the disabled input', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    expect(btn.disabled).toBe(true);
  });

  it('binds aria attributes', () => {
    host.ariaLabel.set('Guardar cambios');
    host.ariaExpanded.set('true');
    fixture.detectChanges();
    expect(btn.getAttribute('aria-label')).toBe('Guardar cambios');
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(btn.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('supports submit and reset types', () => {
    host.type.set('submit');
    fixture.detectChanges();
    expect(btn.type).toBe('submit');
    host.type.set('reset');
    fixture.detectChanges();
    expect(btn.type).toBe('reset');
  });

  it('emits a click event', () => {
    btn.click();
    expect(host.clicks).toBe(1);
  });

  it('ignores clicks while loading', () => {
    host.loading.set(true);
    fixture.detectChanges();
    btn.click();
    expect(host.clicks).toBe(0);
  });
});
