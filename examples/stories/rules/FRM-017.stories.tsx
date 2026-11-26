import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM017 } from "../../rules/FRM-017";

/* The live examples for FRM-017, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-017 Paste allowed",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM017.examples} /> };

export const Example1: Story = {
  name: "Do: A single line and a paragraph take the paste",
  render: () => {
    const e = FRM017.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Do: A reference in two boxes: a paste spreads across both",
  render: () => {
    const e = FRM017.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: A field that cancels paste",
  render: () => {
    const e = FRM017.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: A mask that drops a paste it did not expect",
  render: () => {
    const e = FRM017.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example5: Story = {
  name: "Don't: Boxes that take a paste in the first box only",
  render: () => {
    const e = FRM017.examples[4];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
