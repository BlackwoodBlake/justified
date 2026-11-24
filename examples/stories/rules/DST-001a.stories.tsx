import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { DST001a } from "../../rules/DST-001a";

/* The live examples for DST-001a, as on its rule page. */
const meta = {
  title: "Rules/Destructive actions/DST-001a Undo over asking",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={DST001a.examples} /> };

export const Example1: Story = {
  name: "Do: Archive at once, with Undo",
  render: () => {
    const e = DST001a.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: A question before every archive",
  render: () => {
    const e = DST001a.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
