import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { LAY003b } from "../../rules/LAY-003b";

/* The live examples for LAY-003b, as on its rule page. */
const meta = {
  title: "Rules/Layout/LAY-003b Text spacing",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={LAY003b.examples} /> };

export const Example1: Story = {
  name: "Do: A shift card that gives way",
  render: () => {
    const e = LAY003b.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Fixed heights that cut text off",
  render: () => {
    const e = LAY003b.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: Sidebar items that wrap",
  render: () => {
    const e = LAY003b.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: Sidebar items that truncate",
  render: () => {
    const e = LAY003b.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example5: Story = {
  name: "Don't: Tabs with a fixed width",
  render: () => {
    const e = LAY003b.examples[4];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
