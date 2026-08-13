import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';
import { ThemeSwitcherComponent } from './theme-switcher.component';

const meta: Meta<ThemeSwitcherComponent> = {
  title: 'Actions/ThemeSwitcher',
  parameters: {
    a11y: { test: 'error' },
  },
  component: ThemeSwitcherComponent,
  args: {
    storageKey: 'emc-ui-theme',
    defaultTheme: 'light',
    variant: 'ghost',
    size: 'icon',
    labelLight: 'Cambiar a tema oscuro',
    labelDark: 'Cambiar a tema claro',
    themeChange: fn(),
  },
  argTypes: {
    themeChange: {
      description: 'Se emite al cambiar el tema.',
      table: { disable: true },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-wrap items-center gap-6 rounded-xl border border-default bg-surface p-8">
        <ui-theme-switcher
          [storageKey]="storageKey"
          [defaultTheme]="defaultTheme"
          [variant]="variant"
          [size]="size"
          [labelLight]="labelLight"
          [labelDark]="labelDark"
          (themeChange)="themeChange($event)"
        />
        <span class="text-sm text-muted">
          Pulsa para alternar el modo oscuro. La elección se guarda en
          <code class="rounded bg-surface-2 px-1.5 py-0.5 text-xs">localStorage</code>.
        </span>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<ThemeSwitcherComponent>;

export const Default: Story = {};

export const Variants: Story = {
  args: { variant: 'secondary' },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-wrap items-center gap-6 rounded-xl border border-default bg-surface p-8">
        <ui-theme-switcher
          [storageKey]="storageKey"
          [defaultTheme]="defaultTheme"
          [variant]="variant"
          [labelLight]="labelLight"
          [labelDark]="labelDark"
        />
        <ui-theme-switcher
          [storageKey]="storageKey"
          [defaultTheme]="defaultTheme"
          variant="outline"
          [labelLight]="labelLight"
          [labelDark]="labelDark"
        />
        <ui-theme-switcher
          [storageKey]="storageKey"
          [defaultTheme]="defaultTheme"
          variant="subtle"
          [labelLight]="labelLight"
          [labelDark]="labelDark"
        />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-6 rounded-xl border border-default bg-surface p-8">
        <ui-theme-switcher size="icon-sm" />
        <ui-theme-switcher size="icon" />
        <ui-theme-switcher size="sm" />
      </div>
    `,
  }),
};

export const CustomLabels: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-6 rounded-xl border border-default bg-surface p-8">
        <ui-theme-switcher labelLight="Activar modo oscuro" labelDark="Activar modo claro" />
      </div>
    `,
  }),
};
