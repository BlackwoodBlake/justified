import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { VIS001 } from "../../rules/VIS-001";

/* The live examples for VIS-001, as on its rule page. */
const meta = {
  title: "Rules/Colour and motion/VIS-001 Text contrast",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={VIS001.examples} /> };

export const Example1: Story = {
  name: "Do: Secondary text keeps its colour",
  render: () => {
    const e = VIS001.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Fading the date with opacity",
  render: () => {
    const e = VIS001.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: A scrim under a title on a photo",
  render: () => {
    const e = VIS001.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: White title, no scrim, one spot checked",
  render: () => {
    const e = VIS001.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
