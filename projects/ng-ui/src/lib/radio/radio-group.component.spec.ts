import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RadioGroupComponent } from './radio-group.component';
import { RadioComponent } from './radio.component';

@Component({
  selector: 'radio-group-host',
  standalone: true,
  imports: [RadioGroupComponent, RadioComponent, FormsModule],
  template: `
    <ui-radio-group [label]="label()" [disabled]="disabled()" [(ngModel)]="value">
      <ui-radio value="a" label="Opción A" description="Primera" />
      <ui-radio value="b" label="Opción B" />
    </ui-radio-group>
  `,
})
class RadioGroupHost {
  readonly label = signal('Elige una');
  readonly disabled = signal(false);
  value = '';
}

describe('RadioGroupComponent', () => {
  let fixture: ComponentFixture<RadioGroupHost>;
  let host: RadioGroupHost;
  let fieldset: HTMLFieldSetElement;
  let radios: HTMLButtonElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RadioGroupHost] }).compileComponents();
    fixture = TestBed.createComponent(RadioGroupHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    fieldset = fixture.nativeElement.querySelector('fieldset') as HTMLFieldSetElement;
    radios = Array.from(
      fixture.nativeElement.querySelectorAll('button[role="radio"]'),
    ) as HTMLButtonElement[];
  });

  it('renders a labelled radiogroup with options', () => {
    expect(fieldset.getAttribute('role')).toBe('radiogroup');
    const legend = fieldset.querySelector('legend') as HTMLElement;
    expect(legend.textContent).toContain('Elige una');
    expect(fieldset.getAttribute('aria-labelledby')).toBe(legend.id);
    expect(radios).toHaveLength(2);
  });

  it('starts with no selection', () => {
    expect(radios[0].getAttribute('aria-checked')).toBe('false');
    expect(radios[1].getAttribute('aria-checked')).toBe('false');
  });

  it('selects a radio and updates the model on click', () => {
    radios[0].click();
    fixture.detectChanges();
    expect(host.value).toBe('a');
    expect(radios[0].getAttribute('aria-checked')).toBe('true');
    expect(radios[1].getAttribute('aria-checked')).toBe('false');
  });

  it('reflects a programmatic value', () => {
    const comp = fixture.debugElement.query(By.directive(RadioGroupComponent))
      .componentInstance as RadioGroupComponent;
    comp.writeValue('b');
    fixture.detectChanges();
    expect(radios[1].getAttribute('aria-checked')).toBe('true');
  });

  it('renders radio labels and descriptions', () => {
    const text = fieldset.textContent;
    expect(text).toContain('Opción A');
    expect(text).toContain('Primera');
    expect(text).toContain('Opción B');
  });

  it('blocks selection when the group is disabled', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    expect(radios[0].disabled).toBe(true);
    radios[0].click();
    fixture.detectChanges();
    expect(host.value).toBe('');
  });

  it('tracks touched state on select', () => {
    const comp = fixture.debugElement.query(By.directive(RadioGroupComponent))
      .componentInstance as RadioGroupComponent;
    const touched = vi.fn();
    comp.registerOnTouched(touched);
    radios[0].click();
    expect(touched).toHaveBeenCalled();
  });
});
