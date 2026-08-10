import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BreadcrumbComponent } from './breadcrumb.component';
import type { UiBreadcrumbItem } from './breadcrumb-item';

const items: UiBreadcrumbItem[] = [
  { label: 'Inicio', routerLink: ['/'] },
  { label: 'Proyectos', routerLink: ['/proyectos'] },
  { label: 'Documentación', routerLink: ['/proyectos/documentacion'] },
  { label: 'Detalle' },
];

const manyItems: UiBreadcrumbItem[] = [
  { label: 'Inicio', routerLink: ['/'] },
  { label: 'Organización', routerLink: ['/org'] },
  { label: 'Proyectos', routerLink: ['/org/proyectos'] },
  { label: '2026', routerLink: ['/org/proyectos/2026'] },
  { label: 'Q3', routerLink: ['/org/proyectos/2026/q3'] },
  { label: 'Informe', routerLink: ['/org/proyectos/2026/q3/informe'] },
  { label: 'Resumen' },
];

const meta: Meta<BreadcrumbComponent> = {
  title: 'Navigation/Breadcrumb',
  component: BreadcrumbComponent,
  args: { items, responsive: true },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[30rem] rounded-xl border border-default bg-surface p-4">
        <ui-breadcrumb [items]="items" [responsive]="responsive" />
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<BreadcrumbComponent>;

export const Default: Story = {};

export const ManyItems: Story = {
  args: { items: manyItems },
};

export const Collapsed: Story = {
  args: { items: manyItems, maxItems: 3 },
};

export const MixedLinks: Story = {
  args: {
    items: [
      { label: 'Inicio', href: '/' },
      { label: 'Perfil', href: '/profile' },
      { label: 'Configuración' },
    ],
  },
};
