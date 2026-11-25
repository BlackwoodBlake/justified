import { AlertIcon } from "@blackwoodblake/justified-shadcn/icons";
import { Alert, AlertDescription, AlertTitle } from "@blackwoodblake/justified-shadcn/alert";
import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { NativeSelect } from "@blackwoodblake/justified-shadcn/native-select";
import { useEffect, useId, useRef, useState } from "react";

import { Announced, cell, DemoTable, EmptyState, rowLine, Spinner, useFetch } from "./empty-demo";
import type { RuleExamples } from "./frame";

/*
 * STA-002b: while content is on its way, show that it is loading, never that
 * it is empty. Say "nothing" only after the reply came back with no items.
 *
 * Two scenes. An invoices card fetches on its own; a select says what the
 * pretend server answers (invoices, nothing, or a failure), and the wait is
 * about two seconds so every state can be seen. Following STA-001, nothing is
 * drawn for the first half second, then a small indicator shows. The status
 * line is a status region that is in the page from the start, so "Loading",
 * the count, "No overdue invoices" and the failure are all announced.
 *
 * The Don'ts are the rule's own: an empty state drawn from the first render
 * (a list state that cannot tell "not fetched" from "nothing"), and a failure
 * turned into an empty list (catch sets []). The second scene filters a list;
 * the Do keeps the old rows, dimmed; the Don't clears them at once.
 */

type Invoice = [number: string, customer: string, due: string];

const OVERDUE: Invoice[] = [
  ["INV-2041", "Harbour Café", "3 Dec"],
  ["INV-2044", "Norberg Joinery", "5 Dec"],
  ["INV-2047", "Studio Aalto", "12 Dec"],
];

type Reply = "items" | "nothing" | "fails";
type Bug = "flash" | "swallow" | undefined;

function InvoiceTable({ rows, labelledBy, dim }: { rows: Invoice[]; labelledBy: string; dim?: boolean }) {
  return (
    <DemoTable labelledBy={labelledBy} head={["Invoice", "Customer", "Due"]} dim={dim} busy={dim}>
      {rows.map(([no, name, due]) => (
        <tr key={no} className={rowLine}>
          <td className={`${cell} whitespace-nowrap`}>{no}</td>
          <td className={cell}>{name}</td>
          <td className={`${cell} whitespace-nowrap`}>{due}</td>
        </tr>
      ))}
    </DemoTable>
  );
}

function OverdueCard({ start, bug }: { start: Reply; bug?: Bug }) {
  const [reply, setReply] = useState<Reply>(start);
  const replyRef = useRef(reply);
  const titleId = useId();
  const status = useRef<HTMLParagraphElement>(null);
  const reload = useRef<HTMLButtonElement>(null);
  const { phase, slow, data, load } = useFetch<Invoice>({
    resolve: () => (replyRef.current === "fails" ? null : replyRef.current === "nothing" ? [] : OVERDUE),
  });

  useEffect(() => {
    load("overdue", false);
  }, [load]);

  // The select only sets what the next reply will be; Reload invoices sends the request.
  const run = () => {
    replyRef.current = reply;
    load("overdue", false);
  };

  const rows = data ?? [];
  // A list state that cannot tell "not fetched" from "nothing" treats the wait as empty,
  // and a failure that is swallowed as an empty list.
  const knowsWait = bug !== "flash";
  const pending = knowsWait && phase === "pending";
  const failed = bug !== "swallow" && phase === "error";

  let line = "";
  if (pending) line = slow ? "Loading overdue invoices" : "";
  else if (failed) line = "Could not load overdue invoices";
  else if (phase !== "pending") line = rows.length ? `${rows.length} overdue invoices` : "No overdue invoices";

  return (
    <div className="grid w-full max-w-md gap-3 rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 id={titleId} className="m-0 text-base font-semibold">
          Overdue invoices
        </h4>
        <Button ref={reload} size="sm" variant="outline" onClick={run}>
          Reload invoices
        </Button>
      </div>

      <p ref={status} role="status" className="m-0 flex min-h-6 items-center gap-2 text-sm text-muted-foreground">
        {pending && slow && <Spinner />}
        <span className={failed ? "sr-only" : undefined}>{line}</span>
      </p>

      <div className="min-h-40" aria-busy={pending ? true : undefined}>
        {failed ? (
          <Alert variant="destructive">
            <AlertIcon aria-hidden="true" />
            <AlertTitle>Could not load overdue invoices</AlertTitle>
            <AlertDescription className="col-start-2 grid justify-items-start gap-2">
              Check your connection, then try again.
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  run();
                  // The failure box goes while the request runs, so focus moves to the card's own button.
                  reload.current?.focus();
                }}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : pending ? null : rows.length > 0 ? (
          <InvoiceTable rows={rows} labelledBy={titleId} />
        ) : (
          <EmptyState heading="Nothing is overdue">Invoices that pass their due date will show here.</EmptyState>
        )}
      </div>

      <div className="grid gap-2 border-t border-dashed border-border pt-3">
        <p className="m-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">Example control</p>
        <Field label="Simulated server reply" hint="Sets the next reply. Press Reload invoices to send the request.">
          <NativeSelect value={reply} onChange={(e) => setReply(e.target.value as Reply)}>
            <option value="items">Returns three invoices</option>
            <option value="nothing">Returns nothing</option>
            <option value="fails">Fails</option>
          </NativeSelect>
        </Field>
        <Announced target={status} />
      </div>
    </div>
  );
}

const FILTERS = {
  all: "All unpaid",
  week: "Due this week",
  next: "Due next month",
} as const;
type FilterKey = keyof typeof FILTERS;

const UNPAID: Invoice[] = [
  ["INV-2041", "Harbour Café", "3 Dec"],
  ["INV-2044", "Norberg Joinery", "5 Dec"],
  ["INV-2047", "Studio Aalto", "12 Dec"],
  ["INV-2050", "Dunmore Print", "19 Dec"],
];
const BY_FILTER: Record<FilterKey, Invoice[]> = { all: UNPAID, week: UNPAID.slice(0, 2), next: [] };

function FilteredInvoices({ clearAtOnce }: { clearAtOnce: boolean }) {
  // The filter starts on "Due this week" with that fetch already out, over the rows of "All unpaid".
  const [filter, setFilter] = useState<FilterKey>("week");
  const titleId = useId();
  const select = useRef<HTMLSelectElement>(null);
  const { phase, slow, data, load } = useFetch<Invoice>({
    resolve: (key) => BY_FILTER[key as FilterKey],
    initial: UNPAID,
  });

  useEffect(() => {
    load("week", !clearAtOnce);
  }, [load, clearAtOnce]);

  const choose = (next: FilterKey) => {
    setFilter(next);
    load(next, !clearAtOnce);
  };

  const rows = data ?? [];
  const pending = phase === "pending";
  let line = "";
  if (pending) line = slow ? "Loading invoices" : "";
  else line = `${rows.length} ${rows.length === 1 ? "invoice" : "invoices"}`;

  return (
    <div className="grid w-full max-w-md gap-3 rounded-lg border border-border bg-background p-4">
      <h4 id={titleId} className="m-0 text-base font-semibold">
        Unpaid invoices
      </h4>
      <Field label="Show">
        <NativeSelect ref={select} value={filter} onChange={(e) => choose(e.target.value as FilterKey)}>
          {(Object.keys(FILTERS) as FilterKey[]).map((k) => (
            <option key={k} value={k}>
              {FILTERS[k]}
            </option>
          ))}
        </NativeSelect>
      </Field>

      <p role="status" className="m-0 flex min-h-6 items-center gap-2 text-sm text-muted-foreground">
        {pending && slow && <Spinner />}
        {line}
      </p>

      <div className="min-h-44">
        {clearAtOnce && pending && rows.length === 0 ? (
          // The Don't: the rows are gone, so the empty row shows for as long as the request takes.
          <DemoTable labelledBy={titleId} head={["Invoice", "Customer", "Due"]}>
            <tr>
              <td colSpan={3} className="h-24 text-center text-muted-foreground">
                No results.
              </td>
            </tr>
          </DemoTable>
        ) : rows.length > 0 ? (
          <InvoiceTable rows={rows} labelledBy={titleId} dim={pending && slow} />
        ) : pending ? (
          // Nothing to dim: the small indicator sits in the area itself once the wait passes half a second.
          <div className="flex min-h-24 items-center justify-center text-muted-foreground">{slow && <Spinner className="size-6" />}</div>
        ) : (
          <EmptyState
            actions={
              <Button
                variant="outline"
                onClick={() => {
                  choose("all");
                  setTimeout(() => select.current?.focus(), 0);
                }}
              >
                Clear filter
              </Button>
            }
          >
            No unpaid invoices are due next month.
          </EmptyState>
        )}
      </div>
    </div>
  );
}

export const STA002b: RuleExamples = {
  id: "STA-002b",
  examples: [
    {
      kind: "do",
      title: "Wait first, then the answer",
      caption: (
        <>
          For half a second the card shows neither the wait nor an empty space, then a small indicator named "Loading
          overdue invoices". Only the reply decides what follows. Choose another <em>Simulated server reply</em>, then
          press <em>Reload invoices</em>, to see the empty state and the failure, which is not an empty list.
        </>
      ),
      Demo: () => <OverdueCard start="items" />,
    },
    {
      kind: "dont",
      title: "“Nothing” drawn before the reply",
      caption: (
        <>
          The list starts as an empty array, so the empty state shows from the first render, for as long as the
          request takes. Someone who reads it and leaves never sees their invoices. Press <em>Reload invoices</em> to see it
          happen again.
        </>
      ),
      Demo: () => <OverdueCard start="items" bug="flash" />,
    },
    {
      kind: "dont",
      title: "A failure shown as an empty list",
      caption: (
        <>
          The request fails, and the error is swallowed into an empty array. The card says nothing is overdue when the
          truth is that the invoices could not be loaded.
        </>
      ),
      Demo: () => <OverdueCard start="fails" bug="swallow" />,
    },
    {
      kind: "do",
      title: "Old rows stay, dimmed, until the new ones arrive",
      caption: (
        <>
          A new filter is already out. The previous rows stay in place, dimmed, with "Loading invoices" above them, and
          the filter stays usable. Choose <em>Due next month</em> to reach the no-match message once the reply is in.
        </>
      ),
      Demo: () => <FilteredInvoices clearAtOnce={false} />,
    },
    {
      kind: "dont",
      title: "Rows cleared as soon as the filter changes",
      caption: (
        <>
          The rows are emptied at once, so "No results." shows while the reply is still on its way. Choose another
          filter to see it.
        </>
      ),
      Demo: () => <FilteredInvoices clearAtOnce />,
    },
  ],
};
