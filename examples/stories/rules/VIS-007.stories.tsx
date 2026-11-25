import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { VIS007 } from "../../rules/VIS-007";

/* The live examples for VIS-007, as on its rule page. */
const meta = {
  title: "Rules/Colour and motion/VIS-007 Not by motion alone",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={VIS007.examples} /> };

export const Example1: Story = {
  name: "Do: A wrong password shakes and the error text stays",
  render: () => {
    const e = VIS007.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: A shake with no message",
  render: () => {
    const e = VIS007.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: The cart bounces, the count and a message say why",
  render: () => {
    const e = VIS007.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: A bounce is the only sign that an item was added",
  render: () => {
    const e = VIS007.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
