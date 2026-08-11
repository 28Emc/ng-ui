import type { Meta, StoryObj } from '@storybook/angular-vite';
import { userEvent, within, expect } from '@storybook/test';
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
  title: 'Input/Combobox',
  component: ComboboxComponent,
  args: {
    options: FRAMEWORKS,
    placeholder: 'Buscar framework…',
    value: null,
    disabled: false,
    name: 'framework',
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
    await userEvent.click(
      within(canvasElement).getByRole('combobox', { name: /Buscar framework/ }),
    );
    await expect(await within(document.body).findByText('Vue')).toBeVisible();
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
