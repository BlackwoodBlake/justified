import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleFrame, ExampleGrid } from "../../rules/frame";
import { STA005a } from "../../rules/STA-005a";

/* The live examples for STA-005a, as on its rule page. */
const meta = {
  title: "Rules/States/STA-005a Show it is sending",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = { render: () => <ExampleGrid examples={STA005a.examples} /> };

export const Example1: Story = {
  name: "Do: The button works until the reply",
  render: () => {
    const e = STA005a.examples[0];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example2: Story = {
  name: "Don't: Nothing changes after the press",
  render: () => {
    const e = STA005a.examples[1];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example3: Story = {
  name: "Do: A delete that cannot be withdrawn waits",
  render: () => {
    const e = STA005a.examples[2];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example4: Story = {
  name: "Don't: Escape closes it while it deletes",
  render: () => {
    const e = STA005a.examples[3];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example5: Story = {
  name: "Do: A card moved at once, put back with a word",
  render: () => {
    const e = STA005a.examples[4];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};

export const Example6: Story = {
  name: "Don't: The card snaps back with no word",
  render: () => {
    const e = STA005a.examples[5];
    return (
      <ExampleFrame kind={e.kind} title={e.title} caption={e.caption}>
        <e.Demo />
      </ExampleFrame>
    );
  },
};
