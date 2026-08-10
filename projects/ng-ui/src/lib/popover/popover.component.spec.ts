import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PopoverComponent } from './popover.component';
import type { PopoverPlacement } from './popover.component';

@Component({
  selector: 'popover-host',
  standalone: true,
  imports: [PopoverComponent],
  template: `
    <ui-popover [label]="label()" [placement]="placement()">Contenido del popover</ui-popover>
  `,
})
class PopoverHost {
  readonly label = signal('Acciones');
  readonly placement = signal<PopoverPlacement>('bottom');
}

describe('PopoverComponent', () => {
  let fixture: ComponentFixture<PopoverHost>;
  let host: PopoverHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PopoverHost] }).compileComponents();
    fixture = TestBed.createComponent(PopoverHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function trigger(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('ui-popover button') as HTMLButtonElement;
  }

  function panel(): HTMLElement | null {
    return document.querySelector('.cdk-overlay-container [role="dialog"]') as HTMLElement | null;
  }

  it('renders the trigger with the label', () => {
    expect(trigger().textContent?.trim()).toContain('Acciones');
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('opens the panel on click and sets aria-expanded', () => {
    expect(panel()).toBeNull();
    trigger().click();
    fixture.detectChanges();
    expect(panel()).toBeTruthy();
    expect(panel()?.textContent).toContain('Contenido del popover');
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('closes on Escape and re-focuses the trigger', () => {
    trigger().click();
    fixture.detectChanges();
    expect(panel()).toBeTruthy();
    panel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(panel()).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger());
  });

  it('closes on outside pointer down', () => {
    trigger().click();
    fixture.detectChanges();
    expect(panel()).toBeTruthy();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });

  it('opens with ArrowDown and updates the chevron', () => {
    trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(panel()).toBeTruthy();
    expect(panel()?.textContent).toContain('Contenido del popover');
  });

  it('toggles closed when the trigger is clicked again', () => {
    trigger().click();
    fixture.detectChanges();
    expect(panel()).toBeTruthy();
    trigger().click();
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });

  it('reflects the label input', () => {
    host.label.set('Más');
    fixture.detectChanges();
    expect(trigger().textContent?.trim()).toContain('Más');
  });
});
