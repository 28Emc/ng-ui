import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AccordionComponent } from './accordion.component';
import { AccordionItemComponent } from './accordion-item.component';

@Component({
  selector: 'accordion-host',
  standalone: true,
  imports: [AccordionComponent, AccordionItemComponent],
  template: `
    <ui-accordion [multiple]="multiple()">
      <ui-accordion-item title="Uno">Contenido Uno</ui-accordion-item>
      <ui-accordion-item title="Dos">Contenido Dos</ui-accordion-item>
    </ui-accordion>
  `,
})
class AccordionHost {
  readonly multiple = signal(false);
}

describe('AccordionComponent', () => {
  let fixture: ComponentFixture<AccordionHost>;
  let host: AccordionHost;
  let buttons: HTMLButtonElement[];
  let itemEls: HTMLElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AccordionHost] }).compileComponents();
    fixture = TestBed.createComponent(AccordionHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    buttons = Array.from(
      fixture.nativeElement.querySelectorAll('ui-accordion-item button'),
    ) as HTMLButtonElement[];
    itemEls = Array.from(
      fixture.nativeElement.querySelectorAll('ui-accordion-item'),
    ) as HTMLElement[];
  });

  const isOpen = (i: number): boolean => itemEls[i].querySelector('[role="region"]') !== null;
  const expanded = (i: number): string => buttons[i].getAttribute('aria-expanded') as string;

  it('renders all item titles', () => {
    expect(buttons.map((b) => b.querySelector('span')?.textContent?.trim())).toEqual([
      'Uno',
      'Dos',
    ]);
  });

  it('opens a single item on click', () => {
    buttons[0].click();
    fixture.detectChanges();
    expect(isOpen(0)).toBe(true);
    expect(expanded(0)).toBe('true');
  });

  it('keeps a single item open in single mode', () => {
    buttons[0].click();
    fixture.detectChanges();
    buttons[1].click();
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(isOpen(1)).toBe(true);
    expect(isOpen(0)).toBe(false);
    expect(expanded(0)).toBe('false');
  });

  it('allows multiple items in multiple mode', () => {
    host.multiple.set(true);
    fixture.detectChanges();
    buttons[0].click();
    fixture.detectChanges();
    buttons[1].click();
    fixture.detectChanges();
    expect(isOpen(0)).toBe(true);
    expect(isOpen(1)).toBe(true);
  });

  it('renders item content when open', () => {
    buttons[1].click();
    fixture.detectChanges();
    expect(itemEls[1].textContent).toContain('Contenido Dos');
  });
});
