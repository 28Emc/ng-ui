import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RadioGroupComponent } from './radio-group.component';
import { RadioComponent } from './radio.component';

@Component({
  selector: 'radio-host',
  standalone: true,
  imports: [RadioGroupComponent, RadioComponent, FormsModule],
  template: `
    <ui-radio-group
      label="Plan"
      [disabled]="disabled()"
      [ngModel]="plan()"
      (ngModelChange)="plan.set($event)"
    >
      <ui-radio value="free" label="Free" />
      <ui-radio value="pro" label="Pro" description="Avanzado" />
    </ui-radio-group>
  `,
})
class RadioHost {
  readonly plan = signal('free');
  readonly disabled = signal(false);
}

describe('RadioGroupComponent + RadioComponent', () => {
  let fixture: ComponentFixture<RadioHost>;
  let host: RadioHost;
  let group: RadioGroupComponent;
  let radios: HTMLButtonElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RadioHost] }).compileComponents();
    fixture = TestBed.createComponent(RadioHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    group = fixture.debugElement.query(By.directive(RadioGroupComponent))
      .componentInstance as RadioGroupComponent;
    group.writeValue('free');
    fixture.detectChanges();
    radios = Array.from(
      fixture.nativeElement.querySelectorAll('button[role="radio"]'),
    ) as HTMLButtonElement[];
  });

  it('renders the group legend', () => {
    const legend = fixture.nativeElement.querySelector('legend') as HTMLElement;
    expect(legend.textContent?.trim()).toBe('Plan');
  });

  it('checks the initial value', () => {
    expect(radios[0].getAttribute('aria-checked')).toBe('true');
    expect(radios[1].getAttribute('aria-checked')).toBe('false');
  });

  it('selects a radio on click', () => {
    radios[1].click();
    fixture.detectChanges();
    expect(host.plan()).toBe('pro');
    expect(radios[1].getAttribute('aria-checked')).toBe('true');
    expect(radios[0].getAttribute('aria-checked')).toBe('false');
  });

  it('reflects a programmatic value', () => {
    group.writeValue('pro');
    fixture.detectChanges();
    expect(radios[1].getAttribute('aria-checked')).toBe('true');
  });

  it('disables all radios when the group is disabled', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    expect(radios[0].disabled).toBe(true);
    radios[1].click();
    fixture.detectChanges();
    expect(host.plan()).toBe('free');
  });

  it('renders the selected label and description', () => {
    const texts = Array.from(
      fixture.nativeElement.querySelectorAll('span, p') as NodeListOf<HTMLElement>,
    ).map((n) => n.textContent?.trim());
    expect(texts).toContain('Pro');
    expect(texts).toContain('Avanzado');
  });
});
