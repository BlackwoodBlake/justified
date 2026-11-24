import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM008 } from "../../rules/FRM-008";

/* The live examples for FRM-008, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-008 Accessible sign-in",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM008.examples} /> };

export const Example1: Story = {
  name: "Do: One field that takes the whole code",
  render: () => {
    const e = FRM008.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Six boxes that take one digit each",
  render: () => {
    const e = FRM008.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
