import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { STA001 } from "../../rules/STA-001";

/* The live examples for STA-001, as on its rule page. */
const meta = {
  title: "Rules/States/STA-001 Where waits show",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={STA001.examples} /> };

export const Example1: Story = {
  name: "Do: The wait sits in the table",
  render: () => {
    const e = STA001.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: A layer over the whole page",
  render: () => {
    const e = STA001.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
