import type { Meta, StoryObj } from '@storybook/angular-vite';
import { TagInputComponent } from './taginput.component';

const meta: Meta<TagInputComponent> = {
  title: 'Input/TagInput',
  component: TagInputComponent,
  args: {
    placeholder: 'Escribe y presiona Enter…',
    value: ['angular', 'react', 'vue'],
    disabled: false,
    maxTags: null,
  },
  render: (args) => ({
    props: args,
    template: `<ui-taginput [placeholder]="placeholder" [value]="value" [disabled]="disabled" [maxTags]="maxTags" />`,
  }),
};

export default meta;
type Story = StoryObj<TagInputComponent>;

export const Default: Story = {};

export const Empty: Story = {
  args: { value: [] },
};

export const WithMaxTags: Story = {
  args: { maxTags: 4 },
};

export const Disabled: Story = {
  args: { disabled: true },
};
