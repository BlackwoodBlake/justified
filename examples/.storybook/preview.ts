import type { Preview } from "@storybook/react-vite";

import "../styles.css";

const preview: Preview = {
  parameters: {
    // Fail the accessibility panel's checks instead of only listing them.
    a11y: { test: "error" },
    options: { storySort: { order: ["Foundations", ["Colour", "Typography", "Space and shape", "Layout", "Focus and motion"], "Components", "Rules", ["Actions", "Destructive actions", "Dialogs", "Feedback", "Forms", "Keyboard", "Layout", "States", "Text"]] } },
  },
  globalTypes: {
    theme: {
      description: "Colour theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, context) => {
      document.documentElement.classList.toggle("dark", context.globals.theme === "dark");
      return Story();
    },
  ],
};

export default preview;
