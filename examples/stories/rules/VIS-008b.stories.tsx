import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { VIS008b } from "../../rules/VIS-008b";

/* The live examples for VIS-008b, as on its rule page. */
const meta = {
  title: "Rules/Colour and motion/VIS-008b Selected look kept",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={VIS008b.examples} /> };

export const Example1: Story = {
  name: "Do: A toggle that stays on under the pointer",
  render: () => {
    const e = VIS008b.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: A hover that wipes out the selection",
  render: () => {
    const e = VIS008b.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: A chosen plan that keeps its marks under the pointer",
  render: () => {
    const e = VIS008b.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: A chosen plan drawn with the focus ring",
  render: () => {
    const e = VIS008b.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
