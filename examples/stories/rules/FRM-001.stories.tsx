import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM001 } from "../../rules/FRM-001";

/* The live examples for FRM-001, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-001 Visible label",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM001.examples} /> };

export const Example1: Story = {
  name: "Do: A label above every field",
  render: () => {
    const e = FRM001.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Placeholders instead of labels",
  render: () => {
    const e = FRM001.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
