import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { ACT009a } from "../../rules/ACT-009a";

/* The live examples for ACT-009a, as on its rule page. */
const meta = {
  title: "Rules/Actions/ACT-009a Links to go somewhere",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={ACT009a.examples} /> };

export const Example1: Story = {
  name: "Do: Going somewhere is a link, saving is a button",
  render: () => {
    const e = ACT009a.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Buttons that change the address by script",
  render: () => {
    const e = ACT009a.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: Page numbers are links",
  render: () => {
    const e = ACT009a.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: Page numbers that call router.push",
  render: () => {
    const e = ACT009a.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
