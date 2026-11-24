import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FBK003 } from "../../rules/FBK-003";

/* The live examples for FBK-003, as on its rule page. */
const meta = {
  title: "Rules/Feedback/FBK-003 Success in the view",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FBK003.examples} /> };

export const Example1: Story = {
  name: "Do: The invitation shows up in the list and stays",
  render: () => {
    const e = FBK003.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Only a toast that goes after four seconds",
  render: () => {
    const e = FBK003.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
