import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { DLG003 } from "../../rules/DLG-003";

/* The live examples for DLG-003, as on its rule page. */
const meta = {
  title: "Rules/Dialogs/DLG-003 Named destructive button",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={DLG003.examples} /> };

export const Example1: Story = {
  name: "Do: The button says what will be lost",
  render: () => {
    const e = DLG003.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: OK instead of the action",
  render: () => {
    const e = DLG003.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: No Cancel, only a close icon",
  render: () => {
    const e = DLG003.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
