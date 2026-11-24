import type { Meta, StoryObj } from "@storybook/react-vite";

import { px, themes } from "./tokens";

const meta = {
  title: "Foundations/Typography",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SIZES = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"] as const;
const CLASS: Record<(typeof SIZES)[number], string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
};

export const Scale: Story = {
  render: () => (
    <div className="flex max-w-4xl flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        System fonts: nothing to download, and text appears at once. Sizes are in rem, so they grow with the reader's browser
        setting. Body text is base; xs is for short labels only.
      </p>
      <dl className="flex flex-col gap-5">
        {SIZES.map((s) => (
          <div key={s} className="grid gap-1 border-b border-border pb-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
            <dt className="flex flex-col text-sm">
              <code className="font-mono">{CLASS[s]}</code>
              <span className="text-xs text-muted-foreground">
                {px(themes.light[`font-size-${s}`])} / {px(themes.light[`line-height-${s}`])}
              </span>
            </dt>
            <dd className={CLASS[s]}>Every rule is tried like a case.</dd>
          </div>
        ))}
      </dl>
    </div>
  ),
};

export const Weights: Story = {
  render: () => (
    <ul className="flex flex-col gap-3 text-lg">
      <li className="font-normal">Normal 400: body text</li>
      <li className="font-medium">Medium 500: buttons and labels</li>
      <li className="font-semibold">Semibold 600: headings</li>
    </ul>
  ),
};

export const Families: Story = {
  render: () => (
    <dl className="flex max-w-3xl flex-col gap-4">
      <div>
        <dt className="font-sans text-lg">Sans: the interface and body text</dt>
        <dd className="text-xs text-muted-foreground">
          <code className="font-mono">{themes.light["font-family-sans"]}</code>
        </dd>
      </div>
      <div>
        <dt className="font-mono text-lg">Mono: code and token names</dt>
        <dd className="text-xs text-muted-foreground">
          <code className="font-mono">{themes.light["font-family-mono"]}</code>
        </dd>
      </div>
    </dl>
  ),
};
