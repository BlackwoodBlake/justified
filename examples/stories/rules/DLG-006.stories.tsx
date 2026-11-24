import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { DLG006 } from "../../rules/DLG-006";

/* The live examples for DLG-006, as on its rule page. */
const meta = {
  title: "Rules/Dialogs/DLG-006 Focus in and back",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={DLG006.examples} /> };

export const Example1: Story = {
  name: "Do: Focus goes into the dialog and back to its button",
  render: () => {
    const e = DLG006.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Focus stays behind the dialog and is lost on closing",
  render: () => {
    const e = DLG006.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: The button is gone, so focus goes to the next claim",
  render: () => {
    const e = DLG006.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: The button is gone and focus is lost",
  render: () => {
    const e = DLG006.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
