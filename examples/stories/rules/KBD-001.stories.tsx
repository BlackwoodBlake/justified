import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { KBD001 } from "../../rules/KBD-001";

/* The live examples for KBD-001, as on its rule page. */
const meta = {
  title: "Rules/Keyboard/KBD-001 Keyboard and focus",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={KBD001.examples} /> };

export const Example1: Story = {
  name: "Do: Show more trips is a real button",
  render: () => {
    const e = KBD001.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Show more trips is a div that only takes clicks",
  render: () => {
    const e = KBD001.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
