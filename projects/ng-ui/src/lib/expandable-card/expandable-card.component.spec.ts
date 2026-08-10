import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ExpandableCardComponent } from './expandable-card.component';

@Component({
  selector: 'expandable-card-host',
  standalone: true,
  imports: [ExpandableCardComponent],
  template: `
    <ui-expandable-card
      [title]="title()"
      [subtitle]="subtitle()"
      [open]="open()"
      (openChange)="onOpenChange($event)"
    >
      Contenido expandido
    </ui-expandable-card>
  `,
})
class ExpandableCardHost {
  readonly title = signal('Detalles del proyecto');
  readonly subtitle = signal('Información adicional');
  readonly open = signal(false);
  onOpenChange(value: boolean): void {
    this.open.set(value);
  }
}

describe('ExpandableCardComponent', () => {
  let fixture: ComponentFixture<ExpandableCardHost>;
  let host: ExpandableCardHost;
  let el: HTMLElement;
  let button: HTMLButtonElement;

  const region = () => el.querySelector('[role="region"]') as HTMLElement | null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ExpandableCardHost] }).compileComponents();
    fixture = TestBed.createComponent(ExpandableCardHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.nativeElement.querySelector('ui-expandable-card') as HTMLElement;
    button = el.querySelector('button') as HTMLButtonElement;
  });

  it('renders title and subtitle', () => {
    expect(el.textContent).toContain('Detalles del proyecto');
    expect(el.textContent).toContain('Información adicional');
  });

  it('starts collapsed with aria-expanded false', () => {
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(region()).toBeNull();
  });

  it('uses a native button trigger for keyboard access', () => {
    expect(button.tagName).toBe('BUTTON');
    expect(button.type).toBe('button');
  });

  it('opens on click and emits openChange', () => {
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(region()).toBeTruthy();
    expect(region()?.textContent).toContain('Contenido expandido');
    expect(host.open()).toBe(true);
  });

  it('closes on a second click', () => {
    button.click();
    fixture.detectChanges();
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(region()).toBeNull();
    expect(host.open()).toBe(false);
  });

  it('renders expanded when open is set', () => {
    host.open.set(true);
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(region()).toBeTruthy();
  });

  it('wires aria-controls and aria-labelledby', () => {
    host.open.set(true);
    fixture.detectChanges();
    expect(button.getAttribute('aria-controls')).toBe(region()?.id);
    expect(region()?.getAttribute('aria-labelledby')).toBe(button.id);
  });

  it('rotates the chevron when open', () => {
    const chevron = el.querySelector('svg') as SVGSVGElement;
    expect(chevron.classList.contains('rotate-180')).toBe(false);
    button.click();
    fixture.detectChanges();
    expect(chevron.classList.contains('rotate-180')).toBe(true);
  });
});
