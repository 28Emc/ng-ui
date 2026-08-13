import type { Meta, StoryObj } from '@storybook/angular-vite';
import { userEvent, within, expect, waitFor } from 'storybook/test';
import { ComboboxComponent } from './combobox.component';

const FRAMEWORKS = [
  { label: 'Angular', value: 'angular' },
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'SolidJS', value: 'solid' },
  { label: 'Astro', value: 'astro' },
  { label: 'Next.js', value: 'next' },
  { label: 'Nuxt', value: 'nuxt' },
];

const meta: Meta<ComboboxComponent> = {
  title: 'Pickers/Combobox',
  component: ComboboxComponent,
  args: {
    options: FRAMEWORKS,
    placeholder: 'Buscar framework…',
    value: null,
    disabled: false,
    name: 'framework',
  },
  argTypes: {
    options: {
      description: 'Lista de opciones `{ label, value }`.',
      control: { type: 'object' },
    },
    placeholder: {
      description: 'Texto de marcador de posición.',
      control: { type: 'text' },
    },
    value: {
      description: 'Valor seleccionado.',
      control: { type: 'text' },
    },
    invalid: {
      description: 'Aplica estilos de estado inválido.',
      control: { type: 'boolean' },
    },
    disabled: {
      description: 'Deshabilita el combobox.',
      control: { type: 'boolean' },
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-combobox [options]="options" [placeholder]="placeholder" [value]="value" [disabled]="disabled" [name]="name" />`,
  }),
};

export default meta;
type Story = StoryObj<ComboboxComponent>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    await waitFor(async () => {
      await expect(await within(document.body).findByText('Vue')).toBeVisible();
    });
  },
};

export const WithValue: Story = {
  args: { value: 'angular' },
};

export const StringOptions: Story = {
  args: {
    options: ['Rojo', 'Verde', 'Azul', 'Amarillo', 'Violeta', 'Naranja'],
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
