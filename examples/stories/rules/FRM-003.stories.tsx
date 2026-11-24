import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM003 } from "../../rules/FRM-003";

/* The live examples for FRM-003, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-003 Cancel in form dialogs",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM003.examples} /> };

export const Example1: Story = {
  name: "Do: Cancel works while a field shows an error",
  render: () => {
    const e = FRM003.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Cancel greyed out until the form is valid",
  render: () => {
    const e = FRM003.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
