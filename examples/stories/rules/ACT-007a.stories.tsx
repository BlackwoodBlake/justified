import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { ACT007a } from "../../rules/ACT-007a";

/* The live examples for ACT-007a, as on its rule page. */
const meta = {
  title: "Rules/Actions/ACT-007a No drag needed",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;


export const All: Story = { render: () => <ExampleGrid examples={ACT007a.examples} /> };

export const Example1: Story = {
  name: "Do: Move up and Move down on each row",
  render: () => {
    const e = ACT007a.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Do: Tap a card, then choose a column",
  render: () => {
    const e = ACT007a.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: Dragging, and arrow keys while picked up",
  render: () => {
    const e = ACT007a.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
