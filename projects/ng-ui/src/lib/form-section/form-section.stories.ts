import type { Meta, StoryObj } from '@storybook/angular-vite';
import { FormSectionComponent } from './form-section.component';

const meta: Meta<FormSectionComponent> = {
  title: 'Forms/FormSection',
  component: FormSectionComponent,
  args: {
    title: 'Datos personales',
    description: 'Completa tu información de contacto.',
    invalid: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-96">
        <ui-form-section
          [title]="title"
          [description]="description"
          [invalid]="invalid"
          [error]="error"
        >
          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-fg">Nombre</label>
              <input class="w-full rounded-lg border border-default bg-surface-2 px-3 py-2 text-sm text-fg outline-none focus:border-primary" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-fg">Email</label>
              <input class="w-full rounded-lg border border-default bg-surface-2 px-3 py-2 text-sm text-fg outline-none focus:border-primary" />
            </div>
          </div>
        </ui-form-section>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<FormSectionComponent>;

export const Default: Story = {};

export const WithError: Story = {
  args: { invalid: true, error: 'La sección tiene errores de validación.' },
};

export const WithoutDescription: Story = {
  args: { description: '' },
};
