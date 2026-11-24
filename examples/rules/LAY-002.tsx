import { Field, FieldSet } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";

import type { RuleExamples } from "./frame";

/*
 * LAY-002: the order in the code tells the same story as the order on screen.
 *
 * Three numbered checkout steps. The small "code order" note by each step
 * shows its place in the code, and is hidden from assistive technology. In
 * the Do it matches the screen. In the Don't the code holds the steps as
 * 1, 3, 2 and CSS order draws them as 1, 2, 3, so Tab and a screen reader
 * meet Payment before Delivery.
 *
 * The fields are not marked and there is no submit button, so no validation
 * comes into it (FRM-005).
 */

type Step = { n: 1 | 2 | 3; legend: string; label: string; name: string; autoComplete: string; inputMode?: "numeric" };

const STEPS: Record<1 | 2 | 3, Step> = {
  1: { n: 1, legend: "1. Your details", label: "Full name", name: "full-name", autoComplete: "name" },
  2: { n: 2, legend: "2. Delivery", label: "Postcode", name: "postcode", autoComplete: "postal-code" },
  3: {
    n: 3,
    legend: "3. Payment",
    label: "Card number",
    name: "card-number",
    autoComplete: "cc-number",
    inputMode: "numeric",
  },
};

// CSS order that puts each step back in its place on screen.
const ORDER = { 1: "order-1", 2: "order-2", 3: "order-3" } as const;

function Checkout({ codeOrder }: { codeOrder: (1 | 2 | 3)[] }) {
  const rearranged = codeOrder.some((n, i) => n !== i + 1);
  return (
    <div className="flex w-full max-w-sm flex-col gap-5 rounded-lg border border-border bg-background p-4">
      {codeOrder.map((n, i) => {
        const s = STEPS[n];
        return (
          <div key={n} className={`relative ${rearranged ? ORDER[n] : ""}`}>
            <span
              aria-hidden="true"
              className="absolute right-0 top-0 rounded-sm border border-dashed border-border px-1.5 text-xs text-muted-foreground"
            >
              code order {i + 1}
            </span>
            <FieldSet legend={s.legend} className="gap-3">
              <Field label={s.label}>
                <Input autoComplete={s.autoComplete} inputMode={s.inputMode} name={s.name} />
              </Field>
            </FieldSet>
          </div>
        );
      })}
    </div>
  );
}

export const LAY002: RuleExamples = {
  id: "LAY-002",
  examples: [
    {
      kind: "do",
      title: "Steps in the same order in code and on screen",
      caption: (
        <>
          The note by each step shows its place in the code: 1, 2, 3, the same as on screen. Click in <em>Full name</em>{" "}
          and press Tab: focus goes to <em>Postcode</em>, then <em>Card number</em>. A screen reader reads the steps in
          the same order.
        </>
      ),
      Demo: () => <Checkout codeOrder={[1, 2, 3]} />,
    },
    {
      kind: "dont",
      title: "CSS order rearranges the steps",
      caption: (
        <>
          The screen shows 1, 2, 3, but the notes read 1, 3, 2: the code has <em>Payment</em> before <em>Delivery</em>{" "}
          and CSS <code>order</code> moves it back down. Click in <em>Full name</em> and press Tab: focus jumps to{" "}
          <em>Card number</em>, then back up to <em>Postcode</em>. A screen reader reads <em>Payment</em> before{" "}
          <em>Delivery</em>.
        </>
      ),
      Demo: () => <Checkout codeOrder={[1, 3, 2]} />,
    },
  ],
};
