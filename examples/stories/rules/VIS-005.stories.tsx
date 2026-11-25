import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { VIS005 } from "../../rules/VIS-005";

/* The live examples for VIS-005, as on its rule page. */
const meta = {
  title: "Rules/Colour and motion/VIS-005 Pause moving content",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={VIS005.examples} /> };

export const Example1: Story = {
  name: "Do: A visible button pauses the quotes",
  render: () => {
    const e = VIS005.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Quotes rotate on a timer with nothing to press",
  render: () => {
    const e = VIS005.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: A button holds the logo strip still",
  render: () => {
    const e = VIS005.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: A logo strip that never stops",
  render: () => {
    const e = VIS005.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
