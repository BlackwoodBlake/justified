import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { VIS006 } from "../../rules/VIS-006";

/* The live examples for VIS-006, as on its rule page. */
const meta = {
  title: "Rules/Colour and motion/VIS-006 Reduced motion",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={VIS006.examples} /> };

export const Example1: Story = {
  name: "Do: The panel fades in place when motion is reduced",
  render: () => {
    const e = VIS006.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: A panel that slides and zooms whatever the setting",
  render: () => {
    const e = VIS006.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: A rolling number shows its end state at once",
  render: () => {
    const e = VIS006.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: A card that waits for an animation that is off",
  render: () => {
    const e = VIS006.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
