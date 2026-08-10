import type { Meta, StoryObj } from '@storybook/angular-vite';
import {
  LucideUsers,
  LucideTrendingUp,
  LucideDollarSign,
  LucideAlertTriangle,
} from '@lucide/angular';
import { StatCardComponent } from './stat-card.component';

const meta: Meta<StatCardComponent> = {
  title: 'Data Display/StatCard',
  component: StatCardComponent,
  args: {
    icon: LucideUsers,
    label: 'Usuarios activos',
    value: '1,284',
    sublabel: '+12% vs mes anterior',
    accent: 'brand',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-72">
        <ui-stat-card [icon]="icon" [label]="label" [value]="value" [sublabel]="sublabel" [accent]="accent" />
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<StatCardComponent>;

export const Default: Story = {};

export const Green: Story = {
  args: {
    icon: LucideTrendingUp,
    accent: 'green',
    label: 'Ingresos',
    value: '$48.9k',
    sublabel: '+8.2% este mes',
  },
};

export const Amber: Story = {
  args: {
    icon: LucideAlertTriangle,
    accent: 'amber',
    label: 'Alertas abiertas',
    value: '17',
    sublabel: '3 requieren atención',
  },
};

export const Pink: Story = {
  args: {
    icon: LucideDollarSign,
    accent: 'pink',
    label: 'Ventas',
    value: '$12,430',
    sublabel: 'Meta 75%',
  },
};
