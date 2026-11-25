import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { ACT008 } from "../../rules/ACT-008";

/* The live examples for ACT-008, as on its rule page. */
const meta = {
  title: "Rules/Actions/ACT-008 Drop target mark",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;


export const All: Story = { render: () => <ExampleGrid examples={ACT008.examples} /> };

export const Example1: Story = {
  name: "Do: A line in the gap where the row would go",
  render: () => {
    const e = ACT008.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Do: The column under the card, and only that one",
  render: () => {
    const e = ACT008.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: Columns stay marked after the card has gone on",
  render: () => {
    const e = ACT008.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: Only the border changes colour",
  render: () => {
    const e = ACT008.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
