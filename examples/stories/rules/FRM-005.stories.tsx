import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM005 } from "../../rules/FRM-005";

/* The live examples for FRM-005, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-005 Required or optional",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM005.examples} /> };

export const Example1: Story = {
  name: "Do: One marker, explained at the top",
  render: () => {
    const e = FRM005.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Mixed markers, explained at the end",
  render: () => {
    const e = FRM005.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
