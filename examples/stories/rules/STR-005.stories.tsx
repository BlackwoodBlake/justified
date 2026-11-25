import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { STR005 } from "../../rules/STR-005";

/* The live examples for STR-005, as on its rule page. */
const meta = {
  title: "Rules/Page structure/STR-005 Text for images",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={STR005.examples} /> };

export const Example1: Story = {
  name: "Do: The icon that carries the status has a name",
  render: () => {
    const e = STR005.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: The only sign of the status is hidden",
  render: () => {
    const e = STR005.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: Avatars named, or empty, by what is beside them",
  render: () => {
    const e = STR005.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: A file name and a kind of picture as alternatives",
  render: () => {
    const e = STR005.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
