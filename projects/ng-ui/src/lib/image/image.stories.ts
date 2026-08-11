import type { Meta, StoryObj } from '@storybook/angular-vite';
import { ImageComponent } from './image.component';

const meta: Meta<ImageComponent> = {
  title: 'Data Display/Image',
  component: ImageComponent,
  args: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    alt: 'Paisaje de montañas al atardecer',
    width: 1200,
    height: 800,
    loading: 'lazy',
    priority: false,
    objectFit: 'cover',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-full max-w-xl">
        <ui-image
          [src]="src"
          [alt]="alt"
          [width]="width"
          [height]="height"
          [loading]="loading"
          [priority]="priority"
          [blurSrc]="blurSrc"
          [objectFit]="objectFit"
        />
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<ImageComponent>;

export const Default: Story = {};

export const EagerPriority: Story = {
  args: { loading: 'eager', priority: true },
};

export const WithBlurPlaceholder: Story = {
  args: {
    blurSrc:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI1MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzE1YTE4YiIvPjwvc3ZnPg==',
  },
};

export const ResponsiveSrcset: Story = {
  args: {
    srcset: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70 400w',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=75 800w',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80 1200w',
    ].join(', '),
    sizes: '(max-width: 640px) 100vw, 800px',
  },
};
