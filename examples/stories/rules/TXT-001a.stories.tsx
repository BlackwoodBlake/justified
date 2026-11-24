import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { TXT001a } from "../../rules/TXT-001a";

/* The live examples for TXT-001a, as on its rule page. */
const meta = {
  title: "Rules/Text/TXT-001a Error messages",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={TXT001a.examples} /> };

export const Example1: Story = {
  name: "Do: The file, the fault and the fix",
  render: () => {
    const e = TXT001a.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: A bare verdict",
  render: () => {
    const e = TXT001a.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
