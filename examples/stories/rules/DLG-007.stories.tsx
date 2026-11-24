import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { DLG007 } from "../../rules/DLG-007";

/* The live examples for DLG-007, as on its rule page. */
const meta = {
  title: "Rules/Dialogs/DLG-007 Focus stays inside",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={DLG007.examples} /> };

export const Example1: Story = {
  name: "Do: Tab goes round inside the dialog",
  render: () => {
    const e = DLG007.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Tab walks on into the page behind",
  render: () => {
    const e = DLG007.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
