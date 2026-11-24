import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { STA004 } from "../../rules/STA-004";

/* The live examples for STA-004, as on its rule page. */
const meta = {
  title: "Rules/States/STA-004 Time limits",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={STA004.examples} /> };

export const Example1: Story = {
  name: "Do: A warning with one press to stay",
  render: () => {
    const e = STA004.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: A countdown with no way to get more time",
  render: () => {
    const e = STA004.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
