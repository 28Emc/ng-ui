import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormSectionComponent } from './form-section.component';

@Component({
  selector: 'form-section-host',
  standalone: true,
  imports: [FormSectionComponent],
  template: `
    <ui-form-section
      [title]="title()"
      [description]="description()"
      [invalid]="invalid()"
      [error]="error()"
    >
      <input data-test="field" placeholder="Campo" />
    </ui-form-section>
  `,
})
class FormSectionHost {
  readonly title = signal('Datos personales');
  readonly description = signal('Completa tu información de contacto');
  readonly invalid = signal(false);
  readonly error = signal<string | null>(null);
}

describe('FormSectionComponent', () => {
  let fixture: ComponentFixture<FormSectionHost>;
  let host: FormSectionHost;
  let el: HTMLElement;

  const section = () => el.querySelector('section') as HTMLElement | null;
  const error = () => el.querySelector('.text-red-600') as HTMLElement | null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormSectionHost] }).compileComponents();
    fixture = TestBed.createComponent(FormSectionHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.nativeElement.querySelector('ui-form-section') as HTMLElement;
  });

  it('renders title and description', () => {
    expect(el.textContent).toContain('Datos personales');
    expect(el.textContent).toContain('Completa tu información de contacto');
  });

  it('projects content into the body', () => {
    expect(el.querySelector('input[data-test="field"]')).toBeTruthy();
  });

  it('uses default border when valid', () => {
    expect(section()?.classList.contains('border-default')).toBe(true);
    expect(section()?.classList.contains('border-red-500')).toBe(false);
  });

  it('marks the section invalid with a red border', () => {
    host.invalid.set(true);
    fixture.detectChanges();
    expect(section()?.classList.contains('border-red-500')).toBe(true);
    expect(section()?.classList.contains('border-default')).toBe(false);
  });

  it('shows the error message and red border when error is set', () => {
    host.error.set('La sección tiene errores de validación.');
    fixture.detectChanges();
    expect(el.textContent).toContain('La sección tiene errores de validación.');
    expect(section()?.classList.contains('border-red-500')).toBe(true);
  });

  it('wires aria-labelledby from the section to the title', () => {
    const title = el.querySelector('h3') as HTMLElement;
    expect(section()?.getAttribute('aria-labelledby')).toBe(title.id);
  });

  it('separates header and body with a border', () => {
    const header = el.querySelector('header') as HTMLElement;
    expect(header.classList.contains('border-b')).toBe(true);
  });

  it('regenerates a unique title id per instance', () => {
    const firstId = (el.querySelector('h3') as HTMLElement).id;
    const second = TestBed.createComponent(FormSectionHost);
    second.detectChanges();
    const secondId = (second.nativeElement.querySelector('ui-form-section h3') as HTMLElement).id;
    expect(secondId).not.toBe(firstId);
  });

  it('hides the error message when error clears', () => {
    host.error.set('Algo salió mal.');
    fixture.detectChanges();
    expect(error()).toBeTruthy();
    host.error.set(null);
    fixture.detectChanges();
    expect(el.textContent).not.toContain('Algo salió mal.');
    expect(section()?.classList.contains('border-red-500')).toBe(false);
  });
});
