import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM017b } from "../../rules/FRM-017b";

/* The live examples for FRM-017b, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-017b Length limit shown",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM017b.examples} /> };

export const Example1: Story = {
  name: "Do: The limit in the hint, the count tied to the field",
  render: () => {
    const e = FRM017b.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Do: A word limit works the same way",
  render: () => {
    const e = FRM017b.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: The limit only in the database column",
  render: () => {
    const e = FRM017b.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: A count nothing points to",
  render: () => {
    const e = FRM017b.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example5: Story = {
  name: "Don't: A count that interrupts on every key",
  render: () => {
    const e = FRM017b.examples[4];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
