import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { SelectComponent } from './select.component';

@Component({
  selector: 'select-host',
  standalone: true,
  imports: [SelectComponent, FormsModule],
  template: `
    <ui-select
      [placeholder]="placeholder()"
      [name]="name()"
      [autocomplete]="autocomplete()"
      [invalid]="invalid()"
      [disabled]="disabled()"
      [(ngModel)]="value"
    >
      <option value="a">Opción A</option>
      <option value="b">Opción B</option>
    </ui-select>
  `,
})
class SelectHost {
  readonly placeholder = signal('');
  readonly name = signal('');
  readonly autocomplete = signal('');
  readonly invalid = signal(false);
  readonly disabled = signal(false);
  value = '';
}

describe('SelectComponent', () => {
  let fixture: ComponentFixture<SelectHost>;
  let host: SelectHost;
  let select: HTMLSelectElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SelectHost] }).compileComponents();
    fixture = TestBed.createComponent(SelectHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
  });

  it('renders options and a hidden placeholder option', () => {
    expect(Array.from(select.options).map((o) => o.value)).toEqual(['a', 'b']);
    host.placeholder.set('Elegir…');
    fixture.detectChanges();
    expect(Array.from(select.options).map((o) => o.value)).toEqual(['', 'a', 'b']);
    const placeholder = select.options[0] as HTMLOptionElement;
    expect(placeholder.disabled).toBe(true);
    expect(placeholder.hidden).toBe(true);
    expect(placeholder.textContent).toBe('Elegir…');
  });

  it('updates the model on change', () => {
    select.value = 'b';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(host.value).toBe('b');
  });

  it('reflects a programmatic value through writeValue', () => {
    const comp = fixture.debugElement.query(By.directive(SelectComponent))
      .componentInstance as SelectComponent;
    comp.writeValue('b');
    fixture.detectChanges();
    expect(select.value).toBe('b');
  });

  it('marks the field invalid via aria-invalid', () => {
    host.invalid.set(true);
    fixture.detectChanges();
    expect(select.getAttribute('aria-invalid')).toBe('true');
  });

  it('disables the select', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    expect(select.disabled).toBe(true);
  });

  it('applies the chevron background and appearance reset', () => {
    expect(select.classList.contains('appearance-none')).toBe(true);
    expect(select.style.backgroundImage).toContain('data:image/svg+xml');
  });

  it('forwards name and autocomplete attributes', () => {
    host.name.set('country');
    host.autocomplete.set('country-name');
    fixture.detectChanges();
    expect(select.getAttribute('name')).toBe('country');
    expect(select.getAttribute('autocomplete')).toBe('country-name');
  });

  it('tracks touched state on blur', () => {
    const comp = fixture.debugElement.query(By.directive(SelectComponent))
      .componentInstance as SelectComponent;
    const touched = vi.fn();
    comp.registerOnTouched(touched);
    select.dispatchEvent(new Event('blur'));
    expect(touched).toHaveBeenCalled();
  });
});
