import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { TXT003 } from "../../rules/TXT-003";

/* The live examples for TXT-003, as on its rule page. */
const meta = {
  title: "Rules/Text/TXT-003 Clear link text",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={TXT003.examples} /> };

export const Example1: Story = {
  name: "Do: Each link names its report",
  render: () => {
    const e = TXT003.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: The same word on every link",
  render: () => {
    const e = TXT003.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
