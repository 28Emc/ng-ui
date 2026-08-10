import type { Meta, StoryObj } from '@storybook/angular-vite';
import { CopyToClipboardButtonComponent } from './copy-to-clipboard-button.component';

const meta: Meta<CopyToClipboardButtonComponent> = {
  title: 'Actions/CopyToClipboardButton',
  component: CopyToClipboardButtonComponent,
  args: {
    text: 'pnpm add emc-ui',
    label: 'Copiar',
    copiedLabel: '¡Copiado!',
    variant: 'ghost',
    size: 'icon',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2">
          <code class="text-sm text-fg">{{ text }}</code>
          <ui-copy-button [text]="text" [label]="label" [copiedLabel]="copiedLabel" />
        </div>
        <ui-copy-button
          [text]="text"
          [label]="label"
          [copiedLabel]="copiedLabel"
          [variant]="variant"
          [size]="size"
        />
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<CopyToClipboardButtonComponent>;

export const Default: Story = {};

export const SecondaryWithText: Story = {
  args: { variant: 'secondary', size: 'sm' },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-wrap items-center gap-4">
        <ui-copy-button
          [text]="text"
          [label]="label"
          [copiedLabel]="copiedLabel"
          [variant]="variant"
          [size]="size"
        />
        <ui-copy-button text="npm i emc-ui" label="Copiar comando" copiedLabel="¡Copiado!" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  args: { variant: 'outline' },
  render: (args) => ({
    props: args,
    template: `
      <ui-copy-button
        [text]="text"
        [label]="label"
        [copiedLabel]="copiedLabel"
        [variant]="variant"
        [disabled]="true"
      />
    `,
  }),
};
