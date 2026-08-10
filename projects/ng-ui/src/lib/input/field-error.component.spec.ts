import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FieldErrorComponent } from './field-error.component';

@Component({
  selector: 'field-error-host',
  standalone: true,
  imports: [FieldErrorComponent],
  template: ` <ui-field-error [id]="id()">Mensaje de error</ui-field-error> `,
})
class FieldErrorHost {
  readonly id = signal('');
}

describe('FieldErrorComponent', () => {
  let fixture: ComponentFixture<FieldErrorHost>;
  let host: FieldErrorHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FieldErrorHost] }).compileComponents();
    fixture = TestBed.createComponent(FieldErrorHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const p = () => fixture.nativeElement.querySelector('p') as HTMLElement;

  it('renders the message with an alert icon', () => {
    expect(p().textContent).toContain('Mensaje de error');
    expect(p().querySelector('svg')).toBeTruthy();
  });

  it('applies an id for aria-describedby wiring', () => {
    host.id.set('err-1');
    fixture.detectChanges();
    expect(p().id).toBe('err-1');
  });
});
