import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM010 } from "../../rules/FRM-010";

/* The live examples for FRM-010, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-010 Name in code",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM010.examples} /> };

export const Example1: Story = {
  name: "Do: Every control is named by the words beside it",
  render: () => {
    const e = FRM010.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: The words are on screen, the names are not",
  render: () => {
    const e = FRM010.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
