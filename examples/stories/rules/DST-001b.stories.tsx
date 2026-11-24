import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { DST001b } from "../../rules/DST-001b";

/* The live examples for DST-001b, as on its rule page. */
const meta = {
  title: "Rules/Destructive actions/DST-001b When to ask first",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={DST001b.examples} /> };

export const Example1: Story = {
  name: "Do: Ask before data that cannot come back",
  render: () => {
    const e = DST001b.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Do: Reset at once, with Undo",
  render: () => {
    const e = DST001b.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: Ask before a step that one click reverses",
  render: () => {
    const e = DST001b.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
