import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { userEvent, within, expect, waitFor } from 'storybook/test';
import { ModalComponent } from './modal.component';
import { UiModalFooterDirective } from './modal-footer.directive';
import { ButtonComponent } from '../button/button.component';

const meta: Meta<ModalComponent> = {
  title: 'Overlays/Modal',
  component: ModalComponent,
  decorators: [
    moduleMetadata({
      imports: [UiModalFooterDirective, ButtonComponent],
    }),
  ],
  args: {
    size: 'md',
    title: 'Nueva solicitud',
    subtitle: 'Completa la información para continuar.',
    open: true,
  },
  argTypes: {
    open: {
      description: 'Controla la visibilidad del modal.',
      control: { type: 'boolean' },
    },
    size: {
      description: 'Ancho máximo del modal.',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      control: { type: 'select' },
    },
    title: {
      description: 'Título mostrado en la cabecera.',
      control: { type: 'text' },
    },
    subtitle: {
      description: 'Subtítulo mostrado bajo el título.',
      control: { type: 'text' },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-modal [open]="open" [title]="title" [subtitle]="subtitle" [size]="size">
        <p class="text-sm text-muted">
          El contenido del modal se proyecta aquí. Puede contener formularios,
          tablas o cualquier otro componente de la librería.
        </p>
        <footer uiModalFooter>
          <ui-button variant="ghost">Cancelar</ui-button>
          <ui-button>Guardar</ui-button>
        </footer>
      </ui-modal>
    `,
  }),
};

export default meta;
type Story = StoryObj<ModalComponent>;

export const Default: Story = {
  play: async () => {
    await within(document.body).findByRole('dialog', { hidden: true });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(within(document.body).queryByRole('dialog', { hidden: true })).toBeNull();
    });
  },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const ExtraLarge: Story = {
  args: { size: 'xl' },
};
