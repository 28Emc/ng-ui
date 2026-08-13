import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { userEvent, within, expect, waitFor } from 'storybook/test';
import { AccordionComponent } from './accordion.component';
import { AccordionItemComponent } from './accordion-item.component';

const meta: Meta<AccordionComponent> = {
  title: 'Navigation/Accordion',
  component: AccordionComponent,
  decorators: [
    moduleMetadata({
      imports: [AccordionItemComponent],
    }),
  ],
  args: {
    multiple: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[32rem]">
        <ui-accordion [multiple]="multiple">
          <ui-accordion-item title="¿Cómo configuro mi cuenta?" open>
            <p class="text-sm text-muted">Ve a Configuración y completa tus datos personales.</p>
          </ui-accordion-item>
          <ui-accordion-item title="¿Qué planes están disponibles?">
            <p class="text-sm text-muted">Ofrecemos planes Gratuito, Pro y Empresa.</p>
          </ui-accordion-item>
          <ui-accordion-item title="¿Puedo cambiar de plan después?" description="Descripción breve del apartado.">
            <p class="text-sm text-muted">Sí, puedes cambiar de plan en cualquier momento.</p>
          </ui-accordion-item>
          <ui-accordion-item title="Soporte técnico" disabled>
            <p class="text-sm text-muted">Este apartado no está disponible.</p>
          </ui-accordion-item>
        </ui-accordion>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<AccordionComponent>;

export const Default: Story = {};

export const Multiple: Story = {
  args: { multiple: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '¿Qué planes están disponibles?' }));
    await waitFor(async () => {
      await expect(canvas.getByText('Ofrecemos planes Gratuito, Pro y Empresa.')).toBeVisible();
    });
  },
};
