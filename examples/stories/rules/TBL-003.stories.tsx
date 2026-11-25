import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { TBL003 } from "../../rules/TBL-003";

/* The live examples for TBL-003, as on its rule page. */
const meta = {
  title: "Rules/Tables/TBL-003 Row actions by keyboard",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={TBL003.examples} /> };

export const Example1: Story = {
  name: "Do: A link and buttons, with the row click as a shortcut",
  render: () => {
    const e = TBL003.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Do: Hidden actions show on focus",
  render: () => {
    const e = TBL003.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: Only a click on the row opens the ticket",
  render: () => {
    const e = TBL003.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: Actions that show only on hover",
  render: () => {
    const e = TBL003.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
