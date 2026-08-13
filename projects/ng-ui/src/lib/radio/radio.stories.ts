import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RadioComponent } from './radio.component';
import { RadioGroupComponent } from './radio-group.component';

const meta: Meta<RadioComponent> = {
  title: 'Inputs/Radio',
  parameters: {
    a11y: { test: 'error' },
  },
  component: RadioComponent,
  decorators: [
    moduleMetadata({
      imports: [RadioGroupComponent],
    }),
  ],
  render: () => ({
    template: `
      <div class="w-80">
        <ui-radio-group label="Plan de suscripción">
          <ui-radio value="free" label="Gratuito" description="0 €/mes — para proyectos personales." />
          <ui-radio value="pro" label="Profesional" description="12 €/mes — para equipos en crecimiento." />
          <ui-radio value="enterprise" label="Empresa" description="Contacta con ventas para un plan a medida." />
          <ui-radio value="legacy" label="Plan heredado (deshabilitado)" description="Ya no acepta nuevos clientes." [disabled]="true" />
        </ui-radio-group>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<RadioComponent>;

export const WithGroup: Story = {};

export const Compact: Story = {
  render: () => ({
    template: `
      <div class="w-80">
        <ui-radio-group label="Metodo de pago">
          <ui-radio value="card" label="Tarjeta" />
          <ui-radio value="transfer" label="Transferencia" />
          <ui-radio value="paypal" label="PayPal" />
        </ui-radio-group>
      </div>
    `,
  }),
};
