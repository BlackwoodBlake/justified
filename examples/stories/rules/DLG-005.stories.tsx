import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { DLG005 } from "../../rules/DLG-005";

/* The live examples for DLG-005, as on its rule page. */
const meta = {
  title: "Rules/Dialogs/DLG-005 Danger style",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={DLG005.examples} /> };

export const Example1: Story = {
  name: "Do: The destructive button is red",
  render: () => {
    const e = DLG005.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Drawn like any main button",
  render: () => {
    const e = DLG005.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: Cancel styled as the main button",
  render: () => {
    const e = DLG005.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
