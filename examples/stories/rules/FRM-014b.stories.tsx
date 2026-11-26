import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM014b } from "../../rules/FRM-014b";

/* The live examples for FRM-014b, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-014b Digit strings as text",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM014b.examples} /> };

export const Example1: Story = {
  name: "Don't: Codes and numbers in a number input",
  render: () => {
    const e = FRM014b.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: The spinner hidden, the field still a number input",
  render: () => {
    const e = FRM014b.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: Digit strings in text inputs",
  render: () => {
    const e = FRM014b.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Do: A true small count may be a number input",
  render: () => {
    const e = FRM014b.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
