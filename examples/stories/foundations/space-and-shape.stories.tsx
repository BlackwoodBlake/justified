import type { Meta, StoryObj } from "@storybook/react-vite";

import { px, themes } from "./tokens";

const meta = {
  title: "Foundations/Space and shape",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const STEPS = [1, 2, 3, 4, 6, 8, 12, 16];

export const Space: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        One unit of {px(themes.light["space-unit"])}. Every gap and padding is a multiple of it: <code className="font-mono">p-4</code>{" "}
        is four units.
      </p>
      <ul className="flex flex-col gap-2">
        {STEPS.map((n) => (
          <li key={n} className="flex items-center gap-4 text-sm">
            <code className="w-12 font-mono">{n}</code>
            <span className="w-14 text-muted-foreground">{n * 4} px</span>
            <span aria-hidden="true" className="h-4 rounded-sm bg-primary" style={{ width: `calc(var(--space-unit) * ${n})` }} />
          </li>
        ))}
      </ul>
    </div>
  ),
};

export const Radius: Story = {
  render: () => (
    <ul className="flex flex-wrap gap-6 text-sm">
      {[
        ["rounded-sm", "Small: badges"],
        ["rounded-md", "Medium: buttons and fields"],
        ["rounded-lg", "Large: cards and dialogs"],
        ["rounded-xl", "Extra large: large panels"],
      ].map(([cls, label]) => (
        <li key={cls} className="flex flex-col items-start gap-2">
          <span aria-hidden="true" className={`size-20 border-2 border-input bg-muted ${cls}`} />
          <code className="font-mono">{cls}</code>
          <span className="text-muted-foreground">{label}</span>
        </li>
      ))}
    </ul>
  ),
};

export const TargetSize: Story = {
  name: "Target size",
  render: () => (
    <div className="flex max-w-3xl flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Anything you can click or tap is at least {px(themes.light["target-min"])} square, the WCAG 2.2 minimum (2.5.8). Prefer{" "}
        {px(themes.light["target-comfortable"])} for touch.
      </p>
      <ul className="flex items-end gap-8 text-sm">
        <li className="flex flex-col items-start gap-2">
          <span aria-hidden="true" className="rounded-md border-2 border-input bg-muted" style={{ width: "var(--target-min)", height: "var(--target-min)" }} />
          <code className="font-mono">--target-min</code>
        </li>
        <li className="flex flex-col items-start gap-2">
          <span
            aria-hidden="true"
            className="rounded-md border-2 border-input bg-muted"
            style={{ width: "var(--target-comfortable)", height: "var(--target-comfortable)" }}
          />
          <code className="font-mono">--target-comfortable</code>
        </li>
      </ul>
    </div>
  ),
};
