import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { ACT009 } from "../../rules/ACT-009";

/* The live examples for ACT-009, as on its rule page. */
const meta = {
  title: "Rules/Actions/ACT-009 Controls have a role",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={ACT009.examples} /> };

export const Example1: Story = {
  name: "Do: The title is a link, the actions are buttons",
  render: () => {
    const e = ACT009.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: The whole card has the click handler",
  render: () => {
    const e = ACT009.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: A link that looks like a link is one",
  render: () => {
    const e = ACT009.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: A link-looking button that goes by script",
  render: () => {
    const e = ACT009.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example5: Story = {
  name: "Don't: Click handlers on an anchor, a span and an icon",
  render: () => {
    const e = ACT009.examples[4];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
