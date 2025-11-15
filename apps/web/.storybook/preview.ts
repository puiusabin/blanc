import type { Preview } from "@storybook/nextjs-vite"
import { initialize, mswLoader } from "msw-storybook-addon"
import { withProviders } from "./decorators/providers"
import { handlers } from "./mocks/handlers"
import "../src/app/globals.css"

initialize({
  onUnhandledRequest: "bypass",
})

const preview: Preview = {
  decorators: [withProviders],
  loaders: [mswLoader],

  parameters: {
    msw: {
      handlers,
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },

    viewport: {
      viewports: {
        mobile: {
          name: "Mobile",
          styles: {
            width: "375px",
            height: "667px",
          },
        },
        tablet: {
          name: "Tablet",
          styles: {
            width: "768px",
            height: "1024px",
          },
        },
        desktop: {
          name: "Desktop",
          styles: {
            width: "1280px",
            height: "800px",
          },
        },
      },
    },

    backgrounds: {
      default: "light",
      values: [
        {
          name: "light",
          value: "#ffffff",
        },
        {
          name: "dark",
          value: "#0a0a0a",
        },
      ],
    },
  },
}

export default preview
