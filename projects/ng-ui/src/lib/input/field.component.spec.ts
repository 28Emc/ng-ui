import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FieldComponent } from './field.component';
import { InputComponent } from './input.component';

@Component({
  selector: 'field-host',
  standalone: true,
  imports: [FieldComponent, InputComponent],
  template: `
    <ui-field [label]="label()" [required]="required()" [error]="error()" [hint]="hint()">
      <ui-input />
    </ui-field>
  `,
})
class FieldHost {
  readonly label = signal('Correo');
  readonly required = signal(false);
  readonly error = signal<string | null>(null);
  readonly hint = signal<string | null>(null);
}

describe('FieldComponent', () => {
  let fixture: ComponentFixture<FieldHost>;
  let host: FieldHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FieldHost] }).compileComponents();
    fixture = TestBed.createComponent(FieldHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const input = () => fixture.nativeElement.querySelector('input') as HTMLInputElement;

  it('renders the label and the projected control', () => {
    expect(fixture.nativeElement.textContent).toContain('Correo');
    expect(input()).toBeTruthy();
  });

  it('shows a required asterisk', () => {
    host.required.set(true);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('label') as HTMLElement;
    expect(label.textContent).toContain('*');
  });

  it('renders an error with an icon and wires aria-describedby', () => {
    host.error.set('Campo obligatorio');
    fixture.detectChanges();
    const error = fixture.nativeElement.querySelector('ui-field-error') as HTMLElement;
    expect(error.textContent).toContain('Campo obligatorio');
    expect(error.querySelector('svg')).toBeTruthy();
    const describedBy = input().getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(error.querySelector('p')?.id).toBe(describedBy);
  });

  it('renders the hint when there is no error', () => {
    host.hint.set('Solo un correo');
    fixture.detectChanges();
    const p = fixture.nativeElement.querySelector('label p') as HTMLElement;
    expect(p.textContent).toContain('Solo un correo');
    expect(input().getAttribute('aria-describedby')).toBe(p.id);
  });

  it('prefers the error over the hint', () => {
    host.error.set('Inválido');
    host.hint.set('Ayuda');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ui-field-error')).toBeTruthy();
    expect(fixture.nativeElement.textContent).not.toContain('Ayuda');
  });
});
