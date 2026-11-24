import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FBK005 } from "../../rules/FBK-005";

/* The live examples for FBK-005, as on its rule page. */
const meta = {
  title: "Rules/Feedback/FBK-005 Toast actions",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FBK005.examples} /> };

export const Example1: Story = {
  name: "Do: One Undo that waits, and a lasting way back",
  render: () => {
    const e = FBK005.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Three actions and a timer",
  render: () => {
    const e = FBK005.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
