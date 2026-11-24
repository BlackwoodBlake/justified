import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { DLG002 } from "../../rules/DLG-002";

/* The live examples for DLG-002, as on its rule page. */
const meta = {
  title: "Rules/Dialogs/DLG-002 One dialog at a time",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={DLG002.examples} /> };

export const Example1: Story = {
  name: "Do: The question takes the dialog's place",
  render: () => {
    const e = DLG002.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: A second dialog on top of the first",
  render: () => {
    const e = DLG002.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
