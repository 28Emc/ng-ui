import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { TextareaComponent } from './textarea.component';

@Component({
  selector: 'textarea-host',
  standalone: true,
  imports: [TextareaComponent, FormsModule],
  template: `
    <ui-textarea
      [rows]="rows()"
      [placeholder]="placeholder()"
      [name]="name()"
      [autocomplete]="autocomplete()"
      [invalid]="invalid()"
      [(ngModel)]="value"
    />
  `,
})
class TextareaHost {
  readonly rows = signal(4);
  readonly placeholder = signal('');
  readonly name = signal('');
  readonly autocomplete = signal('');
  readonly invalid = signal(false);
  value = '';
}

describe('TextareaComponent', () => {
  let fixture: ComponentFixture<TextareaHost>;
  let host: TextareaHost;
  let textarea: HTMLTextAreaElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TextareaHost] }).compileComponents();
    fixture = TestBed.createComponent(TextareaHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
  });

  it('renders a textarea with rows and placeholder', () => {
    expect(textarea.rows).toBe(4);
    host.placeholder.set('Detalles');
    fixture.detectChanges();
    expect(textarea.placeholder).toBe('Detalles');
  });

  it('updates the model on input', () => {
    textarea.value = 'Hola';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.value).toBe('Hola');
  });

  it('reflects a programmatic value through writeValue', () => {
    const comp = fixture.debugElement.query(By.directive(TextareaComponent))
      .componentInstance as TextareaComponent;
    comp.writeValue('Texto largo');
    fixture.detectChanges();
    expect(textarea.value).toBe('Texto largo');
  });

  it('marks the field invalid via aria-invalid', () => {
    host.invalid.set(true);
    fixture.detectChanges();
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
  });

  it('forwards name and autocomplete attributes', () => {
    host.name.set('comments');
    host.autocomplete.set('off');
    fixture.detectChanges();
    expect(textarea.getAttribute('name')).toBe('comments');
    expect(textarea.getAttribute('autocomplete')).toBe('off');
  });

  it('tracks touched state on blur', () => {
    const comp = fixture.debugElement.query(By.directive(TextareaComponent))
      .componentInstance as TextareaComponent;
    const touched = vi.fn();
    comp.registerOnTouched(touched);
    textarea.dispatchEvent(new Event('blur'));
    expect(touched).toHaveBeenCalled();
  });
});
