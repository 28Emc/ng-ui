import type { Meta, StoryObj } from '@storybook/angular-vite';
import { userEvent, within, expect } from 'storybook/test';
import { RatingComponent } from './rating.component';

const meta: Meta<RatingComponent> = {
  title: 'Inputs/Rating',
  parameters: {
    a11y: { test: 'error' },
  },
  component: RatingComponent,
  args: {
    value: 3,
    max: 5,
    size: 'md',
    label: 'Calificación',
    disabled: false,
    readonly: false,
  },
  argTypes: {
    value: {
      description: 'Valor actual (0 – `max`).',
      control: { type: 'range', min: 0, max: 5, step: 1 },
    },
    max: {
      description: 'Número máximo de estrellas.',
      control: { type: 'number' },
    },
    size: {
      description: 'Tamaño de las estrellas.',
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' },
    },
    label: {
      description: 'Etiqueta accesible (`aria-label`).',
      control: { type: 'text' },
    },
    readonly: {
      description: 'Bloquea la interacción manteniendo el valor visible.',
      control: { type: 'boolean' },
    },
    disabled: {
      description: 'Deshabilita el componente.',
      control: { type: 'boolean' },
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-rating [value]="value" [max]="max" [size]="size" [label]="label" [disabled]="disabled" [readonly]="readonly" />`,
  }),
};

export default meta;
type Story = StoryObj<RatingComponent>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup');
    const fifth = within(group).getByRole('radio', { name: 'Calificar 5 de 5' });
    await userEvent.click(fifth);
    await expect(fifth).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('radio', { name: 'Calificar 4 de 5' })).toHaveFocus();
  },
};

export const Empty: Story = {
  args: { value: 0 },
};

export const MaxValue: Story = {
  args: { value: 5 },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const Readonly: Story = {
  args: { readonly: true },
};

export const Disabled: Story = {
  args: { disabled: true, value: 4 },
};
