import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { ACT006 } from "../../rules/ACT-006";

/* The live examples for ACT-006, as on its rule page. */
const meta = {
  title: "Rules/Actions/ACT-006 Target size",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={ACT006.examples} /> };

export const Example1: Story = {
  name: "Do: Two full-size buttons beside the field",
  render: () => {
    const e = ACT006.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Stacked arrows, 24 by 10",
  render: () => {
    const e = ACT006.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
