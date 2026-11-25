import { Button } from "@blackwoodblake/justified-shadcn/button";

import { Drawn, PlanPicker, Readouts, Themes } from "./colour-demo";
import type { RuleExamples } from "./frame";

/*
 * VIS-002: give every colour that marks something a role and use it only for it.
 *
 * Four scenes. A plant nursery's order, where each text token sits on its own
 * fill (Do), against three drawings of a foreground on someone else's fill
 * (Don't, SVG so no real low-contrast text is on the page). And three plan
 * cards: the chosen one shown with the accent fill, a check and the word (Do),
 * against the focus ring's colours (Don't): before anyone touches it the
 * chosen card already looks focused.
 */

function OrderDo() {
  return (
    <Themes>
      {() => (
        <>
          <div className="grid gap-3 rounded-lg border border-border bg-card p-3 text-sm text-card-foreground">
            <h4 className="m-0 text-sm font-semibold">Order 2291</h4>
            <p data-measure="failed" className="m-0 font-medium text-destructive">
              Payment failed
            </p>
            <p data-measure="strip" className="m-0 rounded-md bg-muted px-3 py-2 text-muted-foreground">
              3 plants, delivery on Friday
            </p>
            <div>
              <Button data-measure="retry" type="button">
                Retry payment
              </Button>
            </div>
          </div>
          <Readouts
            rows={[
              { target: "failed", label: "text-destructive on the card", need: 4.5 },
              { target: "strip", label: "text-muted-foreground on bg-muted", need: 4.5 },
              { target: "retry", label: "text-primary-foreground on bg-primary", need: 4.5 },
            ]}
          />
        </>
      )}
    </Themes>
  );
}

const PAIRS = [
  {
    key: "a",
    fill: "bg-muted",
    ink: "fill-primary-foreground",
    label: "text-primary-foreground on bg-muted",
    words: "Ships in 2 days",
  },
  {
    key: "b",
    fill: "bg-primary",
    ink: "fill-muted-foreground",
    label: "text-muted-foreground on bg-primary",
    words: "3 plants in your basket",
  },
  {
    key: "c",
    fill: "bg-destructive",
    ink: "fill-accent-foreground",
    label: "text-accent-foreground on bg-destructive",
    words: "Payment failed",
  },
] as const;

function WrongFillDont() {
  return (
    <Themes>
      {() => (
        <>
          <Drawn className="grid gap-2">
            {PAIRS.map((p) => (
              <svg
                key={p.key}
                viewBox="0 0 240 34"
                role="presentation"
                focusable="false"
                className={`block h-auto w-full rounded-md ${p.fill}`}
              >
                <text data-measure={p.key} x="12" y="22" fontSize="14" fontWeight="500" className={p.ink}>
                  {p.words}
                </text>
              </svg>
            ))}
          </Drawn>
          <Readouts rows={PAIRS.map((p) => ({ target: p.key, label: p.label, need: 4.5 }))} />
        </>
      )}
    </Themes>
  );
}

export const VIS002: RuleExamples = {
  id: "VIS-002",
  examples: [
    {
      kind: "do",
      title: "Each text colour on its own fill",
      caption: (
        <>
          <code>text-destructive</code> on the card, <code>text-muted-foreground</code> on <code>bg-muted</code> and{" "}
          <code>text-primary-foreground</code> on <code>bg-primary</code> are the pairs Justified tests. Switch the page
          theme and the figures follow, because every colour is named by its role.
        </>
      ),
      Demo: OrderDo,
    },
    {
      kind: "dont",
      title: "A foreground on someone else's fill",
      caption: (
        <>
          Three drawings: a foreground token laid on a fill it was never paired with. Each is measured only against its
          own partner, so these combinations are nobody's responsibility and the figures show it.
        </>
      ),
      Demo: WrongFillDont,
    },
    {
      kind: "do",
      title: "The accent fill for the chosen card",
      caption: (
        <>
          Choose a plan with the pointer, or press Tab and then the arrow keys. The chosen card has the{" "}
          <code>bg-accent</code> fill, a check and the word <em>Selected</em>. The focus ring is a separate thing: it is
          only on the card you are on.
        </>
      ),
      Demo: () => (
        <div className="w-full max-w-sm">
          <PlanPicker style="mark" />
        </div>
      ),
    },
    {
      kind: "dont",
      title: "Selection drawn as focus",
      caption: (
        <>
          The chosen card has <code>border-ring ring-2 ring-ring</code>. Before you touch anything it already looks as if
          it has focus. Press Tab into the group and the real focus ring is hard to tell from it; press Tab again and
          the chosen card still looks focused.
        </>
      ),
      Demo: () => (
        <div className="w-full max-w-sm">
          <PlanPicker style="ring" />
        </div>
      ),
    },
  ],
};
