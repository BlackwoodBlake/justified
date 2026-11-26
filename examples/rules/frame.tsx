import type { ComponentType, ReactNode } from "react";

/*
 * The frame around one live example on a rule page and in Storybook.
 *
 * "Do" and "Don't" are told apart by a word and an icon, never by colour
 * alone. The stage is a small, self-contained scene. Only a modal dialog
 * opens over the page, and it closes with Escape like any other.
 *
 * The frame header is a heading (h3 under the page's "Examples"), so a
 * person who moves by heading hears "Do" or "Don't" before the example.
 * Headings inside an example are h4.
 */

export type Kind = "do" | "dont";

export type RuleExample = {
  kind: Kind;
  /** One short line naming what the example shows. */
  title: string;
  /** What to try, and what to notice. */
  caption: ReactNode;
  Demo: ComponentType;
  /**
   * Only on a Don't whose rule has a lint rule, when that lint rule does not
   * catch it: one short sentence saying why. Either the real code cannot be
   * shown here (it would change the page it is shown on), or the code is
   * written out and the lint rule leaves that case alone on purpose; such a
   * reason starts with "Lint gap:". Every other such Don't must be caught
   * (packages/eslint/test/examples.test.js).
   */
  notLinted?: string;
};

export type RuleExamples = {
  id: string;
  examples: RuleExample[];
};

function DoIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  );
}

function DontIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export function ExampleFrame({ kind, title, caption, children }: { kind: Kind; title: string; caption: ReactNode; children: ReactNode }) {
  const isDo = kind === "do";
  return (
    <figure data-kind={kind} className="m-0 flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
      <h3 className="m-0 flex items-center gap-2 border-b border-border px-4 py-2 text-sm font-semibold">
        <span className={`flex items-center gap-2 ${isDo ? "text-success" : "text-destructive"}`}>
          {isDo ? <DoIcon /> : <DontIcon />}
          {isDo ? "Do:" : "Don't:"}
        </span>{" "}
        <span className="font-normal text-muted-foreground">{title}</span>
      </h3>
      <div className="relative flex flex-1 items-center justify-center bg-muted/40 p-4 sm:p-6">{children}</div>
      <figcaption className="border-t border-border px-4 py-3 text-sm text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}

/** Every example of one rule, side by side where there is room. */
export function ExampleGrid({ examples }: { examples: RuleExample[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {examples.map((e) => (
        <ExampleFrame key={e.title} kind={e.kind} title={e.title} caption={e.caption}>
          <e.Demo />
        </ExampleFrame>
      ))}
    </div>
  );
}
