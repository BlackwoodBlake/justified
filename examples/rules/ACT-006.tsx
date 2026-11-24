import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { ChevronDownIcon, MinusIcon, PlusIcon } from "@blackwoodblake/justified-shadcn/icons";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { Label } from "@blackwoodblake/justified-shadcn/label";
import { Switch } from "@blackwoodblake/justified-shadcn/switch";
import { useEffect, useId, useRef, useState } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";
import { TargetAreas } from "./targets";

/*
 * ACT-006: every pointer target is at least 24 by 24, or passes the
 * spacing test.
 *
 * A quantity field for one product. In the Do, Decrease and Increase are
 * 40 px square buttons with a gap. In the Don't they are arrows stacked
 * inside the field's right edge, 24 wide and 10 tall, touching. Both use a
 * text input with inputMode="numeric", because a native number input adds
 * spinners the browser draws, which the rule excuses.
 *
 * "Show target areas" draws each target and its 24 px circle. It is on
 * from the start, so the test can be seen without doing anything.
 */

const MIN = 1;
const MAX = 20;

function useQuantity() {
  const [qty, setQty] = useState("2");
  const [said, setSaid] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const step = (by: number) => {
    const n = Number.parseInt(qty, 10);
    const next = Math.min(MAX, Math.max(MIN, (Number.isNaN(n) ? MIN : n) + by));
    setQty(String(next));
    // Empty first, so the same value is announced again on a repeat press.
    setSaid("");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaid(`Quantity ${next}`), 50);
  };
  // Only digits, never more than MAX, so a press of Increase never lowers the value.
  const type = (v: string) => {
    const digits = v.replace(/\D/g, "");
    setQty(digits && Number(digits) > MAX ? String(MAX) : digits);
  };
  // An empty field or 0 becomes the smallest quantity when the person leaves it.
  const leave = () => {
    const n = Number.parseInt(qty, 10);
    if (Number.isNaN(n) || n < MIN) setQty(String(MIN));
  };
  return { qty, type, leave, said, step };
}

function ProductRow({ stacked }: { stacked: boolean }) {
  const q = useQuantity();
  const [show, setShow] = useState(true);
  const scope = useRef<HTMLDivElement>(null);
  const id = useId();

  const decrease = { "aria-label": "Decrease quantity", onClick: () => q.step(-1) };
  const increase = { "aria-label": "Increase quantity", onClick: () => q.step(1) };

  return (
    <div className="grid w-full max-w-sm gap-4 rounded-lg border border-border bg-background p-4">
      {/* TargetAreas comes after the scope, not inside it, so the scope's ref is set when it measures. */}
      <div className="relative">
        <div ref={scope} className="grid gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <h4 className="m-0 text-base font-semibold">Wool socks</h4>
            <p className="m-0 text-sm text-muted-foreground">£6 a pair</p>
          </div>
          <div className="flex flex-col">
            <Label htmlFor={id}>Quantity</Label>
            {stacked ? (
              // Two arrows inside the field's right edge, each 24 by 10, touching.
              <div className="relative mt-2 w-24">
                <Input
                  id={id}
                  inputMode="numeric"
                  autoComplete="off"
                  value={q.qty}
                  onChange={(e) => q.type(e.target.value)}
                  onBlur={q.leave}
                  className="pr-8"
                />
                <div className="absolute top-1/2 right-1 flex -translate-y-1/2 flex-col">
                  <button type="button" {...increase} className={arrow}>
                    <ChevronDownIcon className="size-3 rotate-180" />
                  </button>
                  <button type="button" {...decrease} className={arrow}>
                    <ChevronDownIcon className="size-3" />
                  </button>
                </div>
              </div>
            ) : (
              // Two 40 px buttons with a gap, on a row that wraps on a narrow screen.
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button variant="outline" size="icon" {...decrease}>
                  <MinusIcon />
                </Button>
                <Input
                  id={id}
                  inputMode="numeric"
                  autoComplete="off"
                  value={q.qty}
                  onChange={(e) => q.type(e.target.value)}
                  onBlur={q.leave}
                  className="w-16 text-center"
                />
                <Button variant="outline" size="icon" {...increase}>
                  <PlusIcon />
                </Button>
              </div>
            )}
          </div>
        </div>
        <TargetAreas scope={scope} show={show} />
      </div>
      <Outcome>{q.said}</Outcome>
      <Field label="Show target areas" layout="inline">
        <Switch checked={show} onCheckedChange={setShow} />
      </Field>
    </div>
  );
}

const arrow =
  "flex h-2.5 w-6 cursor-pointer items-center justify-center rounded-sm text-foreground hover:bg-accent " +
  "hover:text-accent-foreground " +
  // The adapter's focus ring, as in KBD-001, so the Don't breaks only ACT-006.
  "outline-none focus-visible:outline-hidden focus-visible:ring-(length:--focus-ring-width) focus-visible:ring-ring " +
  "focus-visible:ring-offset-(length:--focus-ring-offset) focus-visible:ring-offset-background";

export const ACT006: RuleExamples = {
  id: "ACT-006",
  examples: [
    {
      kind: "do",
      title: "Two full-size buttons beside the field",
      caption: (
        <>
          <em>Decrease quantity</em> and <em>Increase quantity</em> are 40 pixels square with a gap between them and the
          field. The dashed boxes show each target in the product row, and every box is at least 24 by 24, so each
          target passes on size and needs no spacing test. Press plus or minus and the new quantity is announced.
        </>
      ),
      Demo: () => <ProductRow stacked={false} />,
    },
    {
      kind: "dont",
      title: "Stacked arrows, 24 by 10",
      caption: (
        <>
          The two arrows are 10 pixels tall and touch, so each gets a 24-pixel circle for the spacing test. The circles
          overlap each other and the other arrow, so the arrows fail both the size test and the spacing test. Press the
          top arrow near its lower edge: a little off, and you press the other one.
        </>
      ),
      Demo: () => <ProductRow stacked />,
    },
  ],
};
