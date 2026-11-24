import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { ACT004 } from "../../rules/ACT-004";

/* The live examples for ACT-004, as on its rule page. */
const meta = {
  title: "Rules/Actions/ACT-004 Submit stays enabled",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={ACT004.examples} /> };

export const Example1: Story = {
  name: "Do: The button stays on, so a press can find the problem",
  render: () => {
    const e = ACT004.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: The button is off until every field is filled",
  render: () => {
    const e = ACT004.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
