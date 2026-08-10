import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RatingComponent } from './rating.component';

@Component({
  selector: 'rating-host',
  standalone: true,
  imports: [RatingComponent, FormsModule],
  template: `
    <ui-rating
      [label]="label()"
      [max]="max()"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [ngModel]="value()"
      (ngModelChange)="value.set($event)"
    />
  `,
})
class RatingHost {
  readonly value = signal(0);
  readonly max = signal(5);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly label = signal('Calificación');
}

describe('RatingComponent', () => {
  let fixture: ComponentFixture<RatingHost>;
  let host: RatingHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RatingHost] }).compileComponents();
    fixture = TestBed.createComponent(RatingHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function stars(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
  }

  it('renders max radio buttons', () => {
    expect(stars().length).toBe(5);
  });

  it('has no filled star when value is 0', () => {
    const svgs = fixture.nativeElement.querySelectorAll('svg') as NodeListOf<SVGElement>;
    expect(svgs[0].getAttribute('fill')).toBe('none');
  });

  it('selects a rating on click and emits the value', () => {
    stars()[3].click();
    fixture.detectChanges();
    expect(host.value()).toBe(4);
    const svgs = fixture.nativeElement.querySelectorAll('svg') as NodeListOf<SVGElement>;
    expect(svgs[3].getAttribute('fill')).toBe('currentColor');
  });

  it('clears the rating when clicking the same star', () => {
    stars()[4].click();
    fixture.detectChanges();
    expect(host.value()).toBe(5);
    stars()[4].click();
    fixture.detectChanges();
    expect(host.value()).toBe(0);
  });

  it('reflects a programmatic value', () => {
    const comp = fixture.debugElement.query(By.directive(RatingComponent))
      .componentInstance as RatingComponent;
    comp.writeValue(3);
    fixture.detectChanges();
    const svgs = fixture.nativeElement.querySelectorAll('svg') as NodeListOf<SVGElement>;
    expect(svgs[2].getAttribute('fill')).toBe('currentColor');
    expect(svgs[3].getAttribute('fill')).toBe('none');
  });

  it('does not select when disabled', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    stars()[1].click();
    fixture.detectChanges();
    expect(host.value()).toBe(0);
  });

  it('does not select when readonly', () => {
    host.readonly.set(true);
    fixture.detectChanges();
    stars()[2].click();
    fixture.detectChanges();
    expect(host.value()).toBe(0);
  });
});
