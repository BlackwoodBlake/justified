import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM012b } from "../../rules/FRM-012b";

/* The live examples for FRM-012b, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-012b Choices are not actions",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM012b.examples} /> };

export const Example1: Story = {
  name: "Do: A choice is recorded, a button acts",
  render: () => {
    const e = FRM012b.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: A radio group opens checkout, even with a notice",
  render: () => {
    const e = FRM012b.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: The terms box records, Create account sends",
  render: () => {
    const e = FRM012b.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: A checkbox sends the form",
  render: () => {
    const e = FRM012b.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example5: Story = {
  name: "Do: A button opens the card dialog",
  render: () => {
    const e = FRM012b.examples[4];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example6: Story = {
  name: "Don't: A switch opens a dialog, even with a notice",
  render: () => {
    const e = FRM012b.examples[5];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example7: Story = {
  name: "Do: A checkbox in a form that is saved",
  render: () => {
    const e = FRM012b.examples[6];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example8: Story = {
  name: "Don't: A switch that waits for Save settings",
  render: () => {
    const e = FRM012b.examples[7];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
