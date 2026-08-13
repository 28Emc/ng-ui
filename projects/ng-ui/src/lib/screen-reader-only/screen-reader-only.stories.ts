import type { Meta, StoryObj } from '@storybook/angular-vite';
import { ScreenReaderOnlyComponent } from './screen-reader-only.component';

const meta: Meta<ScreenReaderOnlyComponent> = {
  title: 'Accessibility/ScreenReaderOnly',
  parameters: {
    a11y: { test: 'error' },
  },
  component: ScreenReaderOnlyComponent,
  render: () => ({
    template: `
      <div class="max-w-xl space-y-6">
        <section>
          <h2 class="mb-1 text-base font-semibold text-fg">Texto en línea</h2>
          <p class="text-sm text-muted">
            Este párrafo es visible e incluye
            <ui-screen-reader-only>un fragmento que solo leerán los lectores de pantalla</ui-screen-reader-only>
            dentro del mismo flujo de texto.
          </p>
        </section>

        <section>
          <ui-screen-reader-only>
            <h2 class="text-base font-semibold text-fg">Atajos de teclado</h2>
          </ui-screen-reader-only>
          <p class="text-sm text-muted">
            El título de esta sección está oculto visualmente, pero los lectores de pantalla lo
            anuncian como encabezado de nivel 2.
          </p>
        </section>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<ScreenReaderOnlyComponent>;

export const InlineText: Story = {};

export const VisuallyHiddenHeading: Story = {};
