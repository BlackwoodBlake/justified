import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FBK004 } from "../../rules/FBK-004";

/* The live examples for FBK-004, as on its rule page. */
const meta = {
  title: "Rules/Feedback/FBK-004 Announce status",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FBK004.examples} /> };

export const Example1: Story = {
  name: "Do: The save line is a live region",
  render: () => {
    const e = FBK004.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: The same line, not announced",
  render: () => {
    const e = FBK004.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
