import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { NAV002a } from "../../rules/NAV-002a";

/* The live examples for NAV-002a, as on its rule page. */
const meta = {
  title: "Rules/Navigation/NAV-002a Current page in code",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={NAV002a.examples} /> };

export const Example1: Story = {
  name: "Do: The highlighted item says it is current",
  render: () => {
    const e = NAV002a.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Only a highlight, nothing in the code",
  render: () => {
    const e = NAV002a.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: A page inside a section marks the section",
  render: () => {
    const e = NAV002a.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: The mark sits on the list item",
  render: () => {
    const e = NAV002a.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
