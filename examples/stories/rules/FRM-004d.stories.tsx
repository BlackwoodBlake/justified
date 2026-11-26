import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM004d } from "../../rules/FRM-004d";

/* The live examples for FRM-004d, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-004d Keep work on leaving",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM004d.examples} /> };

export const Example1: Story = {
  name: "Do: Save as the person moves on, and say so",
  render: () => {
    const e = FRM004d.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Do: Keep a draft across steps and visits, and say where",
  render: () => {
    const e = FRM004d.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: Hold the values in the page only, with no line",
  render: () => {
    const e = FRM004d.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: Say “All changes saved” before it is true",
  render: () => {
    const e = FRM004d.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
