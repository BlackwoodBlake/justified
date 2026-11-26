import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { KBD003a } from "../../rules/KBD-003a";

/* The live examples for KBD-003a, as on its rule page. */
const meta = {
  title: "Rules/Keyboard/KBD-003a Findable shortcuts",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={KBD003a.examples} /> };

export const Example1: Story = {
  name: "Do: The menu item shows its keys",
  render: () => {
    const e = KBD003a.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Do: A tooltip with the name and keys",
  render: () => {
    const e = KBD003a.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: A shortcut that is shown nowhere",
  render: () => {
    const e = KBD003a.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: The keys written into the button's name",
  render: () => {
    const e = KBD003a.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
