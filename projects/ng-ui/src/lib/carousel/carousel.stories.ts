import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { userEvent, within } from 'storybook/test';
import { Component, signal } from '@angular/core';
import { CarouselComponent } from './carousel.component';

@Component({
  selector: 'carousel-demo',
  standalone: true,
  imports: [CarouselComponent],
  template: `
    <div class="w-full max-w-xl">
      <ui-carousel [loop]="true">
        @for (slide of slides(); track slide) {
          <div class="flex h-64 items-center justify-center rounded-2xl bg-surface-2 text-fg">
            <span class="text-4xl font-semibold">{{ slide }}</span>
          </div>
        }
      </ui-carousel>
    </div>
  `,
})
class CarouselDemoComponent {
  readonly slides = signal(['1', '2', '3', '4']);
}

const meta: Meta<CarouselComponent> = {
  title: 'Data Display/Carousel',
  parameters: {
    a11y: { test: 'error' },
  },
  component: CarouselComponent,
  decorators: [moduleMetadata({ imports: [CarouselDemoComponent] })],
  render: () => ({ template: `<carousel-demo />` }),
};

export default meta;
type Story = StoryObj<CarouselComponent>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Diapositiva siguiente' }),
    );
  },
};

export const LoopDisabled: Story = {
  render: () => ({
    template: `<div class="w-full max-w-xl"><ui-carousel loop="false">
      <div class="flex h-64 items-center justify-center rounded-2xl bg-surface-2 text-fg"><span class="text-4xl font-semibold">1</span></div>
      <div class="flex h-64 items-center justify-center rounded-2xl bg-surface-2 text-fg"><span class="text-4xl font-semibold">2</span></div>
      <div class="flex h-64 items-center justify-center rounded-2xl bg-surface-2 text-fg"><span class="text-4xl font-semibold">3</span></div>
    </ui-carousel></div>`,
  }),
};

export const Autoplay: Story = {
  render: () => ({
    template: `<div class="w-full max-w-xl"><ui-carousel [autoplay]="true" [autoplayInterval]="3000">
      <div class="flex h-64 items-center justify-center rounded-2xl bg-surface-2 text-fg"><span class="text-4xl font-semibold">1</span></div>
      <div class="flex h-64 items-center justify-center rounded-2xl bg-surface-2 text-fg"><span class="text-4xl font-semibold">2</span></div>
      <div class="flex h-64 items-center justify-center rounded-2xl bg-surface-2 text-fg"><span class="text-4xl font-semibold">3</span></div>
    </ui-carousel></div>`,
  }),
};
