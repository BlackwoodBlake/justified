import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM007 } from "../../rules/FRM-007";

/* The live examples for FRM-007, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-007 Autocomplete",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM007.examples} /> };

export const Example1: Story = {
  name: "Do: The exact value for each field",
  render: () => {
    const e = FRM007.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Off, missing or made up",
  render: () => {
    const e = FRM007.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
