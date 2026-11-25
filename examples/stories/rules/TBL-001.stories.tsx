import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { TBL001 } from "../../rules/TBL-001";

/* The live examples for TBL-001, as on its rule page. */
const meta = {
  title: "Rules/Tables/TBL-001 Table headers in code",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={TBL001.examples} /> };

export const Example1: Story = {
  name: "Do: A real table with headers",
  render: () => {
    const e = TBL001.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: A grid of divs that looks like a table",
  render: () => {
    const e = TBL001.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: A checkbox column that has a heading",
  render: () => {
    const e = TBL001.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: An empty heading over the checkboxes",
  render: () => {
    const e = TBL001.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
