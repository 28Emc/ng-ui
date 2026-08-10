import type { Meta, StoryObj } from '@storybook/angular-vite';
import {
  LucideBarChart3,
  LucideBell,
  LucideHome,
  LucideLayoutDashboard,
  LucideSettings,
  LucideUsers,
} from '@lucide/angular';
import { SidebarComponent } from './sidebar.component';
import type { UiSidebarItem } from './sidebar-item';

const items: UiSidebarItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LucideLayoutDashboard, routerLink: ['/'] },
  {
    key: 'proyectos',
    label: 'Proyectos',
    icon: LucideHome,
    badge: 5,
    children: [
      { key: 'todos', label: 'Todos', routerLink: ['/proyectos'] },
      { key: 'activos', label: 'Activos', routerLink: ['/proyectos/activos'] },
      { key: 'archivados', label: 'Archivados', routerLink: ['/proyectos/archivados'] },
    ],
  },
  {
    key: 'equipo',
    label: 'Equipo',
    icon: LucideUsers,
    children: [
      { key: 'miembros', label: 'Miembros', routerLink: ['/equipo'] },
      { key: 'roles', label: 'Roles', routerLink: ['/equipo/roles'] },
    ],
  },
  { key: 'reportes', label: 'Reportes', icon: LucideBarChart3, routerLink: ['/reportes'] },
  {
    key: 'notificaciones',
    label: 'Notificaciones',
    icon: LucideBell,
    badge: 12,
    routerLink: ['/notificaciones'],
  },
  { key: 'ajustes', label: 'Ajustes', icon: LucideSettings, routerLink: ['/ajustes'] },
];

const plainItems: UiSidebarItem[] = [
  { key: 'inicio', label: 'Inicio', routerLink: ['/'] },
  {
    key: 'documentacion',
    label: 'Documentación',
    children: [
      { key: 'guia', label: 'Guía de estilos' },
      { key: 'componentes', label: 'Componentes' },
    ],
  },
  { key: 'estado', label: 'Estado del sistema', badge: 'OK' },
  { key: 'soporte', label: 'Soporte', href: '/support' },
];

const meta: Meta<SidebarComponent> = {
  title: 'Navigation/Sidebar',
  component: SidebarComponent,
  args: {
    items,
    collapsible: true,
    collapsed: false,
    activeKey: 'activos',
    openKeys: ['proyectos'],
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex h-96 w-80 overflow-hidden rounded-xl border border-default bg-surface-2">
        <ui-sidebar
          [items]="items"
          [collapsible]="collapsible"
          [collapsed]="collapsed"
          (collapsedChange)="collapsed = $event"
          [activeKey]="activeKey"
          (activeKeyChange)="activeKey = $event"
          [openKeys]="openKeys"
          (openKeysChange)="openKeys = $event"
        />
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<SidebarComponent>;

export const Default: Story = {};

export const Collapsed: Story = {
  args: { collapsed: true },
};

export const WithoutIcons: Story = {
  args: { items: plainItems },
};
