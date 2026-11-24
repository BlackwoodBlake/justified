import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM011 } from "../../rules/FRM-011";

/* The live examples for FRM-011, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-011 Focus on failed send",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM011.examples} /> };

export const Example1: Story = {
  name: "Do: Focus goes to the problems, or to the one problem",
  render: () => {
    const e = FRM011.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: The messages appear and focus stays on the button",
  render: () => {
    const e = FRM011.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
