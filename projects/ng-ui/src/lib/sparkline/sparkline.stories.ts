import type { Meta, StoryObj } from '@storybook/angular-vite';
import { SparklineComponent } from './sparkline.component';

const meta: Meta<SparklineComponent> = {
  title: 'Data Display/Sparkline',
  component: SparklineComponent,
  args: {
    data: [12, 18, 15, 22, 28, 25, 34, 31, 42],
    width: 120,
    height: 40,
    strokeWidth: 2,
    fill: false,
    smooth: false,
    color: 'var(--color-brand-500)',
    min: null,
    max: null,
    label: 'Visitas mensuales',
  },
  render: (args) => ({
    props: args,
    template: `<ui-sparkline [data]="data" [width]="width" [height]="height" [strokeWidth]="strokeWidth" [fill]="fill" [smooth]="smooth" [color]="color" [min]="min" [max]="max" [label]="label" />`,
  }),
};

export default meta;
type Story = StoryObj<SparklineComponent>;

export const Default: Story = {};

export const Fill: Story = {
  args: { fill: true },
};

export const Smooth: Story = {
  args: { smooth: true, fill: true },
};

export const DownTrend: Story = {
  args: {
    data: [42, 38, 40, 30, 22, 18, 15, 10, 8],
    smooth: true,
    fill: true,
    color: 'var(--color-accent-coral)',
  },
};

export const Volatile: Story = {
  args: { data: [30, 12, 45, 8, 38, 20, 50, 15, 33] },
};

export const Flat: Story = {
  args: { data: [25, 25, 25, 25, 25, 25, 25, 25, 25] },
};

export const ManyPoints: Story = {
  args: {
    data: Array.from({ length: 40 }, (_, i) => 20 + Math.round(Math.sin(i / 3) * 12 + i / 2)),
    width: 240,
    height: 60,
    smooth: true,
    fill: true,
  },
};

export const SinglePoint: Story = {
  args: { data: [42], width: 80, height: 40 },
};

export const SharedScale: Story = {
  args: {
    data: [55, 70, 62, 80, 75],
    width: 200,
    height: 40,
    smooth: true,
    min: 0,
    max: 100,
    color: 'var(--color-accent-blue)',
  },
};
