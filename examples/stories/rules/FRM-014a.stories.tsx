import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM014a } from "../../rules/FRM-014a";

/* The live examples for FRM-014a, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-014a Digit keypad",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM014a.examples} /> };

export const Example1: Story = {
  name: "Do: Digit fields get the digit keypad",
  render: () => {
    const e = FRM014a.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Do: Amounts with a decimal part, and values that can be negative",
  render: () => {
    const e = FRM014a.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: A phone type or a pattern for the keypad",
  render: () => {
    const e = FRM014a.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: A digit keypad for a value with letters",
  render: () => {
    const e = FRM014a.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
