import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { TooltipDirective, TooltipPlacement } from './tooltip.directive';

@Component({
  selector: 'tooltip-host',
  standalone: true,
  imports: [TooltipDirective],
  template: ` <button [uiTooltip]="tip()" [placement]="placement()">Hover</button> `,
})
class TooltipHost {
  readonly tip = signal('Ayuda contextual');
  readonly placement = signal<TooltipPlacement>('top');
}

describe('TooltipDirective', () => {
  let fixture: ComponentFixture<TooltipHost>;
  let container: HTMLElement;
  let appRef: ApplicationRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipDirective, TooltipHost],
    }).compileComponents();
    fixture = TestBed.createComponent(TooltipHost);
    fixture.detectChanges();
    container = TestBed.inject(OverlayContainer).getContainerElement();
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    TestBed.inject(OverlayContainer).ngOnDestroy();
    vi.useRealTimers();
  });

  const hover = (type: 'enter' | 'leave'): void => {
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    btn.dispatchEvent(new MouseEvent(type === 'enter' ? 'mouseenter' : 'mouseleave'));
  };

  it('does not show the tooltip before the delay', () => {
    vi.useFakeTimers();
    hover('enter');
    expect(container.textContent).not.toContain('Ayuda contextual');
  });

  it('shows the tooltip after the open delay', () => {
    vi.useFakeTimers();
    hover('enter');
    vi.advanceTimersByTime(250);
    appRef.tick();
    expect(container.textContent).toContain('Ayuda contextual');
  });

  it('hides the tooltip on mouseleave', () => {
    vi.useFakeTimers();
    hover('enter');
    vi.advanceTimersByTime(250);
    appRef.tick();
    expect(container.textContent).toContain('Ayuda contextual');

    hover('leave');
    vi.advanceTimersByTime(150);
    appRef.tick();
    expect(container.textContent).not.toContain('Ayuda contextual');
  });

  it('does not show when the content is empty', () => {
    vi.useFakeTimers();
    fixture.componentInstance.tip.set('');
    fixture.detectChanges();
    hover('enter');
    vi.advanceTimersByTime(250);
    appRef.tick();
    expect(container.textContent).not.toContain('Ayuda contextual');
  });
});
