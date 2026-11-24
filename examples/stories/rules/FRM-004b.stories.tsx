import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM004b } from "../../rules/FRM-004b";

/* The live examples for FRM-004b, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-004b Unsaved changes, small dialog",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM004b.examples} /> };

export const Example1: Story = {
  name: "Do: Ask on every way out, and only when it matters",
  render: () => {
    const e = FRM004b.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Cancel asks, Escape and the backdrop do not",
  render: () => {
    const e = FRM004b.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
