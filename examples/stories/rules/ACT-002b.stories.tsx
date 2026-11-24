import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { ACT002b } from "../../rules/ACT-002b";

/* The live examples for ACT-002b, as on its rule page. */
const meta = {
  title: "Rules/Actions/ACT-002b One primary per page",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={ACT002b.examples} /> };

export const Example1: Story = {
  name: "Do: One filled button for the page's main task",
  render: () => {
    const e = ACT002b.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: A filled button in every section",
  render: () => {
    const e = ACT002b.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
