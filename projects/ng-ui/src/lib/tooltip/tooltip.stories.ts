import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { TooltipDirective } from './tooltip.directive';
import { ButtonComponent } from '../button/button.component';

const meta: Meta<TooltipDirective> = {
  title: 'Data Display/Tooltip',
  component: TooltipDirective,
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent],
    }),
  ],
  args: {
    uiTooltip: 'Guarda los cambios realizados',
    placement: 'top',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex justify-center py-10">
        <ui-button uiTooltip="{{ uiTooltip }}" placement="{{ placement }}">Guardar cambios</ui-button>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<TooltipDirective>;

export const Top: Story = {};

export const Bottom: Story = {
  args: { placement: 'bottom' },
};

export const Left: Story = {
  args: { placement: 'left' },
};

export const Right: Story = {
  args: { placement: 'right', uiTooltip: 'Ver más detalles' },
};
