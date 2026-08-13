import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RadioGroupComponent } from './radio-group.component';
import { RadioComponent } from './radio.component';

const meta: Meta<RadioGroupComponent> = {
  title: 'Inputs/RadioGroup',
  component: RadioGroupComponent,
  decorators: [
    moduleMetadata({
      imports: [RadioComponent],
    }),
  ],
  args: {
    label: 'Plan de facturación',
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-96">
        <ui-radio-group [label]="label" [disabled]="disabled">
          <ui-radio value="monthly" label="Mensual" description="Factura cada mes, cancela cuando quieras." />
          <ui-radio value="quarterly" label="Trimestral" description="Ahorra 10% con facturación trimestral." />
          <ui-radio value="yearly" label="Anual" description="Ahorra 20% con facturación anual." />
        </ui-radio-group>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<RadioGroupComponent>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};
