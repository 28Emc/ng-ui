import type { Meta, StoryObj } from '@storybook/angular-vite';
import { ExpandableCardComponent } from './expandable-card.component';

const meta: Meta<ExpandableCardComponent> = {
  title: 'Data Display/ExpandableCard',
  parameters: {
    a11y: { test: 'error' },
  },
  component: ExpandableCardComponent,
  args: {
    title: 'Detalles del proyecto',
    subtitle: 'Haz clic para ver más información',
    open: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-96">
        <ui-expandable-card [title]="title" [subtitle]="subtitle" [open]="open">
          <p class="text-sm text-muted">
            Contenido adicional que se muestra al expandir la tarjeta. Puede incluir
            tablas, formularios o cualquier otro contenido proyectado.
          </p>
        </ui-expandable-card>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<ExpandableCardComponent>;

export const Default: Story = {};

export const Expanded: Story = {
  args: { open: true },
};

export const WithoutSubtitle: Story = {
  args: { subtitle: '' },
};

export const LongContent: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="w-96 space-y-4">
        <ui-expandable-card title="Resumen del plan" subtitle="Términos y condiciones" [open]="open">
          <ul class="space-y-2 text-sm text-muted">
            <li>● Acceso ilimitado a formularios.</li>
            <li>● Integraciones con APIs externas.</li>
            <li>● Soporte prioritario 24/7.</li>
            <li>● Auditoría y roles avanzados.</li>
          </ul>
        </ui-expandable-card>
      </div>
    `,
  }),
};
