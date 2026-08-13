import type { Meta, StoryObj } from '@storybook/angular-vite';
import { within, expect } from 'storybook/test';
import { StepperComponent } from './stepper.component';

const meta: Meta<StepperComponent> = {
  title: 'Navigation/Stepper',
  component: StepperComponent,
  args: {
    steps: 4,
    labels: ['Datos personales', 'Verificación', 'Pago', 'Confirmación'],
    activeIndex: 1,
  },
  render: (args) => ({
    props: args,
    template: `<ui-stepper [steps]="steps" [labels]="labels" [activeIndex]="activeIndex" />`,
  }),
};

export default meta;
type Story = StoryObj<StepperComponent>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const currentStep = await within(canvasElement).findByText('2');
    await expect(currentStep.closest('[aria-current]')).toHaveAttribute('aria-current', 'step');
  },
};

export const FirstStep: Story = {
  args: { activeIndex: 0 },
};

export const LastStep: Story = {
  args: { activeIndex: 3 },
};

export const WithoutLabels: Story = {
  args: { labels: [] },
};
