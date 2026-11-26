import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM017c } from "../../rules/FRM-017c";

/* The live examples for FRM-017c, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-017c Limit reached in words",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM017c.examples} /> };

export const Example1: Story = {
  name: "Do: Input stops at the limit, and the count says so",
  render: () => {
    const e = FRM017c.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Do: Input runs past the limit, and the count and the error say so",
  render: () => {
    const e = FRM017c.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: A cap that cuts a paste in silence",
  render: () => {
    const e = FRM017c.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: A count that only turns red",
  render: () => {
    const e = FRM017c.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
