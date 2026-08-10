import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TabComponent } from './tab.component';

@Component({
  selector: 'tab-host',
  standalone: true,
  imports: [TabComponent],
  template: ` <ui-tab [label]="label()" [disabled]="disabled()">Contenido de la pestaña</ui-tab> `,
})
class TabHost {
  readonly label = signal('General');
  readonly disabled = signal(false);
}

describe('TabComponent', () => {
  let fixture: ComponentFixture<TabHost>;
  let host: TabHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TabHost] }).compileComponents();
    fixture = TestBed.createComponent(TabHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exposes the label and disabled state', () => {
    const tab = fixture.debugElement.query(By.directive(TabComponent))
      .componentInstance as TabComponent;
    expect(tab.label()).toBe('General');
    expect(tab.disabled()).toBe(false);
    host.label.set('Avanzado');
    host.disabled.set(true);
    fixture.detectChanges();
    expect(tab.label()).toBe('Avanzado');
    expect(tab.disabled()).toBe(true);
  });

  it('exposes the projected content as a template', () => {
    const tab = fixture.debugElement.query(By.directive(TabComponent))
      .componentInstance as TabComponent;
    expect(tab.contentTpl()).toBeTruthy();
  });
});
