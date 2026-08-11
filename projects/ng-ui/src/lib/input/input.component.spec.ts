import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { InputComponent, InputDensity, InputType } from './input.component';

@Component({
  selector: 'input-host',
  standalone: true,
  imports: [InputComponent, FormsModule],
  template: `
    <ui-input
      [type]="type()"
      [placeholder]="placeholder()"
      [id]="id()"
      [name]="name()"
      [autocomplete]="autocomplete()"
      [invalid]="invalid()"
      [disabled]="disabled()"
      [density]="density()"
      [(ngModel)]="value"
    />
  `,
})
class InputHost {
  readonly type = signal<InputType>('text');
  readonly placeholder = signal('');
  readonly id = signal('');
  readonly name = signal('');
  readonly autocomplete = signal('');
  readonly invalid = signal(false);
  readonly disabled = signal(false);
  readonly density = signal<InputDensity>('comfortable');
  value = '';
}

describe('InputComponent', () => {
  let fixture: ComponentFixture<InputHost>;
  let host: InputHost;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InputHost] }).compileComponents();
    fixture = TestBed.createComponent(InputHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  });

  it('renders a text input with placeholder and id', () => {
    host.placeholder.set('Nombre');
    host.id.set('nombre');
    fixture.detectChanges();
    expect(input.placeholder).toBe('Nombre');
    expect(input.id).toBe('nombre');
  });

  it('supports different types', () => {
    host.type.set('password');
    fixture.detectChanges();
    expect(input.type).toBe('password');
  });

  it('updates the model on input', () => {
    input.value = 'Ana';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.value).toBe('Ana');
  });

  it('reflects a programmatic value through writeValue', () => {
    const comp = fixture.debugElement.query(By.directive(InputComponent))
      .componentInstance as InputComponent;
    comp.writeValue('Carlos');
    fixture.detectChanges();
    expect(input.value).toBe('Carlos');
  });

  it('marks the field invalid via aria-invalid', () => {
    host.invalid.set(true);
    fixture.detectChanges();
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('forwards name and autocomplete attributes', () => {
    host.name.set('email');
    host.autocomplete.set('email');
    fixture.detectChanges();
    expect(input.getAttribute('name')).toBe('email');
    expect(input.getAttribute('autocomplete')).toBe('email');
  });

  it('disables the input', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
  });

  it('tracks touched state on blur', () => {
    const comp = fixture.debugElement.query(By.directive(InputComponent))
      .componentInstance as InputComponent;
    const touched = vi.fn();
    comp.registerOnTouched(touched);
    input.dispatchEvent(new Event('blur'));
    expect(touched).toHaveBeenCalled();
  });

  it('reflects the density on the host and applies compact/spacious classes', () => {
    const hostEl = fixture.nativeElement.querySelector('ui-input') as HTMLElement;
    expect(hostEl.getAttribute('data-density')).toBe('comfortable');

    host.density.set('compact');
    fixture.detectChanges();
    expect(hostEl.getAttribute('data-density')).toBe('compact');
    expect(input.classList.contains('density-compact:py-2')).toBe(true);

    host.density.set('spacious');
    fixture.detectChanges();
    expect(hostEl.getAttribute('data-density')).toBe('spacious');
    expect(input.classList.contains('density-spacious:py-3')).toBe(true);
  });
});
