import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM002a } from "../../rules/FRM-002a";

/* The live examples for FRM-002a, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-002a Error at the field",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM002a.examples} /> };

export const Example1: Story = {
  name: "Do: The error at the field",
  render: () => {
    const e = FRM002a.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: A banner and a red outline",
  render: () => {
    const e = FRM002a.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
