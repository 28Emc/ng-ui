import type { Meta, StoryObj } from '@storybook/angular-vite';
import { PaginationComponent } from './pagination.component';

const meta: Meta<PaginationComponent> = {
  title: 'Data Display/Pagination',
  component: PaginationComponent,
  args: {
    page: 3,
    pageSize: 10,
    total: 120,
    siblingCount: 1,
    showInfo: true,
  },
  render: (args) => ({
    props: args,
    template: `<ui-pagination [page]="page" [pageSize]="pageSize" [total]="total" [siblingCount]="siblingCount" [showInfo]="showInfo" />`,
  }),
};

export default meta;
type Story = StoryObj<PaginationComponent>;

export const Default: Story = {};

export const FirstPage: Story = {
  args: { page: 1 },
};

export const LastPage: Story = {
  args: { page: 12 },
};

export const ManyPages: Story = {
  args: { total: 1000 },
};

export const NoInfo: Story = {
  args: { showInfo: false },
};
