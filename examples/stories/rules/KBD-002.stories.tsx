import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { KBD002 } from "../../rules/KBD-002";

/* The live examples for KBD-002, as on its rule page. */
const meta = {
  title: "Rules/Keyboard/KBD-002 Focus in view",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={KBD002.examples} /> };

export const Example1: Story = {
  name: "Do: Scroll room reserved for the sticky header",
  render: () => {
    const e = KBD002.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Sticky header with no reserved room",
  render: () => {
    const e = KBD002.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
