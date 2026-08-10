import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TabsComponent } from './tabs.component';
import { TabComponent } from './tab.component';

@Component({
  selector: 'tabs-host',
  standalone: true,
  imports: [TabsComponent, TabComponent],
  template: `
    <ui-tabs [(activeIndex)]="active">
      <ui-tab label="Uno">Contenido Uno</ui-tab>
      <ui-tab label="Dos">Contenido Dos</ui-tab>
      <ui-tab label="Tres" [disabled]="true">Contenido Tres</ui-tab>
    </ui-tabs>
  `,
})
class TabsHost {
  readonly active = signal(0);
}

describe('TabsComponent', () => {
  let fixture: ComponentFixture<TabsHost>;
  let host: TabsHost;
  let tabs: HTMLButtonElement[];
  let panels: HTMLElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TabsHost] }).compileComponents();
    fixture = TestBed.createComponent(TabsHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    tabs = Array.from(
      fixture.nativeElement.querySelectorAll('[role="tab"]'),
    ) as HTMLButtonElement[];
    panels = Array.from(
      fixture.nativeElement.querySelectorAll('[role="tabpanel"]'),
    ) as HTMLElement[];
  });

  it('renders all tab labels', () => {
    expect(tabs.map((t) => t.textContent?.trim())).toEqual(['Uno', 'Dos', 'Tres']);
  });

  it('activates the first tab by default', () => {
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(panels[0].hidden).toBe(false);
    expect(panels[1].hidden).toBe(true);
  });

  it('switches the active tab on click', () => {
    tabs[1].click();
    fixture.detectChanges();
    expect(host.active()).toBe(1);
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(panels[1].hidden).toBe(false);
    expect(panels[0].hidden).toBe(true);
  });

  it('does not activate a disabled tab', () => {
    tabs[2].click();
    fixture.detectChanges();
    expect(host.active()).toBe(0);
    expect(tabs[2].getAttribute('aria-selected')).toBe('false');
  });

  it('reflects a programmatic activeIndex', () => {
    host.active.set(1);
    fixture.detectChanges();
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
  });

  it('renders the content of the active tab', () => {
    expect(panels[0].textContent?.trim()).toContain('Contenido Uno');
  });
});
