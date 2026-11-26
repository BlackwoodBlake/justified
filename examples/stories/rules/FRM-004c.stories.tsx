import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM004c } from "../../rules/FRM-004c";

/* The live examples for FRM-004c, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-004c Unsaved changes, page",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM004c.examples} /> };

export const Example1: Story = {
  name: "Do: Every way out asks, and only after a change",
  render: () => {
    const e = FRM004c.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Only Cancel asks, the other ways out do not",
  render: () => {
    const e = FRM004c.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: Ask again after a successful save",
  render: () => {
    const e = FRM004c.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
