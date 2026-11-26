import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { VIS008a } from "../../rules/VIS-008a";

/* The live examples for VIS-008a, as on its rule page. */
const meta = {
  title: "Rules/Colour and motion/VIS-008a State in code",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={VIS008a.examples} /> };

export const Example1: Story = {
  name: "Do: Toggles that carry their state",
  render: () => {
    const e = VIS008a.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Drawn as on, silent in code",
  render: () => {
    const e = VIS008a.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: Delivery cards that are checked in code",
  render: () => {
    const e = VIS008a.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: Delivery cards that only look chosen",
  render: () => {
    const e = VIS008a.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
