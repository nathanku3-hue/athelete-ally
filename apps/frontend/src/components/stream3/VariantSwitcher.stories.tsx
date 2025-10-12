/**
 * VariantSwitcher Storybook Stories
 * Stream 3: UI Prototypes
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { VariantSwitcher } from './VariantSwitcher';

const meta: Meta<typeof VariantSwitcher> = {
  title: 'Stream3/VariantSwitcher',
  component: VariantSwitcher,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof VariantSwitcher>;

export const Default: Story = {};

export const WithContext: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Demo Page with Variant Switcher</h1>
          <p className="text-gray-600 mb-8">
            The variant switcher appears in the bottom-right corner. Use it to toggle between UI variants.
          </p>
          <div className="bg-white rounded-lg shadow p-6">
            <p>Sample content area</p>
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
};
