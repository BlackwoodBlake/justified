import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { DLG001 } from "../../rules/DLG-001";

/* The live examples for DLG-001, as on its rule page. */
const meta = {
  title: "Rules/Dialogs/DLG-001 Escape cancels",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={DLG001.examples} /> };

export const Example1: Story = {
  name: "Do: Escape keeps the old name, as Cancel does",
  render: () => {
    const e = DLG001.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Do: Escape asks the same question as Cancel",
  render: () => {
    const e = DLG001.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: Escape closes when Cancel would ask",
  render: () => {
    const e = DLG001.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
