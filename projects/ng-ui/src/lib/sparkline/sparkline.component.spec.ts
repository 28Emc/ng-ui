import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  SparklineComponent,
  computeSparklinePoints,
  buildSparklinePath,
  buildSmoothSparklinePath,
} from './sparkline.component';

describe('SparklineComponent', () => {
  let fixture: ComponentFixture<SparklineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SparklineComponent] }).compileComponents();
    fixture = TestBed.createComponent(SparklineComponent);
    fixture.detectChanges();
  });

  function set(name: string, value: unknown): void {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  function svg(): SVGSVGElement {
    return fixture.nativeElement.querySelector('svg') as SVGSVGElement;
  }

  function paths(): SVGPathElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('path')) as SVGPathElement[];
  }

  function circles(): SVGCircleElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('circle')) as SVGCircleElement[];
  }

  it('renders an accessible svg sized by width and height', () => {
    set('data', [1, 2, 3]);
    set('width', 100);
    set('height', 40);

    expect(svg().getAttribute('role')).toBe('img');
    expect(svg().getAttribute('aria-label')).toBe('Gráfico de tendencia');
    expect(svg().getAttribute('width')).toBe('100');
    expect(svg().getAttribute('height')).toBe('40');
    expect(svg().getAttribute('viewBox')).toBe('0 0 100 40');
  });

  it('uses the label input as aria-label', () => {
    set('data', [1, 2]);
    set('label', 'Ventas del trimestre');
    expect(svg().getAttribute('aria-label')).toBe('Ventas del trimestre');
  });

  it('normalizes the series to the height with min at the bottom', () => {
    set('data', [0, 100]);
    set('width', 100);
    set('height', 40);

    const line = paths()[0];
    expect(line.getAttribute('d')).toBe('M 0 40 L 100 0');
    expect(line.getAttribute('fill')).toBe('none');
    expect(line.getAttribute('stroke-width')).toBe('2');
  });

  it('renders a flat series at mid height', () => {
    set('data', [5, 5, 5]);
    set('width', 100);
    set('height', 40);

    expect(paths()[0].getAttribute('d')).toBe('M 0 20 L 50 20 L 100 20');
  });

  it('renders a terminal dot at the last point', () => {
    set('data', [0, 100]);
    set('width', 100);
    set('height', 40);

    const dot = circles()[0];
    expect(dot.getAttribute('cx')).toBe('100');
    expect(dot.getAttribute('cy')).toBe('0');
    expect(dot.getAttribute('fill')).toBe('var(--surface)');
  });

  it('renders a single point as a circle without a line', () => {
    set('data', [42]);
    set('width', 80);
    set('height', 40);

    expect(paths()).toHaveLength(0);
    expect(circles()).toHaveLength(1);
    expect(circles()[0].getAttribute('cx')).toBe('0');
    expect(circles()[0].getAttribute('cy')).toBe('20');
  });

  it('renders nothing when there is no data', () => {
    set('data', []);
    expect(paths()).toHaveLength(0);
    expect(circles()).toHaveLength(0);
  });

  it('adds a gradient area path when fill is enabled', () => {
    set('data', [0, 100]);
    set('fill', true);
    set('width', 100);
    set('height', 40);

    const area = paths()[0];
    const line = paths()[1];
    expect(area.getAttribute('fill')).toContain('url(#ui-sparkline-');
    expect(area.getAttribute('d')).toBe('M 0 40 L 100 0 L 100 40 L 0 40 Z');
    expect(line.getAttribute('d')).toBe('M 0 40 L 100 0');
  });

  it('builds a smooth path when smooth is enabled', () => {
    set('data', [0, 50, 100, 30]);
    set('smooth', true);
    set('width', 90);
    set('height', 40);

    expect(paths()[0].getAttribute('d')).toContain(' C ');
  });

  it('respects min/max overrides for normalization', () => {
    set('data', [10, 20]);
    set('width', 100);
    set('height', 100);
    set('min', 0);
    set('max', 100);

    expect(paths()[0].getAttribute('d')).toBe('M 0 90 L 100 80');
  });

  it('applies the custom color to the svg', () => {
    set('data', [1, 2]);
    set('color', 'var(--color-accent-coral)');
    expect(svg().getAttribute('style')).toContain('var(--color-accent-coral)');
  });

  it('filters out non-finite values', () => {
    set('data', [0, Number.NaN, 100]);
    set('width', 100);
    set('height', 40);
    expect(paths()[0].getAttribute('d')).toBe('M 0 40 L 100 0');
  });
});

describe('computeSparklinePoints', () => {
  it('returns an empty array for empty or all-non-finite input', () => {
    expect(computeSparklinePoints([], 100, 40)).toEqual([]);
    expect(computeSparklinePoints([Number.NaN, Infinity], 100, 40)).toEqual([]);
  });

  it('places the minimum at the bottom and the maximum at the top', () => {
    expect(computeSparklinePoints([0, 100], 100, 40)).toEqual([
      { x: 0, y: 40 },
      { x: 100, y: 0 },
    ]);
  });

  it('keeps a flat series at mid height', () => {
    const points = computeSparklinePoints([7, 7, 7], 100, 40);
    expect(points.every((p) => p.y === 20)).toBe(true);
    expect(points.map((p) => p.x)).toEqual([0, 50, 100]);
  });

  it('returns a single centered point for one value', () => {
    expect(computeSparklinePoints([50], 100, 40)).toEqual([{ x: 0, y: 20 }]);
  });

  it('honours min/max overrides', () => {
    expect(computeSparklinePoints([10, 20], 100, 100, 0, 100)).toEqual([
      { x: 0, y: 90 },
      { x: 100, y: 80 },
    ]);
  });
});

describe('buildSparklinePath', () => {
  it('returns empty for fewer than two points', () => {
    expect(buildSparklinePath([])).toBe('');
    expect(buildSparklinePath([{ x: 0, y: 0 }])).toBe('');
  });

  it('builds a polyline path', () => {
    expect(
      buildSparklinePath([
        { x: 0, y: 10 },
        { x: 50, y: 20 },
        { x: 100, y: 5 },
      ]),
    ).toBe('M 0 10 L 50 20 L 100 5');
  });
});

describe('buildSmoothSparklinePath', () => {
  it('falls back to a straight path with fewer than three points', () => {
    expect(
      buildSmoothSparklinePath([
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ]),
    ).toBe('M 0 0 L 100 100');
  });

  it('uses cubic beziers with three or more points', () => {
    const d = buildSmoothSparklinePath([
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 0 },
    ]);
    expect(d.startsWith('M 0 0')).toBe(true);
    expect(d).toContain(' C ');
  });
});
