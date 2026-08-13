import type { Meta, StoryObj } from '@storybook/angular-vite';
import { ProgressComponent } from './progress.component';

const meta: Meta<ProgressComponent> = {
  title: 'Data Display/Progress',
  parameters: {
    a11y: { test: 'error' },
  },
  component: ProgressComponent,
  args: {
    value: 65,
    max: 100,
    size: 'md',
    indeterminate: false,
    label: 'Progreso de la tarea',
  },
  argTypes: {
    value: {
      description: 'Valor actual de progreso.',
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    max: {
      description: 'Valor máximo del progreso.',
      control: { type: 'number' },
    },
    size: {
      description: 'Grosor de la barra.',
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' },
    },
    indeterminate: {
      description: 'Barra animada sin valor definido (carga).',
      control: { type: 'boolean' },
    },
    label: {
      description: 'Etiqueta accesible (`aria-label`).',
      control: { type: 'text' },
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-progress [value]="value" [max]="max" [size]="size" [indeterminate]="indeterminate" [label]="label" />`,
  }),
};

export default meta;
type Story = StoryObj<ProgressComponent>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const Halfway: Story = {
  args: { value: 50 },
};

export const Complete: Story = {
  args: { value: 100 },
};

export const Indeterminate: Story = {
  args: { indeterminate: true, label: 'Cargando…' },
};

export const CustomMax: Story = {
  args: { value: 3, max: 5, label: 'Paso 3 de 5' },
};
