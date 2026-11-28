import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { NAV004 } from "../../rules/NAV-004";

/* The live examples for NAV-004, as on its rule page. */
const meta = {
  title: "Rules/Navigation/NAV-004 Skip link",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={NAV004.examples} /> };

export const Example1: Story = {
  name: "Do: A visible skip link goes to the content",
  render: () => {
    const e = NAV004.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: No skip link",
  render: () => {
    const e = NAV004.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: A skip link that is never shown",
  render: () => {
    const e = NAV004.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
