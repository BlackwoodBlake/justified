import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { ACT002a } from "../../rules/ACT-002a";

/* The live examples for ACT-002a, as on its rule page. */
const meta = {
  title: "Rules/Actions/ACT-002a One emphasised per group",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={ACT002a.examples} /> };

export const Example1: Story = {
  name: "Do: One filled button in the row",
  render: () => {
    const e = ACT002a.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Two filled buttons side by side",
  render: () => {
    const e = ACT002a.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
