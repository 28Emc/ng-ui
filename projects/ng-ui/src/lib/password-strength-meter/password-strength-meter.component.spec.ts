import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { PasswordStrengthMeterComponent } from './password-strength-meter.component';
import { evaluatePassword } from './password-strength.utils';

@Component({
  selector: 'psm-host',
  standalone: true,
  imports: [PasswordStrengthMeterComponent, FormsModule],
  template: `
    <ui-password-strength-meter
      [placeholder]="placeholder()"
      [showCriteria]="showCriteria()"
      [invalid]="invalid()"
      [disabled]="disabled()"
      [ngModel]="value()"
      (ngModelChange)="value.set($event)"
    />
  `,
})
class PsmHost {
  readonly placeholder = signal('Contraseña');
  readonly showCriteria = signal(true);
  readonly invalid = signal(false);
  readonly disabled = signal(false);
  readonly value = signal('');
}

describe('PasswordStrengthMeterComponent', () => {
  let fixture: ComponentFixture<PsmHost>;
  let host: PsmHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PsmHost] }).compileComponents();
    fixture = TestBed.createComponent(PsmHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input') as HTMLInputElement;
  }

  function toggle(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  }

  function type(value: string): void {
    const el = input();
    el.value = value;
    el.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }),
    );
    fixture.detectChanges();
  }

  function filledSegments(): number {
    return fixture.nativeElement.querySelectorAll(
      'span.bg-red-500, span.bg-amber-500, span.bg-lime-500, span.bg-green-500',
    ).length;
  }

  function label(): string | null {
    const el = fixture.nativeElement.querySelector('[role="meter"] span.text-xs.font-medium');
    return el ? (el.textContent?.trim() ?? null) : null;
  }

  function criteriaItems(): HTMLLIElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('li')) as HTMLLIElement[];
  }

  function comp(): PasswordStrengthMeterComponent {
    return fixture.debugElement.query(By.directive(PasswordStrengthMeterComponent))
      .componentInstance as PasswordStrengthMeterComponent;
  }

  describe('evaluatePassword', () => {
    it('returns empty level for an empty password', () => {
      const result = evaluatePassword('');
      expect(result.level).toBe('empty');
      expect(result.score).toBe(0);
    });

    it('classifies weak (score 1)', () => {
      const result = evaluatePassword('abc');
      expect(result.level).toBe('weak');
      expect(result.score).toBe(1);
      expect(result.checks.lowercase).toBe(true);
    });

    it('classifies fair (score 3)', () => {
      const result = evaluatePassword('Abc123');
      expect(result.level).toBe('fair');
      expect(result.score).toBe(3);
      expect(result.checks.length).toBe(false);
    });

    it('classifies good (score 4)', () => {
      const result = evaluatePassword('Tr0bador');
      expect(result.level).toBe('good');
      expect(result.score).toBe(4);
      expect(result.checks.symbol).toBe(false);
    });

    it('classifies strong (score 5)', () => {
      const result = evaluatePassword('Tr0b4dor!2026');
      expect(result.level).toBe('strong');
      expect(result.score).toBe(5);
      expect(result.checks.symbol).toBe(true);
    });
  });

  it('renders a password input with the default placeholder', () => {
    expect(input().type).toBe('password');
    expect(input().placeholder).toBe('Contraseña');
  });

  it('uses the provided placeholder', () => {
    host.placeholder.set('Crea una contraseña');
    fixture.detectChanges();
    expect(input().placeholder).toBe('Crea una contraseña');
  });

  it('updates the model while typing', () => {
    type('hola');
    expect(host.value()).toBe('hola');
  });

  it('reflects the model value through writeValue', () => {
    comp().writeValue('Secreto#1');
    fixture.detectChanges();
    expect(input().value).toBe('Secreto#1');
  });

  it('toggles the visibility of the password', () => {
    type('secreto');
    expect(input().type).toBe('password');
    expect(toggle().getAttribute('aria-pressed')).toBe('false');
    expect(toggle().getAttribute('aria-label')).toBe('Mostrar contraseña');

    toggle().click();
    fixture.detectChanges();
    expect(input().type).toBe('text');
    expect(toggle().getAttribute('aria-pressed')).toBe('true');
    expect(toggle().getAttribute('aria-label')).toBe('Ocultar contraseña');
    expect(input().value).toBe('secreto');

    toggle().click();
    fixture.detectChanges();
    expect(input().type).toBe('password');
  });

  it('shows the strength bar only when there is a password', () => {
    expect(fixture.nativeElement.querySelector('[role="meter"]')).toBeNull();
    type('abc');
    expect(fixture.nativeElement.querySelector('[role="meter"]')).not.toBeNull();
  });

  it('shows the weak label with one filled segment', () => {
    type('abc');
    expect(label()).toBe('Débil');
    expect(filledSegments()).toBe(1);
  });

  it('shows the strong label with all segments filled', () => {
    type('Tr0b4dor!2026');
    expect(label()).toBe('Fuerte');
    expect(filledSegments()).toBe(5);
  });

  it('exposes the score through the meter value', () => {
    type('Abc123');
    const meter = fixture.nativeElement.querySelector('[role="meter"]');
    expect(meter.getAttribute('aria-valuenow')).toBe('3');
    expect(meter.getAttribute('aria-valuemax')).toBe('5');
  });

  it('renders a criteria list with met and unmet states', () => {
    type('Abc123');
    const items = criteriaItems();
    expect(items.length).toBe(5);
    const met = items.filter((item) => item.classList.contains('text-fg')).length;
    const unmet = items.filter((item) => item.classList.contains('text-muted')).length;
    expect(met).toBe(3);
    expect(unmet).toBe(2);
    const checks = fixture.nativeElement.querySelectorAll('svg.text-green-600');
    expect(checks.length).toBe(3);
  });

  it('hides the criteria list with showCriteria=false', () => {
    host.showCriteria.set(false);
    type('Abc123');
    expect(criteriaItems().length).toBe(0);
  });

  it('marks the input as invalid', () => {
    host.invalid.set(true);
    fixture.detectChanges();
    expect(input().className).toContain('border-danger');
  });

  it('disables the input and the toggle', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    expect(input().disabled).toBe(true);
    expect(toggle().disabled).toBe(true);
  });
});
