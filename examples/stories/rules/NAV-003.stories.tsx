import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { NAV003 } from "../../rules/NAV-003";

/* The live examples for NAV-003, as on its rule page. */
const meta = {
  title: "Rules/Navigation/NAV-003 Same menu order",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={NAV003.examples} /> };

export const Example1: Story = {
  name: "Do: One shared list, filtered not sorted",
  render: () => {
    const e = NAV003.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Each page builds its own list",
  render: () => {
    const e = NAV003.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: The current item jumps to the top",
  render: () => {
    const e = NAV003.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Do: An order the person set holds",
  render: () => {
    const e = NAV003.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
