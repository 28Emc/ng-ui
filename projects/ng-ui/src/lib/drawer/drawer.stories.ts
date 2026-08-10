import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { DrawerComponent } from './drawer.component';
import { UiDrawerFooterDirective } from './drawer-footer.directive';
import { ButtonComponent } from '../button/button.component';

const meta: Meta<DrawerComponent> = {
  title: 'Overlays/Drawer',
  component: DrawerComponent,
  decorators: [
    moduleMetadata({
      imports: [UiDrawerFooterDirective, ButtonComponent],
    }),
  ],
  args: {
    title: 'Detalles del pedido',
    subtitle: '#ORD-2026-0841',
    width: 'w-96',
    open: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-drawer [open]="open" [title]="title" [subtitle]="subtitle" [width]="width">
        <div class="space-y-3 text-sm">
          <p class="text-muted">Cliente: <span class="font-medium text-fg">Ana Torres</span></p>
          <p class="text-muted">Total: <span class="font-medium text-fg">$1,240.00</span></p>
          <p class="text-muted">
            El contenido del drawer se proyecta aquí y puede incluir cualquier componente.
          </p>
        </div>
        <footer uiDrawerFooter class="flex justify-end gap-3">
          <ui-button variant="ghost">Cerrar</ui-button>
          <ui-button>Descargar</ui-button>
        </footer>
      </ui-drawer>
    `,
  }),
};

export default meta;
type Story = StoryObj<DrawerComponent>;

export const Default: Story = {};

export const Wide: Story = {
  args: { width: 'w-[32rem]' },
};
