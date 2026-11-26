import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { KBD003b } from "../../rules/KBD-003b";

/* The live examples for KBD-003b, as on its rule page. */
const meta = {
  title: "Rules/Keyboard/KBD-003b Modifier by default",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={KBD003b.examples} /> };

export const Example1: Story = {
  name: "Do: A modifier key from the start",
  render: () => {
    const e = KBD003b.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Do: Single keys only after the person turns them on",
  render: () => {
    const e = KBD003b.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: Single keys on from the start, with a switch",
  render: () => {
    const e = KBD003b.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Do: Shift+N with a switch to turn it off",
  render: () => {
    const e = KBD003b.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example5: Story = {
  name: "Don't: Only Cmd is bound",
  render: () => {
    const e = KBD003b.examples[4];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example6: Story = {
  name: "Don't: The page takes Ctrl+F",
  render: () => {
    const e = KBD003b.examples[5];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
