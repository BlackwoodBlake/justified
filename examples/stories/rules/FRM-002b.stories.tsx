import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM002b } from "../../rules/FRM-002b";

/* The live examples for FRM-002b, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-002b When errors show",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM002b.examples} /> };

export const Example1: Story = {
  name: "Do: Checked when the person moves on",
  render: () => {
    const e = FRM002b.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Checked on every key press",
  render: () => {
    const e = FRM002b.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
