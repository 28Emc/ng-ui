import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LabelComponent } from './label.component';

@Component({
  selector: 'label-host',
  standalone: true,
  imports: [LabelComponent],
  template: ` <ui-label [htmlFor]="htmlFor()" [required]="required()">Nombre</ui-label> `,
})
class LabelHost {
  readonly htmlFor = signal('');
  readonly required = signal(false);
}

describe('LabelComponent', () => {
  let fixture: ComponentFixture<LabelHost>;
  let host: LabelHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LabelHost] }).compileComponents();
    fixture = TestBed.createComponent(LabelHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const label = () => fixture.nativeElement.querySelector('label') as HTMLElement;

  it('renders the projected text', () => {
    expect(label().textContent).toContain('Nombre');
  });

  it('links the label via the for attribute', () => {
    host.htmlFor.set('nombre');
    fixture.detectChanges();
    expect((label() as HTMLLabelElement).htmlFor).toBe('nombre');
  });

  it('omits the for attribute when not set', () => {
    expect(label().getAttribute('for')).toBeNull();
  });

  it('shows a required asterisk', () => {
    host.required.set(true);
    fixture.detectChanges();
    expect(label().textContent).toContain('*');
  });
});
