import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FBK002 } from "../../rules/FBK-002";

/* The live examples for FBK-002, as on its rule page. */
const meta = {
  title: "Rules/Feedback/FBK-002 Failure where it started",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FBK002.examples} /> };

export const Example1: Story = {
  name: "Do: A notice in the panel that stays",
  render: () => {
    const e = FBK002.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Only a toast that fades",
  render: () => {
    const e = FBK002.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
