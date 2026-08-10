import type { Meta, StoryObj } from '@storybook/angular-vite';
import { LucideInbox, LucideUserX } from '@lucide/angular';
import { EmptyStateComponent } from './empty-state.component';

const meta: Meta<EmptyStateComponent> = {
  title: 'Feedback/EmptyState',
  component: EmptyStateComponent,
  args: {
    title: 'No hay resultados',
    description: 'Intenta ajustar los filtros para encontrar lo que buscas.',
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-empty-state
        [icon]="icon"
        [title]="title"
        [description]="description"
        class="block rounded-xl border border-default bg-surface"
      />
    `,
  }),
};

export default meta;
type Story = StoryObj<EmptyStateComponent>;

export const Default: Story = {
  args: { icon: LucideInbox },
};

export const WithAction: Story = {
  args: { icon: LucideUserX },
  render: (args) => ({
    props: args,
    template: `
      <ui-empty-state
        [icon]="icon"
        [title]="title"
        [description]="description"
        class="block rounded-xl border border-default bg-surface"
      >
        <button uiEmptyStateAction class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white">
          Crear nuevo
        </button>
      </ui-empty-state>
    `,
  }),
};
