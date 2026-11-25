import { Button } from "@blackwoodblake/justified-shadcn/button";
import { focusRing } from "@blackwoodblake/justified-shadcn/styles";
import { cn } from "@blackwoodblake/justified-shadcn/utils";
import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode, type RefObject } from "react";

/*
 * A table for the table examples (TBL-001 to TBL-004).
 *
 * The adapter has no table, so this one is built like shadcn's: Table (a
 * scroll wrapper around the table), TableHeader, TableBody, TableRow,
 * TableHead, TableCell and TableCaption, styled with the project's tokens.
 *
 * The wrapper is the scroll area LAY-001 asks for: it takes focus, has a
 * role and is named, so a keyboard user can scroll it. Name it with
 * scrollLabelledBy or scrollLabel. shadcn's wrapper has no such props; the
 * rule says to add them in your own copy, and that is what this is.
 *
 * Also here, for the examples only: three small readouts that show what is in
 * the code of the table next to them. They read the DOM the example drew, are
 * not screen readers, and are not components of the system.
 *
 *   CellReader: a cursor over the cells. It says which headings are tied to
 *     the cell in code, the way a screen reader moving cell to cell would.
 *   HeaderFacts: for each column heading, its control and its aria-sort.
 *   TableNames: the name each table has in code, as a list of tables.
 */

export const scrollRing = focusRing;

type ScrollProps = {
  /** Id of the element whose text names the scroll area. */
  scrollLabelledBy?: string;
  /** A name for the scroll area when no visible text carries it. */
  scrollLabel?: string;
  scrollClassName?: string;
};

/** A scroll area that takes focus and has a name (LAY-001). */
export function ScrollArea({
  scrollLabelledBy,
  scrollLabel,
  scrollClassName,
  children,
}: ScrollProps & { children: ReactNode }) {
  return (
    <div
      role="region"
      tabIndex={0}
      aria-labelledby={scrollLabelledBy}
      aria-label={scrollLabelledBy ? undefined : scrollLabel}
      className={cn("relative w-full overflow-auto rounded-md border border-border bg-background", focusRing, scrollClassName)}
    >
      {children}
    </div>
  );
}

export function Table({ className, scrollLabelledBy, scrollLabel, scrollClassName, ...props }: ComponentProps<"table"> & ScrollProps) {
  return (
    <ScrollArea scrollLabelledBy={scrollLabelledBy} scrollLabel={scrollLabel} scrollClassName={scrollClassName}>
      <table data-slot="table" className={cn("w-full min-w-[34rem] caption-bottom border-collapse text-sm", className)} {...props} />
    </ScrollArea>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return <tr data-slot="table-row" className={cn("border-b border-border", className)} {...props} />;
}

export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn("h-10 px-3 text-left align-middle font-medium whitespace-nowrap text-muted-foreground", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td data-slot="table-cell" className={cn("px-3 py-2 align-middle", className)} {...props} />;
}

/** Shadcn's caption sits under the table in muted text. */
export function TableCaption({ className, ...props }: ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />;
}

/** Class for a caption used as the table's visible title, above the table (TBL-004). */
export const titleCaption = "caption-top mt-0 mb-0 px-3 py-3 text-left text-base font-semibold text-foreground";

/** Class for the heading cell that is also a row header: shadcn's TableHead with scope="row", in body weight. */
export const rowHeadClass = "h-auto py-2 font-normal text-foreground";

/* ---- Sort icons: decorative, hidden from assistive technology (TBL-002). ---- */

function SortSvg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="size-4 shrink-0"
    >
      {children}
    </svg>
  );
}

export function ArrowUpIcon() {
  return (
    <SortSvg>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </SortSvg>
  );
}

export function ArrowDownIcon() {
  return (
    <SortSvg>
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </SortSvg>
  );
}

export function ArrowUpDownIcon() {
  return (
    <SortSvg>
      <path d="M8 4v16M4 16l4 4 4-4M16 20V4M12 8l4-4 4 4" />
    </SortSvg>
  );
}

/* ---- Readouts ---- */

const clean = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

type Reading = { value: string; column: string | null; row: string | null; inTable: boolean };

function read(el: HTMLElement): Reading {
  const table = el.closest("table");
  const checkbox = el.querySelector("[role='checkbox']");
  const value = clean(el.textContent) || (checkbox ? "checkbox" : "");
  if (!table || !(el instanceof HTMLTableCellElement)) {
    return { value, column: null, row: null, inTable: false };
  }
  const headRows = table.tHead?.rows;
  const headRow = headRows?.[headRows.length - 1];
  const above = headRow?.cells[el.cellIndex];
  const column = above && above.tagName === "TH" ? clean(above.textContent) || "(empty)" : null;
  const rowHead = el.tagName === "TH" ? null : (el.parentElement as HTMLTableRowElement).querySelector("th");
  const row = rowHead ? clean(rowHead.textContent) : el.tagName === "TH" ? "this cell" : null;
  return { value, column, row, inTable: true };
}

const readoutClass = "m-0 grid gap-0.5 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground";

/**
 * A cursor over the value cells, as a person moving cell to cell would meet
 * them. Click a cell, or use the two buttons. Cells are body cells of a real
 * table, or anything marked data-cell.
 */
export function CellReader({ children, start = 1, still }: { children: ReactNode; start?: number; still?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(start);
  const [reading, setReading] = useState<Reading | null>(null);

  const cells = () => [...(ref.current?.querySelectorAll<HTMLElement>("[data-cell], tbody td, tbody th") ?? [])];

  useLayoutEffect(() => {
    const all = cells();
    all.forEach((c, i) => c.toggleAttribute("data-reading", i === index));
    const el = all[index];
    if (el) setReading(read(el));
  }, [index]);

  const move = (by: number) => {
    const all = cells();
    const next = (index + by + all.length) % all.length;
    setIndex(next);
    all[next]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <div
        ref={ref}
        className="[&_[data-reading]]:bg-accent [&_[data-reading]]:shadow-[inset_0_0_0_2px_var(--color-ring)]"
        onClick={(e) => {
          const hit = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-cell], td, th") : null;
          const i = hit ? cells().indexOf(hit) : -1;
          if (i >= 0) setIndex(i);
        }}
      >
        {still ? (
          <div aria-hidden="true" inert>
            {children}
          </div>
        ) : (
          children
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => move(-1)}>
          Previous cell
        </Button>
        <Button variant="outline" size="sm" onClick={() => move(1)}>
          Next cell
        </Button>
        {!still && <span className="text-xs text-muted-foreground">or click a cell</span>}
      </div>
      <div role="status" className={readoutClass}>
        {reading && (
          <>
            <span>
              Value: <span className="font-medium text-foreground">{reading.value ? `“${reading.value}”` : "(empty)"}</span>
            </span>
            {reading.inTable ? (
              <>
                <span>
                  Column heading in code:{" "}
                  <span className="font-medium text-foreground">{reading.column ? `“${reading.column}”` : "none"}</span>
                </span>
                <span>
                  Row heading in code:{" "}
                  <span className="font-medium text-foreground">{reading.row === "this cell" ? "this cell" : reading.row ? `“${reading.row}”` : "none"}</span>
                </span>
              </>
            ) : (
              <span className="font-medium text-foreground">No table in the code: no heading is tied to this value.</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

type Facts = { name: string; control: string; sort: string }[];

/** The column headings as the code holds them: the control inside, its name and aria-sort. */
export function HeaderFacts({ scope }: { scope: RefObject<HTMLElement | null> }) {
  const [facts, setFacts] = useState<Facts>([]);
  useEffect(() => {
    const next = [...(scope.current?.querySelectorAll("thead th") ?? [])].map((th) => {
      const control = th.querySelector("button, a[href]");
      const name = clean(control?.getAttribute("aria-label") ?? th.textContent);
      return {
        name,
        control: control ? control.tagName.toLowerCase() : "text",
        sort: th.getAttribute("aria-sort") ?? control?.getAttribute("aria-sort") ?? "",
      };
    });
    setFacts((old) => (JSON.stringify(old) === JSON.stringify(next) ? old : next));
  });
  return (
    <div aria-hidden="true" className={readoutClass}>
      <span>Column headings in the code:</span>
      {facts.map((f, i) => (
        <span key={i} className="text-foreground">
          “{f.name}”: {f.control}
          {f.sort ? <>, aria-sort="{f.sort}"</> : ", no aria-sort"}
        </span>
      ))}
    </div>
  );
}

/** The name each table has in code, as a screen reader's list of tables would give it. */
export function TableNames({ scope }: { scope: RefObject<HTMLElement | null> }) {
  const [names, setNames] = useState<string[]>([]);
  useEffect(() => {
    const next = [...(scope.current?.querySelectorAll("table") ?? [])].map((t) => {
      const ids = t.getAttribute("aria-labelledby");
      const byIds = ids
        ?.split(/\s+/)
        .map((id) => clean(t.ownerDocument.getElementById(id)?.textContent))
        .join(" ");
      return clean(byIds) || clean(t.getAttribute("aria-label")) || clean(t.querySelector("caption")?.textContent) || "";
    });
    setNames((old) => (JSON.stringify(old) === JSON.stringify(next) ? old : next));
  });
  return (
    <div aria-hidden="true" className={readoutClass}>
      <span>Tables on this page, by name in code:</span>
      <ol className="m-0 list-decimal pl-5 text-foreground">
        {names.map((n, i) => (
          <li key={i}>{n ? `“${n}”` : "table (no name)"}</li>
        ))}
      </ol>
    </div>
  );
}
