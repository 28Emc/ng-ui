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
