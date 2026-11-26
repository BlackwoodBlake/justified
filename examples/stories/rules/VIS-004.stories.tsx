import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { VIS004 } from "../../rules/VIS-004";

/* The live examples for VIS-004, as on its rule page. */
const meta = {
  title: "Rules/Colour and motion/VIS-004 Non-text contrast",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={VIS004.examples} /> };

export const Example1: Story = {
  name: "Do: Fields and switches you can find",
  render: () => {
    const e = VIS004.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Edges and tracks that fade away",
  render: () => {
    const e = VIS004.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: A meter with a gap between segments",
  render: () => {
    const e = VIS004.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: Pale segments that touch",
  render: () => {
    const e = VIS004.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example5: Story = {
  name: "Do: An edge that stays while hovered and pressed",
  render: () => {
    const e = VIS004.examples[4];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example6: Story = {
  name: "Don't: A hover that takes the edge away",
  render: () => {
    const e = VIS004.examples[5];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
