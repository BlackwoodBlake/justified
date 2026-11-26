import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM016a } from "../../rules/FRM-016a";

/* The live examples for FRM-016a, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-016a Clickable option text",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM016a.examples} /> };

export const Example1: Story = {
  name: "Do: The words tick the box",
  render: () => {
    const e = FRM016a.examples[0];
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
    const e = FRM016a.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: Each seat type answers its own words",
  render: () => {
    const e = FRM016a.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: Every label reaches the first box",
  render: () => {
    const e = FRM016a.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
