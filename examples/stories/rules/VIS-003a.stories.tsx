import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { VIS003a } from "../../rules/VIS-003a";

/* The live examples for VIS-003a, as on its rule page. */
const meta = {
  title: "Rules/Colour and motion/VIS-003a Not by colour alone",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={VIS003a.examples} /> };

export const Example1: Story = {
  name: "Do: Every status has a word",
  render: () => {
    const e = VIS003a.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: A coloured dot for a status",
  render: () => {
    const e = VIS003a.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: The chosen plan is marked, not only tinted",
  render: () => {
    const e = VIS003a.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: The chosen plan is only tinted",
  render: () => {
    const e = VIS003a.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
