import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { userEvent, within, expect } from 'storybook/test';
import { TabsComponent } from './tabs.component';
import { TabComponent } from './tab.component';

const meta: Meta<TabsComponent> = {
  title: 'Navigation/Tabs',
  component: TabsComponent,
  decorators: [
    moduleMetadata({
      imports: [TabComponent],
    }),
  ],
  args: {
    label: 'Secciones de configuración',
    activeIndex: 0,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[32rem]">
        <ui-tabs [label]="label" [activeIndex]="activeIndex">
          <ui-tab label="General">
            <p class="text-sm text-muted">Configuración general de la cuenta.</p>
          </ui-tab>
          <ui-tab label="Seguridad">
            <p class="text-sm text-muted">Contraseña, autenticación de dos factores y sesiones.</p>
          </ui-tab>
          <ui-tab label="Notificaciones">
            <p class="text-sm text-muted">Preferencias de correo y alertas.</p>
          </ui-tab>
          <ui-tab label="Avanzado" [disabled]="true">
            <p class="text-sm text-muted">Opciones avanzadas (deshabilitado).</p>
          </ui-tab>
        </ui-tabs>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<TabsComponent>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('tab', { name: 'General' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.click(canvas.getByRole('tab', { name: 'Seguridad' }));
    await expect(canvas.getByRole('tab', { name: 'Seguridad' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

export const SecondTabActive: Story = {
  args: { activeIndex: 1 },
};
