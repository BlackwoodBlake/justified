import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { TXT002a } from "../../rules/TXT-002a";

/* The live examples for TXT-002a, as on its rule page. */
const meta = {
  title: "Rules/Text/TXT-002a Hover content",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={TXT002a.examples} /> };

export const Example1: Story = {
  name: "Do: The card can be reached and closed with Escape",
  render: () => {
    const e = TXT002a.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: A gap that closes the card on the way",
  render: () => {
    const e = TXT002a.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
