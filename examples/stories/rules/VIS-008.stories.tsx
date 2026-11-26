import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { VIS008 } from "../../rules/VIS-008";

/* The live examples for VIS-008, as on its rule page. */
const meta = {
  title: "Rules/Colour and motion/VIS-008 Hover and press looks",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={VIS008.examples} /> };

export const Example1: Story = {
  name: "Do: A card that answers the pointer and the press",
  render: () => {
    const e = VIS008.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: A card with only a pointing cursor",
  render: () => {
    const e = VIS008.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: Icon buttons that change, and one that stays still",
  render: () => {
    const e = VIS008.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: Icon buttons with no change, and an off one that lights up",
  render: () => {
    const e = VIS008.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
