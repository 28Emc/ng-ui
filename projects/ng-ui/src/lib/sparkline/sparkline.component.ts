import { Component, computed, input } from '@angular/core';
import { booleanAttribute } from '@angular/core';

export interface SparklinePoint {
  x: number;
  y: number;
}

export function computeSparklinePoints(
  data: readonly number[],
  width: number,
  height: number,
  min?: number,
  max?: number,
): SparklinePoint[] {
  const values = data.filter((value) => Number.isFinite(value));
  if (!values.length || width <= 0 || height <= 0) return [];
  const lo = min !== undefined && Number.isFinite(min) ? min : Math.min(...values);
  const hi = max !== undefined && Number.isFinite(max) ? max : Math.max(...values);
  const span = hi - lo;
  const step = values.length > 1 ? width / (values.length - 1) : 0;
  return values.map((value, i) => ({
    x: i * step,
    y: span > 0 ? height - ((value - lo) / span) * height : height / 2,
  }));
}

export function buildSparklinePath(points: readonly SparklinePoint[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}

export function buildSmoothSparklinePath(points: readonly SparklinePoint[]): string {
  if (points.length < 3) return buildSparklinePath(points);
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

const toPositiveNumber =
  (fallback: number) =>
  (value: unknown): number => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

let sparklineUid = 0;

@Component({
  selector: 'ui-sparkline',
  standalone: true,
  template: `
    <svg
      [attr.width]="width()"
      [attr.height]="height()"
      [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
      role="img"
      [attr.aria-label]="label() || 'Gráfico de tendencia'"
      [style.color]="color()"
      class="block overflow-visible"
    >
      <defs>
        <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" [attr.stop-color]="color()" stop-opacity="0.35" />
          <stop offset="100%" [attr.stop-color]="color()" stop-opacity="0" />
        </linearGradient>
      </defs>
      @if (points().length >= 2) {
        @if (fill()) {
          <path [attr.d]="areaPath()" [attr.fill]="'url(#' + gradientId + ')'" />
        }
        <path
          [attr.d]="linePath()"
          fill="none"
          stroke="currentColor"
          [attr.stroke-width]="strokeWidth()"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          [attr.cx]="points()[points().length - 1].x"
          [attr.cy]="points()[points().length - 1].y"
          [attr.r]="terminalDotRadius()"
          fill="var(--surface)"
          stroke="currentColor"
          [attr.stroke-width]="strokeWidth()"
        />
      } @else if (points().length === 1) {
        <circle
          [attr.cx]="points()[0].x"
          [attr.cy]="points()[0].y"
          [attr.r]="terminalDotRadius()"
          fill="currentColor"
        />
      }
    </svg>
  `,
})
export class SparklineComponent {
  readonly data = input<number[]>([]);
  readonly width = input(120, { transform: toPositiveNumber(120) });
  readonly height = input(40, { transform: toPositiveNumber(40) });
  readonly strokeWidth = input(2, { transform: toPositiveNumber(2) });
  readonly fill = input(false, { transform: booleanAttribute });
  readonly smooth = input(false, { transform: booleanAttribute });
  readonly color = input('var(--color-brand-500)');
  readonly min = input<number | null>(null);
  readonly max = input<number | null>(null);
  readonly label = input('');

  readonly gradientId = `ui-sparkline-${++sparklineUid}`;

  protected readonly points = computed(() =>
    computeSparklinePoints(
      this.data(),
      this.width(),
      this.height(),
      this.min() ?? undefined,
      this.max() ?? undefined,
    ),
  );

  protected readonly linePath = computed(() =>
    this.smooth() ? buildSmoothSparklinePath(this.points()) : buildSparklinePath(this.points()),
  );

  protected readonly areaPath = computed(() => {
    const pts = this.points();
    if (pts.length < 2) return '';
    const last = pts[pts.length - 1];
    const first = pts[0];
    const line = this.smooth() ? buildSmoothSparklinePath(pts) : buildSparklinePath(pts);
    return `${line} L ${last.x} ${this.height()} L ${first.x} ${this.height()} Z`;
  });

  protected readonly terminalDotRadius = computed(() => Math.max(1.5, this.strokeWidth() * 1.25));
}
