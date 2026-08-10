import type { Meta, StoryObj } from '@storybook/angular-vite';
import { MultiSelectComponent } from './multiselect.component';

const FRAMEWORKS = [
  { label: 'Angular', value: 'angular' },
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'SolidJS', value: 'solid' },
  { label: 'Astro', value: 'astro' },
  { label: 'Next.js', value: 'next' },
  { label: 'Nuxt', value: 'nuxt' },
  { label: 'Ember', value: 'ember' },
  { label: 'Backbone', value: 'backbone' },
];

const meta: Meta<MultiSelectComponent> = {
  title: 'Input/MultiSelect',
  component: MultiSelectComponent,
  args: {
    options: FRAMEWORKS,
    placeholder: 'Elige frameworks…',
    value: [],
    disabled: false,
    maxVisibleOptions: 6,
    maxChips: 3,
    name: 'skills',
  },
  render: (args) => ({
    props: args,
    template: `<ui-multiselect [options]="options" [placeholder]="placeholder" [value]="value" [disabled]="disabled" [maxVisibleOptions]="maxVisibleOptions" [maxChips]="maxChips" [name]="name" />`,
  }),
};

export default meta;
type Story = StoryObj<MultiSelectComponent>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: ['angular', 'react', 'vue'] },
};

export const StringOptions: Story = {
  args: {
    options: ['Rojo', 'Verde', 'Azul', 'Amarillo', 'Violeta', 'Naranja'],
    value: ['Rojo', 'Azul'],
  },
};

export const WithDisabledOption: Story = {
  args: {
    options: [
      { label: 'Angular', value: 'angular' },
      { label: 'React', value: 'react' },
      { label: 'Vue', value: 'vue' },
      { label: 'Legacy', value: 'legacy', disabled: true },
    ],
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: ['angular'] },
};
