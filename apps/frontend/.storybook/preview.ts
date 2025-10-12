import type { Preview } from '@storybook/react-webpack5'
// eslint-disable-next-line import/no-internal-modules
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    a11y: {
      element: '#storybook-root',
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
};

export default preview;