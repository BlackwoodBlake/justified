import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { ACT007b } from "../../rules/ACT-007b";

/* The live examples for ACT-007b, as on its rule page. */
const meta = {
  title: "Rules/Actions/ACT-007b Announce keyboard moves",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;


export const All: Story = { render: () => <ExampleGrid examples={ACT007b.examples} /> };

export const Example1: Story = {
  name: "Do: Labels and positions at every step",
  render: () => {
    const e = ACT007b.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Do: On a board, the column too",
  render: () => {
    const e = ACT007b.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: The library's default, which reads out ids",
  render: () => {
    const e = ACT007b.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: Positions counted from zero",
  render: () => {
    const e = ACT007b.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
