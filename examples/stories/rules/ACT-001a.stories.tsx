import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { ACT001a } from "../../rules/ACT-001a";

/* The live examples for ACT-001a, as on its rule page. */
const meta = {
  title: "Rules/Actions/ACT-001a Verb first",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={ACT001a.examples} /> };

export const Example1: Story = {
  name: "Do: The button names the booking",
  render: () => {
    const e = ACT001a.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Yes and No",
  render: () => {
    const e = ACT001a.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
