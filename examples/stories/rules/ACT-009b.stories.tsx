import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { ACT009b } from "../../rules/ACT-009b";

/* The live examples for ACT-009b, as on its rule page. */
const meta = {
  title: "Rules/Actions/ACT-009b Buttons to act",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={ACT009b.examples} /> };

export const Example1: Story = {
  name: "Do: Acting in place is a button that looks like a link",
  render: () => {
    const e = ACT009b.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Links to # whose click is cancelled",
  render: () => {
    const e = ACT009b.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: A jump on the same page is a link",
  render: () => {
    const e = ACT009b.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: href=\"#\" when the script does not cancel",
  render: () => {
    const e = ACT009b.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
