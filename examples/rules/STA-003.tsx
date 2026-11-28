import { AlertIcon } from "@blackwoodblake/justified-shadcn/icons";
import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Checkbox } from "@blackwoodblake/justified-shadcn/checkbox";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { NativeSelect } from "@blackwoodblake/justified-shadcn/native-select";
import { useId, useRef, useState } from "react";

import { Announced, cell, DemoTable, focusSoon, rowLine } from "./empty-demo";
import type { RuleExamples } from "./frame";

/*
 * STA-003 (a guideline, our own choice): when a search or filter matches
 * nothing, say so in the results space, name what was searched for, offer a
 * way to change or clear it, and keep the query and filters in place.
 *
 * A bike parts shop's stock table, from the guideline's own text. It starts
 * on the case itself: "alloy seatpost" with In stock on. The search is
 * live, so typing is tryable. The count line is a status region that is in
 * the page from the start. Each Don't breaks one thing:
 *   noresults  the data table's single "No results." row, no way out
 *   redadd     the no-match line dressed as an error, with Add part as the main button
 */

type Part = { name: string; brand: string; stock: number };

const PARTS: Part[] = [
  { name: "Steel seatpost 27.2 mm", brand: "Alder", stock: 12 },
  { name: "Alloy seatpost 31.6 mm", brand: "Alder", stock: 0 },
  { name: "Wide saddle", brand: "Fenwick", stock: 5 },
  { name: "Disc brake pads", brand: "Fenwick", stock: 20 },
  { name: "Bottle cage", brand: "Alder", stock: 0 },
];

type Variant = "do" | "noresults" | "redadd";

const matches = (p: Part, query: string, brand: string, inStock: boolean) => {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return (
    words.every((w) => p.name.toLowerCase().includes(w)) &&
    (brand === "all" || p.brand === brand) &&
    (!inStock || p.stock > 0)
  );
};

function StockTable({ variant, readout }: { variant: Variant; readout?: boolean }) {
  const [query, setQuery] = useState("alloy seatpost");
  const [brand, setBrand] = useState("all");
  const [inStock, setInStock] = useState(true);
  const titleId = useId();
  const input = useRef<HTMLInputElement>(null);
  const count = useRef<HTMLParagraphElement>(null);

  const rows = PARTS.filter((p) => matches(p, query, brand, inStock));
  const n = rows.length;
  const filters = (brand !== "all" ? 1 : 0) + (inStock ? 1 : 0);
  const trimmed = query.trim();
  const countText = `${n} ${n === 1 ? "part" : "parts"}`;
  // Parts the search would find if In stock were off, for the one-step way out.
  const notInStock = inStock ? PARTS.filter((p) => matches(p, query, brand, false)).length : 0;

  const what = `${inStock ? "in-stock " : ""}${brand !== "all" ? `${brand} ` : ""}parts`;
  const message = trimmed ? `No ${what} match “${trimmed}”.` : `No ${what} match these filters.`;

  const clearSearch = () => {
    setQuery("");
    focusSoon(input);
  };
  const clearFilters = () => {
    setBrand("all");
    setInStock(false);
    focusSoon(input);
  };

  const countLine = (
    <p ref={count} role="status" className="m-0 text-sm text-muted-foreground">
      {countText}
    </p>
  );

  return (
    <div className="grid w-full max-w-md gap-3 rounded-lg border border-border bg-background p-4">
      <h4 id={titleId} className="m-0 text-base font-semibold">
        Stock
      </h4>

      <Field label="Search parts">
        <Input ref={input} value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
      </Field>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <Field label="Brand" className="w-40">
          <NativeSelect value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="all">All brands</option>
            <option value="Alder">Alder</option>
            <option value="Fenwick">Fenwick</option>
          </NativeSelect>
        </Field>
        <Field layout="inline" label="In stock only" className="pb-2.5">
          <Checkbox checked={inStock} onCheckedChange={(v) => setInStock(v === true)} />
        </Field>
      </div>

      <div className="flex items-center justify-between gap-3">
        {countLine}
        <span className="text-sm text-muted-foreground">
          {filters} {filters === 1 ? "filter" : "filters"} on
        </span>
      </div>

      <div className="min-h-36">
        {n > 0 ? (
          <DemoTable labelledBy={titleId} head={["Part", "Brand", "Stock"]}>
            {rows.map((p) => (
              <tr key={p.name} className={rowLine}>
                <td className={cell}>{p.name}</td>
                <td className={cell}>{p.brand}</td>
                <td className={`${cell} tabular-nums`}>{p.stock}</td>
              </tr>
            ))}
          </DemoTable>
        ) : variant === "noresults" ? (
          <DemoTable labelledBy={titleId} head={["Part", "Brand", "Stock"]}>
            <tr>
              <td colSpan={3} className="h-24 text-center text-muted-foreground">
                No results.
              </td>
            </tr>
          </DemoTable>
        ) : variant === "redadd" ? (
          <div className="grid justify-items-center gap-3 rounded-md border border-destructive px-4 py-5 text-center">
            <p className="m-0 flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertIcon aria-hidden="true" className="size-4 shrink-0" />
              {message}
            </p>
            <Button>Add part</Button>
            <div className="flex flex-wrap justify-center gap-2">
              {trimmed && (
                <Button variant="outline" onClick={clearSearch}>
                  Clear search
                </Button>
              )}
              {filters > 0 && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid justify-items-center gap-2 rounded-md border border-dashed border-border px-4 py-5 text-center">
            <p className="m-0 text-sm text-foreground">{message}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {trimmed && (
                <Button variant="outline" onClick={clearSearch}>
                  Clear search
                </Button>
              )}
              {filters > 0 && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
            {notInStock > 0 && (
              <Button
                variant="link"
                onClick={() => {
                  setInStock(false);
                  focusSoon(input);
                }}
              >
                {`Show parts not in stock (${notInStock})`}
              </Button>
            )}
          </div>
        )}
      </div>

      {readout && <Announced target={count} />}
    </div>
  );
}

export const STA003: RuleExamples = {
  id: "STA-003",
  examples: [
    {
      kind: "do",
      title: "The message names the search and offers a way back",
      caption: (
        <>
          "alloy seatpost" with <em>In stock only</em> on finds nothing. The message repeats the words, both stay in
          their controls, and the buttons say what they clear. Try <em>Show parts not in stock (1)</em>, or type
          another word: the count line is a status region that was in the page from the start.
        </>
      ),
      Demo: () => <StockTable variant="do" readout />,
    },
    {
      kind: "dont",
      title: "“No results.” for every empty case",
      caption: (
        <>
          The data table's single row says "No results." and nothing more. The person cannot tell which of their words
          or filters to undo, and a failed fetch would look the same.
        </>
      ),
      Demo: () => <StockTable variant="noresults" />,
    },
    {
      kind: "dont",
      title: "No match dressed as an error",
      caption: (
        <>
          A red box with a warning icon treats a normal outcome as a fault, and <em>Add part</em> as the main button
          offers a new item when the person's way out is to change the search. The clear buttons stay, so only the tone and the
          main action are wrong.
        </>
      ),
      Demo: () => <StockTable variant="redadd" />,
    },
  ],
};
