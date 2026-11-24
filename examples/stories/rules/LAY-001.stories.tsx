import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { LAY001 } from "../../rules/LAY-001";

/* The live examples for LAY-001, as on its rule page. */
const meta = {
  title: "Rules/Layout/LAY-001 Reflow to 320 px",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={LAY001.examples} /> };

export const Example1: Story = {
  name: "Do: Cards reflow and long strings wrap",
  render: () => {
    const e = LAY001.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: A minimum width of 768 px",
  render: () => {
    const e = LAY001.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
