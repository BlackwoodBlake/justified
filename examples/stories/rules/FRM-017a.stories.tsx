import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM017a } from "../../rules/FRM-017a";

/* The live examples for FRM-017a, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-017a Separators accepted",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM017a.examples} /> };

export const Example1: Story = {
  name: "Do: Cleaned before it is checked",
  render: () => {
    const e = FRM017a.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Do: A field that groups as people type keeps the caret",
  render: () => {
    const e = FRM017a.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Don't: The raw value is checked",
  render: () => {
    const e = FRM017a.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: A length cap that cuts the paste",
  render: () => {
    const e = FRM017a.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example5: Story = {
  name: "Don't: Keys the field refuses",
  render: () => {
    const e = FRM017a.examples[4];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
