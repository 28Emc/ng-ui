import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { CardComponent } from './card.component';
import { CardHeaderComponent } from './card-header.component';
import { CardBodyComponent } from './card-body.component';
import { BadgeComponent } from '../feedback/badge.component';

const meta: Meta<CardComponent> = {
  title: 'Data Display/Card',
  component: CardComponent,
  decorators: [
    moduleMetadata({
      imports: [CardHeaderComponent, CardBodyComponent, BadgeComponent],
    }),
  ],
  args: { hover: false },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-96">
        <ui-card [hover]="hover">
          <ui-card-header title="Título de la tarjeta" subtitle="Una descripción corta del contenido.">
            <ui-badge variant="brand">Nuevo</ui-badge>
          </ui-card-header>
          <ui-card-body>
            <p class="text-sm text-muted">
              Este es el contenido principal de la tarjeta. Puede incluir formularios,
              gráficas o cualquier otro contenido proyectado.
            </p>
          </ui-card-body>
        </ui-card>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<CardComponent>;

export const Default: Story = {};

export const Interactive: Story = {
  args: { hover: true },
};

export const Responsive: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-wrap items-start gap-6">
        <div class="w-64">
          <ui-card [hover]="hover">
            <ui-card-header title="Narrow" subtitle="El header se apila.">
              <ui-badge variant="success">Compact</ui-badge>
            </ui-card-header>
            <ui-card-body>
              <p class="text-sm text-muted">
                Bajo 24rem el título y la acción quedan en columna con menos padding.
              </p>
            </ui-card-body>
          </ui-card>
        </div>
        <div class="w-[32rem]">
          <ui-card [hover]="hover">
            <ui-card-header title="Wide" subtitle="El header vuelve a una fila.">
              <ui-badge variant="brand">Comfortable</ui-badge>
            </ui-card-header>
            <ui-card-body>
              <p class="text-sm text-muted">
                Sobre 24rem el título y la acción se alinean en una fila con el padding completo.
              </p>
            </ui-card-body>
          </ui-card>
        </div>
      </div>
    `,
  }),
};
