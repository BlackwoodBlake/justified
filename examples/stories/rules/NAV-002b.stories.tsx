import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { NAV002b } from "../../rules/NAV-002b";

/* The live examples for NAV-002b, as on its rule page. */
const meta = {
  title: "Rules/Navigation/NAV-002b Current page visible",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={NAV002b.examples} /> };

export const Example1: Story = {
  name: "Do: Weight, a bar and a filled icon",
  render: () => {
    const e = NAV002b.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Do: The mark survives the collapsed sidebar",
  render: () => {
    const e = NAV002b.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: Colour is the only difference",
  render: () => {
    const e = NAV002b.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: Current looks like hover",
  render: () => {
    const e = NAV002b.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
