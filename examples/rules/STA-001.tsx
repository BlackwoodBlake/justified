import { Field } from "@blackwoodblake/justified-shadcn/field";
import { NativeSelect } from "@blackwoodblake/justified-shadcn/native-select";
import { useEffect, useId, useRef, useState } from "react";

import type { RuleExamples } from "./frame";

/* STA-001: show the wait in the part that loads, and keep the rest usable. */

type Period = "week" | "month" | "year";

const ORDERS: Record<Period, [string, string, string][]> = {
  week: [
    ["1042", "Linnea Berg", "£32.00"],
    ["1043", "Omar Haddad", "£115.00"],
  ],
  month: [
    ["0988", "Ida Lund", "£64.00"],
    ["1012", "Pekka Virtanen", "£7.50"],
    ["1042", "Linnea Berg", "£32.00"],
    ["1043", "Omar Haddad", "£115.00"],
  ],
  year: [
    ["0311", "Sara Nyberg", "£240.00"],
    ["0654", "Jonas Ek", "£89.00"],
    ["0988", "Ida Lund", "£64.00"],
    ["1043", "Omar Haddad", "£115.00"],
  ],
};

function Spinner({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} motion-safe:animate-spin`} fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const LABEL: Record<Period, string> = { week: "this week", month: "this month", year: "this year" };

function OrdersPage({ wholePage }: { wholePage: boolean }) {
  const [period, setPeriod] = useState<Period>("week");
  const [shown, setShown] = useState<Period>("week");
  const [loading, setLoading] = useState(false);
  // Shown only when the wait passes half a second, so a fast answer never flashes an indicator.
  const [visible, setVisible] = useState(false);
  const [result, setResult] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const headingId = useId();

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  const choose = (p: Period) => {
    setPeriod(p);
    setLoading(true);
    setResult("");
    clear();
    timers.current.push(setTimeout(() => setVisible(true), 500));
    // A slow server, so the wait can be seen.
    timers.current.push(
      setTimeout(() => {
        setShown(p);
        setLoading(false);
        setVisible(false);
        setResult(`Showing ${ORDERS[p].length} orders from ${LABEL[p]}.`);
      }, 2000),
    );
  };

  const blocked = wholePage && loading && visible;

  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-border bg-background">
      <div inert={blocked} className="grid gap-3 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h4 id={headingId} className="m-0 text-base font-semibold">
            Orders
          </h4>
          <Field label="Period" className="w-40">
            <NativeSelect value={period} onChange={(e) => choose(e.target.value as Period)}>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="year">This year</option>
            </NativeSelect>
          </Field>
        </div>

        {/* The wait and the result are told here, outside the busy table, so screen readers read them at once. */}
        <p
          role="status"
          className={wholePage ? "sr-only" : "m-0 flex min-h-6 items-center gap-2 text-sm text-muted-foreground"}
        >
          {!wholePage && visible && (
            <>
              <Spinner /> Loading orders
            </>
          )}
          {wholePage && visible && "Loading…"}
          {!visible && result}
        </p>

        <table
          aria-labelledby={headingId}
          aria-busy={!wholePage && loading ? true : undefined}
          className="w-full border-collapse text-sm"
        >
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th scope="col" className="py-2 pr-3 font-medium">
                Order
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Customer
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {ORDERS[shown].map(([no, name, total]) => (
              <tr key={no} className="border-b border-border last:border-0">
                <td className="py-2 pr-3">{no}</td>
                <td className="py-2 pr-3">{name}</td>
                <td className="py-2 text-right tabular-nums">{total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {blocked && (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-foreground/50"
        >
          <span className="flex items-center gap-2 rounded-md bg-background px-4 py-2 text-sm font-medium text-foreground shadow">
            <Spinner className="size-6" /> Loading…
          </span>
        </div>
      )}
    </div>
  );
}

export const STA001: RuleExamples = {
  id: "STA-001",
  examples: [
    {
      kind: "do",
      title: "The wait sits in the table",
      caption: (
        <>
          Change <em>Period</em>. "Loading orders" shows just above the table, which keeps its old rows until the new
          ones arrive. You can still read them and change your mind in <em>Period</em> while it waits.
        </>
      ),
      Demo: () => <OrdersPage wholePage={false} />,
    },
    {
      kind: "dont",
      title: "A layer over the whole page",
      caption: (
        <>
          Only the table is loading, but the whole page stops. <em>Period</em> cannot be changed, keyboard focus is
          lost, and "Loading…" does not say what is busy.
        </>
      ),
      Demo: () => <OrdersPage wholePage />,
    },
  ],
};
