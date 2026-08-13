import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { userEvent, within, expect, waitFor } from 'storybook/test';
import { PopoverComponent } from './popover.component';

const meta: Meta<PopoverComponent> = {
  title: 'Overlays/Popover',
  component: PopoverComponent,
  decorators: [moduleMetadata({ imports: [PopoverComponent] })],
  args: {
    label: 'Abrir popover',
    placement: 'bottom',
    align: 'center',
    minWidth: '18rem',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex justify-center pt-2">
        <ui-popover
          [label]="label"
          [placement]="placement"
          [align]="align"
          [minWidth]="minWidth"
        >
          <div class="space-y-2">
            <p class="text-sm font-semibold text-fg">Detalles</p>
            <p class="text-sm text-muted">
              Contenido libre: texto, listas, formularios o cualquier componente de la librería.
            </p>
          </div>
        </ui-popover>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<PopoverComponent>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Abrir popover' }));
    await waitFor(async () => {
      await expect(await within(document.body).findByText('Detalles')).toBeVisible();
    });
  },
};

export const Top: Story = {
  args: { placement: 'top' },
};

export const Left: Story = {
  args: { placement: 'left' },
};

export const Right: Story = {
  args: { placement: 'right' },
};

export const AlignEnd: Story = {
  args: { align: 'end' },
};
