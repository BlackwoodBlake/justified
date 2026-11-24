import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { DLG004 } from "../../rules/DLG-004";

/* The live examples for DLG-004, as on its rule page. */
const meta = {
  title: "Rules/Dialogs/DLG-004 No destructive default",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={DLG004.examples} /> };

export const Example1: Story = {
  name: "Do: Focus starts on Cancel",
  render: () => {
    const e = DLG004.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Focus starts on the destructive button",
  render: () => {
    const e = DLG004.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
