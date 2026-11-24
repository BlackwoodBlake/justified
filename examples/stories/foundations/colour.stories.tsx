import type { Meta, StoryObj } from "@storybook/react-vite";

import { results, themes } from "./tokens";

/*
 * Colour. The swatches use the live CSS variables, so they follow the theme
 * in the toolbar; the hex values and ratios come from tokens.css.
 */
const meta = {
  title: "Foundations/Colour",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const GROUPS: { name: string; note: string; tokens: string[] }[] = [
  {
    name: "Surfaces and text",
    note: "Neutral greys. Text colours are paired with the surface they sit on.",
    tokens: ["background", "foreground", "card", "card-foreground", "popover", "popover-foreground", "muted", "muted-foreground", "accent", "accent-foreground", "border"],
  },
  {
    name: "Actions",
    note: "One blue for primary actions, links and the focus ring. Input borders are dark enough to find the field.",
    tokens: ["primary", "primary-foreground", "secondary", "secondary-foreground", "input", "ring"],
  },
  {
    name: "Status",
    note: "Each works as text on the page and as a fill behind its foreground. Pair it with an icon or a word; colour alone is never the signal.",
    tokens: ["destructive", "destructive-foreground", "success", "success-foreground", "warning", "warning-foreground", "info", "info-foreground"],
  },
];

function Swatch({ token }: { token: string }) {
  return (
    <li className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="size-10 shrink-0 rounded-md border border-border"
        style={{ background: `var(--${token})` }}
      />
      <span className="flex flex-col">
        <code className="font-mono text-sm">--{token}</code>
        <span className="text-xs text-muted-foreground">
          Light {themes.light[token]} · Dark {themes.dark[token]}
        </span>
      </span>
    </li>
  );
}

export const Tokens: Story = {
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <p className="text-sm text-muted-foreground">
        The default theme is neutral, so a brand can replace the colours without fighting them. Switch between light and dark
        in the toolbar.
      </p>
      {GROUPS.map((g) => (
        <section key={g.name} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{g.name}</h2>
          <p className="text-sm text-muted-foreground">{g.note}</p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.tokens.map((t) => (
              <Swatch key={t} token={t} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  ),
};

/** Every promised pair, measured from tokens.css by the same code as `npm test`. */
export const Contrast: Story = {
  render: () => {
    const light = results.filter((r) => r.theme === "light");
    const dark = results.filter((r) => r.theme === "dark");
    return (
      <div className="flex max-w-5xl flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Text needs 4.5:1 (WCAG 2.2, 1.4.3). Input borders and the focus ring need 3:1 against the page (1.4.11). The sample
          follows the theme in the toolbar.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Contrast of every colour pair in both themes</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-2 pr-4 font-medium">Sample</th>
                <th scope="col" className="py-2 pr-4 font-medium">Pair</th>
                <th scope="col" className="py-2 pr-4 font-medium">Used for</th>
                <th scope="col" className="py-2 pr-4 font-medium">Needs</th>
                <th scope="col" className="py-2 pr-4 font-medium">Light</th>
                <th scope="col" className="py-2 font-medium">Dark</th>
              </tr>
            </thead>
            <tbody>
              {light.map((l, i) => {
                const d = dark[i];
                const text = l.min > 3;
                return (
                  <tr key={`${l.fg}-${l.bg}`} className="border-b border-border">
                    <td className="py-2 pr-4">
                      {text ? (
                        <span
                          className="inline-flex h-8 w-14 items-center justify-center rounded-md border border-border font-semibold"
                          style={{ color: `var(--${l.fg})`, background: `var(--${l.bg})` }}
                        >
                          Aa
                        </span>
                      ) : (
                        <span
                          aria-hidden="true"
                          className="inline-flex h-8 w-14 items-center justify-center rounded-md"
                          style={{ background: `var(--${l.bg})`, boxShadow: `inset 0 0 0 2px var(--${l.fg})` }}
                        />
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      <code className="font-mono text-xs">--{l.fg}</code> on <code className="font-mono text-xs">--{l.bg}</code>
                    </td>
                    <td className="py-2 pr-4">{l.use}</td>
                    <td className="py-2 pr-4">{l.min}:1</td>
                    <td className="py-2 pr-4">
                      {l.ratio.toFixed(2)}:1 {l.pass ? "Pass" : "Fail"}
                    </td>
                    <td className="py-2">
                      {d.ratio.toFixed(2)}:1 {d.pass ? "Pass" : "Fail"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
};
