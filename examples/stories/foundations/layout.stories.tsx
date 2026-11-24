import type { Meta, StoryObj } from "@storybook/react-vite";

import { px, themes } from "./tokens";

/*
 * Layout. Justified has no grid component: layouts use Tailwind's grid and
 * flex classes with the layout tokens. These are defaults, like the
 * colours, and can be changed.
 */
const meta = {
  title: "Foundations/Layout",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const t = themes.light;
const BREAKPOINTS = ["sm", "md", "lg", "xl", "2xl"] as const;

export const Tokens: Story = {
  render: () => (
    <div className="mx-auto flex max-w-page flex-col gap-8 px-(--layout-margin) py-6">
      <p className="max-w-measure text-sm text-muted-foreground">
        The page margin and the gutter grow with the window, so a phone keeps its width for content. Content stops at a
        maximum width, and running text at a comfortable line length. Narrow the window to see the margin shrink.
      </p>
      <dl className="grid max-w-3xl gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
        {[
          ["--layout-margin", t["layout-margin"], "Space between the content and the window edge"],
          ["--layout-gutter", t["layout-gutter"], "Space between columns"],
          ["--layout-max-width", `${t["layout-max-width"]} (${px(t["layout-max-width"])})`, "Widest the content gets: max-w-page"],
          ["--layout-measure", t["layout-measure"], "Longest line of running text: max-w-measure"],
        ].map(([name, value, use]) => (
          <div key={name} className="flex flex-col">
            <dt>
              <code className="font-mono">{name}</code>
            </dt>
            <dd className="text-muted-foreground">
              {value}. {use}.
            </dd>
          </div>
        ))}
      </dl>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Breakpoints</h2>
        <p className="max-w-measure text-sm text-muted-foreground">
          The same as Tailwind's, so shadcn components and classes such as md:grid-cols-8 keep working.
        </p>
        <table className="w-full max-w-md border-collapse text-left text-sm">
          <caption className="sr-only">Breakpoints</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="py-2 pr-4 font-medium">Prefix</th>
              <th scope="col" className="py-2 pr-4 font-medium">From</th>
            </tr>
          </thead>
          <tbody>
            {BREAKPOINTS.map((b) => (
              <tr key={b} className="border-b border-border">
                <td className="py-2 pr-4">
                  <code className="font-mono">{b}:</code>
                </td>
                <td className="py-2 pr-4">
                  {t[`layout-breakpoint-${b}`]} ({px(t[`layout-breakpoint-${b}`])})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  ),
};

/** 4 columns on small screens, 8 from md and 12 from lg, inside the page margin and maximum width. */
export const Grid: Story = {
  render: () => (
    <div className="mx-auto flex max-w-page flex-col gap-6 px-(--layout-margin) py-6">
      <p className="max-w-measure text-sm text-muted-foreground">
        A starting point, not a law: 4 columns on small screens, 8 from md and 12 from lg. Resize the window or use
        Storybook's viewport menu.
      </p>
      <div aria-hidden="true" className="grid grid-cols-4 gap-(--layout-gutter) md:grid-cols-8 lg:grid-cols-12">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className={`h-16 rounded-sm bg-primary/15 ring-1 ring-primary/40 ${i >= 4 ? "hidden md:block" : ""} ${i >= 8 ? "md:hidden lg:block" : ""}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-(--layout-gutter) md:grid-cols-8 lg:grid-cols-12">
        <article className="col-span-4 rounded-lg border border-border p-4 md:col-span-8 lg:col-span-8">
          <h3 className="font-semibold">Main content</h3>
          <p className="max-w-measure text-sm text-muted-foreground">
            Spans every column on small screens and 8 of 12 on large ones. It comes first in the code, so it is read first
            at every width.
          </p>
        </article>
        <aside className="col-span-4 rounded-lg border border-border p-4 md:col-span-8 lg:col-span-4">
          <h3 className="font-semibold">Side panel</h3>
          <p className="text-sm text-muted-foreground">Moves below the main content on small screens, in the same order.</p>
        </aside>
      </div>
    </div>
  ),
};
