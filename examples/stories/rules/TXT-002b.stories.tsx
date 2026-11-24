import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { TXT002b } from "../../rules/TXT-002b";

/* The live examples for TXT-002b, as on its rule page. */
const meta = {
  title: "Rules/Text/TXT-002b Tooltips",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={TXT002b.examples} /> };

export const Example1: Story = {
  name: "Do: The deadline is on the card",
  render: () => {
    const e = TXT002b.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: The deadline only in a tooltip",
  render: () => {
    const e = TXT002b.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
