import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { LAY003a } from "../../rules/LAY-003a";

/* The live examples for LAY-003a, as on its rule page. */
const meta = {
  title: "Rules/Layout/LAY-003a Resize text to 200%",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={LAY003a.examples} /> };

export const Example1: Story = {
  name: "Do: Cards that grow with their text",
  render: () => {
    const e = LAY003a.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: A fixed height that clips the text",
  render: () => {
    const e = LAY003a.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: A banner that grows with its text",
  render: () => {
    const e = LAY003a.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: A banner with a fixed height",
  render: () => {
    const e = LAY003a.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example5: Story = {
  name: "Do: The viewport setting leaves zoom alone",
  render: () => {
    const e = LAY003a.examples[4];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example6: Story = {
  name: "Don't: A viewport setting that blocks zoom",
  render: () => {
    const e = LAY003a.examples[5];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
