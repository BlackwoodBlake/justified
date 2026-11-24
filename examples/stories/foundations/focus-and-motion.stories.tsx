import { Button } from "@blackwoodblake/justified-shadcn/button";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { themes } from "./tokens";

const meta = {
  title: "Foundations/Focus and motion",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Focus: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        A {themes.light["focus-ring-width"]} ring in the ring colour, {themes.light["focus-ring-offset"]} away from the
        element, shown whenever focus comes from the keyboard (WCAG 2.2, 2.4.7). It never disappears to look cleaner.
      </p>
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">How it looks</h2>
        <div className="flex gap-4">
          <span className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground ring-(length:--focus-ring-width) ring-ring ring-offset-[length:var(--focus-ring-offset)] ring-offset-background">
            Focused button
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">Try it</h2>
        <p className="text-sm text-muted-foreground">Click beside the buttons, then press Tab.</p>
        <div className="flex gap-3">
          <Button>Save changes</Button>
          <Button variant="outline">Preview</Button>
          <Button variant="ghost">Cancel</Button>
        </div>
      </div>
    </div>
  ),
};

const DURATIONS = ["fast", "normal", "slow"] as const;
const EASINGS = [
  ["standard", "Moving within the screen"],
  ["enter", "Appearing"],
  ["exit", "Leaving"],
] as const;

function MotionDemo() {
  const [moved, setMoved] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Button variant="outline" onClick={() => setMoved((m) => !m)} aria-pressed={moved}>
          {moved ? "Move back" : "Move"}
        </Button>
      </div>
      <ul className="flex flex-col gap-2">
        {DURATIONS.map((d) => (
          <li key={d} className="relative h-8 rounded-md bg-muted">
            <span
              aria-hidden="true"
              className="absolute top-1 left-1 size-6 rounded-sm bg-primary"
              style={{
                transform: moved ? "translateX(calc(min(30rem, 70vw)))" : "none",
                transition: `transform var(--motion-duration-${d}) var(--motion-ease-standard)`,
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export const Motion: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Motion explains a change; it never decorates. If the reader asks for reduced motion in their system settings,
        every duration drops to 1 ms and things change at once.
      </p>
      <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
        {DURATIONS.map((d) => (
          <div key={d} className="flex gap-3">
            <dt>
              <code className="font-mono">--motion-duration-{d}</code>
            </dt>
            <dd className="text-muted-foreground">{themes.light[`motion-duration-${d}`]}</dd>
          </div>
        ))}
        {EASINGS.map(([e, use]) => (
          <div key={e} className="flex gap-3">
            <dt>
              <code className="font-mono">--motion-ease-{e}</code>
            </dt>
            <dd className="text-muted-foreground">{use}</dd>
          </div>
        ))}
      </dl>
      <MotionDemo />
    </div>
  ),
};
