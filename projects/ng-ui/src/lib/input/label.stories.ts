import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { LabelComponent } from './label.component';
import { InputComponent } from './input.component';

const meta: Meta<LabelComponent> = {
  title: 'Input/Label',
  component: LabelComponent,
  decorators: [
    moduleMetadata({
      imports: [InputComponent],
    }),
  ],
  args: {
    htmlFor: 'email',
    required: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-80 space-y-1.5">
        <ui-label [htmlFor]="htmlFor" [required]="required">Correo electrónico</ui-label>
        <ui-input id="email" type="email" placeholder="tu@empresa.com" />
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<LabelComponent>;

export const Default: Story = {};

export const Required: Story = {
  args: { required: true },
};
