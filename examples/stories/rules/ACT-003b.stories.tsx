import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { ACT003b } from "../../rules/ACT-003b";

/* The live examples for ACT-003b, as on its rule page. */
const meta = {
  title: "Rules/Actions/ACT-003b Buttons on pages",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={ACT003b.examples} /> };

export const Example1: Story = {
  name: "Do: Each form has its own save button",
  render: () => {
    const e = ACT003b.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: One save button at the top of the page",
  render: () => {
    const e = ACT003b.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
