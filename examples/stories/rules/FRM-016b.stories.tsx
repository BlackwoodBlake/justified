import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM016b } from "../../rules/FRM-016b";

/* The live examples for FRM-016b, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-016b Clickable switch text",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM016b.examples} /> };

export const Example1: Story = {
  name: "Do: The words turn the switch on",
  render: () => {
    const e = FRM016b.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: The words are a span",
  render: () => {
    const e = FRM016b.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: A Label with no htmlFor",
  render: () => {
    const e = FRM016b.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
