import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { FRM013 } from "../../rules/FRM-013";

/* The live examples for FRM-013, as on its rule page. */
const meta = {
  title: "Rules/Forms/FRM-013 No context change on focus",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={FRM013.examples} /> };

export const Example1: Story = {
  name: "Do: Focus shows a hint, a button opens the filters",
  render: () => {
    const e = FRM013.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Reaching the field opens the filters",
  render: () => {
    const e = FRM013.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: Tab passes through the clinics",
  render: () => {
    const e = FRM013.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: Tabbing to a clinic opens it",
  render: () => {
    const e = FRM013.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example5: Story = {
  name: "Do: A field nobody should visit is text",
  render: () => {
    const e = FRM013.examples[4];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example6: Story = {
  name: "Don't: A field forwards focus to the next one",
  render: () => {
    const e = FRM013.examples[5];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
