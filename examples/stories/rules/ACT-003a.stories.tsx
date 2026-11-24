import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { ACT003a } from "../../rules/ACT-003a";

/* The live examples for ACT-003a, as on its rule page. */
const meta = {
  title: "Rules/Actions/ACT-003a Confirm button last",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={ACT003a.examples} /> };

export const Example1: Story = {
  name: "Do: Buttons packed at the end",
  render: () => {
    const e = ACT003a.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Do: Buttons fill the width",
  render: () => {
    const e = ACT003a.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: Confirming button first",
  render: () => {
    const e = ACT003a.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
