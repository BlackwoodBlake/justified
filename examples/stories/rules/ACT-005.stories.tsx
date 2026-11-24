import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { ACT005 } from "../../rules/ACT-005";

/* The live examples for ACT-005, as on its rule page. */
const meta = {
  title: "Rules/Actions/ACT-005 Say what is needed",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={ACT005.examples} /> };

export const Example1: Story = {
  name: "Do: A neutral line right before the button",
  render: () => {
    const e = ACT005.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Greyed out with nothing near it",
  render: () => {
    const e = ACT005.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
