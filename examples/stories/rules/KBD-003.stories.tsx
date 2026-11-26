import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { KBD003 } from "../../rules/KBD-003";

/* The live examples for KBD-003, as on its rule page. */
const meta = {
  title: "Rules/Keyboard/KBD-003 Character key shortcuts",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={KBD003.examples} /> };

export const Example1: Story = {
  name: "Do: A switch turns single-key shortcuts off",
  render: () => {
    const e = KBD003.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Do: j and k act only inside the list",
  render: () => {
    const e = KBD003.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: Page-wide e, and the text-field guard is the only protection",
  render: () => {
    const e = KBD003.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: Shift+D with no way out",
  render: () => {
    const e = KBD003.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
