import { Component, Type, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LucideInbox } from '@lucide/angular';
import { EmptyStateComponent } from './empty-state.component';
import { EmptyStateActionDirective } from './empty-state-action.directive';

@Component({
  selector: 'empty-state-host',
  standalone: true,
  imports: [EmptyStateComponent, EmptyStateActionDirective],
  template: `
    <ui-empty-state [icon]="icon()" [title]="title()" [description]="description()">
      @if (withAction()) {
        <button type="button" uiEmptyStateAction>Crear</button>
      }
    </ui-empty-state>
  `,
})
class EmptyStateHost {
  readonly icon = signal<Type<unknown> | null>(LucideInbox);
  readonly title = signal('Sin resultados');
  readonly description = signal('Ajusta los filtros');
  readonly withAction = signal(false);
}

describe('EmptyStateComponent', () => {
  let fixture: ComponentFixture<EmptyStateHost>;
  let host: EmptyStateHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EmptyStateHost] }).compileComponents();
    fixture = TestBed.createComponent(EmptyStateHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the title and description', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Sin resultados');
    expect(text).toContain('Ajusta los filtros');
  });

  it('renders the icon when provided', () => {
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
    host.icon.set(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
  });

  it('omits the description when empty', () => {
    host.description.set('');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Ajusta los filtros');
  });

  it('only renders the action slot when the directive is present', () => {
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    host.withAction.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')?.textContent?.trim()).toBe('Crear');
  });
});
