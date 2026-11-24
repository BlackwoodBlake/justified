import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM009 } from "../../rules/FRM-009";

/* The live examples for FRM-009, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-009 No entering twice",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM009.examples} /> };

export const Example1: Story = {
  name: "Do: The number given before, offered as a choice",
  render: () => {
    const e = FRM009.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: An empty field for the same number",
  render: () => {
    const e = FRM009.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
