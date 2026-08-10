import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { CardHeaderComponent } from './card-header.component';
import { CardBodyComponent } from './card-body.component';

@Component({
  selector: 'card-host',
  standalone: true,
  imports: [CardComponent, CardHeaderComponent, CardBodyComponent],
  template: `
    <ui-card [hover]="hover()">
      <ui-card-header title="Título" subtitle="Subtítulo">Acción</ui-card-header>
      <ui-card-body>Contenido</ui-card-body>
    </ui-card>
  `,
})
class CardHost {
  readonly hover = signal(false);
}

describe('CardComponent', () => {
  let fixture: ComponentFixture<CardHost>;
  let host: CardHost;
  let card: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CardHost] }).compileComponents();
    fixture = TestBed.createComponent(CardHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    card = fixture.nativeElement.querySelector('ui-card > div') as HTMLElement;
  });

  it('renders the card with base surface classes', () => {
    expect(card.classList.contains('rounded-2xl')).toBe(true);
    expect(card.classList.contains('border-default')).toBe(true);
    expect(card.classList.contains('bg-surface')).toBe(true);
    expect(card.classList.contains('shadow-soft')).toBe(true);
  });

  it('does not add hover classes by default', () => {
    expect(card.classList.contains('hover:shadow-card')).toBe(false);
  });

  it('adds hover elevation and translate when hover is enabled', () => {
    host.hover.set(true);
    fixture.detectChanges();
    expect(card.classList.contains('hover:-translate-y-0.5')).toBe(true);
    expect(card.classList.contains('hover:shadow-card')).toBe(true);
  });

  it('projects header and body content', () => {
    expect(card.textContent).toContain('Título');
    expect(card.textContent).toContain('Subtítulo');
    expect(card.textContent).toContain('Contenido');
  });
});

describe('CardHeaderComponent', () => {
  let fixture: ComponentFixture<CardHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CardHost] }).compileComponents();
    fixture = TestBed.createComponent(CardHost);
    fixture.detectChanges();
  });

  const header = () => fixture.nativeElement.querySelector('ui-card-header header') as HTMLElement;

  it('renders title and subtitle', () => {
    expect(header().querySelector('h3')?.textContent).toBe('Título');
    expect(header().querySelector('p')?.textContent).toBe('Subtítulo');
  });

  it('projects the trailing action content', () => {
    expect(header().textContent).toContain('Acción');
  });
});

describe('CardBodyComponent', () => {
  let fixture: ComponentFixture<CardHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CardHost] }).compileComponents();
    fixture = TestBed.createComponent(CardHost);
    fixture.detectChanges();
  });

  it('projects body content', () => {
    const body = fixture.nativeElement.querySelector('ui-card-body div') as HTMLElement;
    expect(body.textContent).toContain('Contenido');
  });
});
