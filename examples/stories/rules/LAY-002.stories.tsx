import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { LAY002 } from "../../rules/LAY-002";

/* The live examples for LAY-002, as on its rule page. */
const meta = {
  title: "Rules/Layout/LAY-002 Code order",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={LAY002.examples} /> };

export const Example1: Story = {
  name: "Do: Steps in the same order in code and on screen",
  render: () => {
    const e = LAY002.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: CSS order rearranges the steps",
  render: () => {
    const e = LAY002.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
