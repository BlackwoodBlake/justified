import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM004a } from "../../rules/FRM-004a";

/* The live examples for FRM-004a, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-004a Unsaved changes, full screen",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM004a.examples} /> };

export const Example1: Story = {
  name: "Do: Ask once before the review is lost",
  render: () => {
    const e = FRM004a.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Close at once and lose the text",
  render: () => {
    const e = FRM004a.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
