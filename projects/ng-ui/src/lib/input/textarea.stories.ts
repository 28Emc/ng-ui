import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { TextareaComponent } from './textarea.component';
import { FieldComponent } from './field.component';

const meta: Meta<TextareaComponent> = {
  title: 'Input/Textarea',
  component: TextareaComponent,
  decorators: [
    moduleMetadata({
      imports: [FieldComponent],
    }),
  ],
  args: {
    rows: 4,
    placeholder: 'Describe el problema…',
    invalid: false,
    disabled: false,
    name: 'comments',
    autocomplete: 'off',
  },
  render: (args) => ({
    props: args,
    template: `<ui-textarea [rows]="rows" [placeholder]="placeholder" [invalid]="invalid" [disabled]="disabled" [name]="name" [autocomplete]="autocomplete" />`,
  }),
};

export default meta;
type Story = StoryObj<TextareaComponent>;

export const Default: Story = {};

export const Invalid: Story = {
  args: { invalid: true },
};

export const WithField: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="w-96">
        <ui-field label="Descripción" hint="Cuéntanos más sobre tu solicitud.">
          <ui-textarea [rows]="rows" [placeholder]="placeholder" [invalid]="invalid" [disabled]="disabled" />
        </ui-field>
      </div>
    `,
  }),
};
