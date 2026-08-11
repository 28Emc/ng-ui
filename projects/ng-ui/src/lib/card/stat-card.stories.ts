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
      <div class="w-72 p-2">
        <p class="kicker">Key metric</p>
        <ui-stat-card [icon]="icon" [label]="label" [value]="value" [sublabel]="sublabel" [accent]="accent" />
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<StatCardComponent>;

export const Default: Story = {};

export const Success: Story = {
  args: {
    icon: LucideTrendingUp,
    accent: 'success',
    label: 'Ingresos',
    value: '$48.9k',
    sublabel: '+8.2% este mes',
  },
};

export const Warning: Story = {
  args: {
    icon: LucideAlertTriangle,
    accent: 'warning',
    label: 'Alertas abiertas',
    value: '17',
    sublabel: '3 requieren atención',
  },
};

export const Info: Story = {
  args: {
    icon: LucideUsers,
    accent: 'info',
    label: 'Usuarios activos',
    value: '1,284',
    sublabel: '+12% vs mes anterior',
  },
};

export const Danger: Story = {
  args: {
    icon: LucideAlertTriangle,
    accent: 'danger',
    label: 'Errores en 24h',
    value: '7',
    sublabel: 'Revisar logs',
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
