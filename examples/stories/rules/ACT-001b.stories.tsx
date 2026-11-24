import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { ACT001b } from "../../rules/ACT-001b";

/* The live examples for ACT-001b, as on its rule page. */
const meta = {
  title: "Rules/Actions/ACT-001b Button names",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={ACT001b.examples} /> };

export const Example1: Story = {
  name: "Do: Named by what it does, visible words kept",
  render: () => {
    const e = ACT001b.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Named after the picture, visible words missing",
  render: () => {
    const e = ACT001b.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
