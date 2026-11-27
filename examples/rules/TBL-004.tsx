import { Field } from "@blackwoodblake/justified-shadcn/field";
import { NativeSelect } from "@blackwoodblake/justified-shadcn/native-select";
import { useId, useRef, useState } from "react";

import type { RuleExamples } from "./frame";
import {
  TableBody,
  Table,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableNames,
  TableRow,
  titleCaption,
} from "./table-demo";

/*
 * TBL-004 (a guideline, our own choice): every data table has a visible
 * title, tied to the table in code.
 *
 * A warehouse dashboard. Under each scene, a note lists the name each table
 * has in code, as a screen reader's list of tables would give it.
 *
 *   Do 1: two tables, each titled by its TableCaption shown above it.
 *   Do 2: the title is a heading above the table, tied with aria-labelledby,
 *     with a note tied with aria-describedby. A filter narrows the rows; the
 *     count line is a polite status.
 *   Don't 1: a heading above the table and nothing tying the two.
 *   Don't 2: an aria-label that differs from the visible title.
 *
 * Every table sits in a scroll area that takes focus and has a name (LAY-001).
 */

const STOCK = [
  { item: "Pallet wrap", onHand: 14, level: 20, supplier: "Northline" },
  { item: "Box cutters", onHand: 6, level: 12, supplier: "Harbour Supply" },
  { item: "Strapping", onHand: 9, level: 15, supplier: "Northline" },
];

const DELIVERIES = [
  { supplier: "Northline", due: "Tuesday", pallets: 4 },
  { supplier: "Harbour Supply", due: "Wednesday", pallets: 2 },
  { supplier: "Keel Packaging", due: "Wednesday", pallets: 6 },
  { supplier: "Northline", due: "Thursday", pallets: 3 },
  { supplier: "Keel Packaging", due: "Friday", pallets: 5 },
];

function StockRows() {
  return (
    <>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Item</TableHead>
          <TableHead scope="col">On hand</TableHead>
          <TableHead scope="col">Reorder level</TableHead>
          <TableHead scope="col">Supplier</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {STOCK.map((s) => (
          <TableRow key={s.item}>
            <TableHead scope="row" className="h-auto py-2 font-normal text-foreground">
              {s.item}
            </TableHead>
            <TableCell className="tabular-nums">{s.onHand}</TableCell>
            <TableCell className="tabular-nums">{s.level}</TableCell>
            <TableCell>{s.supplier}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
}

function DeliveryRows({ rows }: { rows: typeof DELIVERIES }) {
  return (
    <>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Supplier</TableHead>
          <TableHead scope="col">Due</TableHead>
          <TableHead scope="col">Pallets</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((d) => (
          <TableRow key={d.supplier + d.due}>
            <TableHead scope="row" className="h-auto py-2 font-normal text-foreground">
              {d.supplier}
            </TableHead>
            <TableCell>{d.due}</TableCell>
            <TableCell className="tabular-nums">{d.pallets}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
}

const stack = "flex w-full min-w-0 flex-col gap-4";

function TwoCaptions() {
  const a = useId();
  const b = useId();
  const scope = useRef<HTMLDivElement>(null);
  return (
    <div ref={scope} className={stack}>
      <Table scrollLabelledBy={a}>
        <TableCaption id={a} className={titleCaption}>
          Stock below reorder level
        </TableCaption>
        <StockRows />
      </Table>
      <Table scrollLabelledBy={b}>
        <TableCaption id={b} className={titleCaption}>
          Deliveries expected this week
        </TableCaption>
        <DeliveryRows rows={DELIVERIES.slice(0, 3)} />
      </Table>
      <TableNames scope={scope} />
    </div>
  );
}

function FilteredHeading() {
  const title = useId();
  const note = useId();
  const [supplier, setSupplier] = useState("All");
  const scope = useRef<HTMLDivElement>(null);
  const rows = supplier === "All" ? DELIVERIES : DELIVERIES.filter((d) => d.supplier === supplier);
  return (
    <div ref={scope} className={stack}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h4 id={title} className="m-0 text-base font-semibold">
            Deliveries expected this week
          </h4>
          <p className="m-0 text-sm text-muted-foreground">
            <span id={note}>Counted at 06:00</span>
            {" · "}
            <span role="status">
              Showing {rows.length} of {DELIVERIES.length} deliveries
            </span>
          </p>
        </div>
        <Field label="Supplier" className="w-48">
          <NativeSelect value={supplier} onChange={(e) => setSupplier(e.target.value)}>
            <option>All</option>
            <option>Northline</option>
            <option>Harbour Supply</option>
            <option>Keel Packaging</option>
          </NativeSelect>
        </Field>
      </div>
      <Table scrollLabelledBy={title} aria-labelledby={title} aria-describedby={note}>
        <DeliveryRows rows={rows} />
      </Table>
      <TableNames scope={scope} />
    </div>
  );
}

function HeadingNotTied() {
  const title = useId();
  const scope = useRef<HTMLDivElement>(null);
  return (
    <div ref={scope} className={stack}>
      <h4 id={title} className="m-0 text-base font-semibold">
        Stock below reorder level
      </h4>
      {/* The scroll area has a generic name on purpose: LAY-001 needs one, and naming it after the heading would tie the two, which is what this Don't leaves out. */}
      <Table scrollLabel="Scrollable table area">
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Item</TableHead>
            <TableHead scope="col">On hand</TableHead>
            <TableHead scope="col">Reorder level</TableHead>
            <TableHead scope="col">Supplier</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {STOCK.map((s) => (
            <TableRow key={s.item}>
              <TableHead scope="row" className="h-auto py-2 font-normal text-foreground">
                {s.item}
              </TableHead>
              <TableCell className="tabular-nums">{s.onHand}</TableCell>
              <TableCell className="tabular-nums">{s.level}</TableCell>
              <TableCell>{s.supplier}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TableNames scope={scope} />
    </div>
  );
}

function LabelDiffers() {
  const title = useId();
  const scope = useRef<HTMLDivElement>(null);
  return (
    <div ref={scope} className={stack}>
      <h4 id={title} className="m-0 text-base font-semibold">
        Stock below reorder level
      </h4>
      <Table scrollLabelledBy={title} aria-label="Inventory grid">
        <StockRows />
      </Table>
      <TableNames scope={scope} />
    </div>
  );
}

export const TBL004: RuleExamples = {
  id: "TBL-004",
  examples: [
    {
      kind: "do",
      title: "Each table is titled by its caption",
      caption: (
        <>
          Two tables, each with its title in a <code>caption</code> shown above it. The note under them lists the
          tables the way a screen reader would: each is announced by what it holds. This is our own choice, not
          something the judges decided.
        </>
      ),
      Demo: () => <TwoCaptions />,
    },
    {
      kind: "do",
      title: "A heading above the table, tied to it",
      caption: (
        <>
          The title is a heading, and the table points to it with <code>aria-labelledby</code>. &ldquo;Counted at
          06:00&rdquo; is tied as its description. Choose a supplier: the title stays and the count line says how many
          rows are shown, without moving focus.
        </>
      ),
      Demo: () => <FilteredHeading />,
    },
    {
      kind: "dont",
      title: "A heading with nothing tying it to the table",
      caption: (
        <>
          The heading is there and meets the law&apos;s ask, but nothing in the code ties it to the table. A list of
          the page&apos;s tables gives &ldquo;table&rdquo;, and on a page with two such tables a person cannot tell them apart.
        </>
      ),
      Demo: HeadingNotTied,
    },
    {
      kind: "dont",
      title: "A name that differs from the title",
      caption: (
        <>
          The table has an <code>aria-label</code>, &ldquo;Inventory grid&rdquo;, under the visible title <em>Stock
          below reorder level</em>. A screen reader says one name, the screen shows another, and a person who searches
          for the visible words does not find it.
        </>
      ),
      notLinted:
        "Lint gap: the table has an aria-label written out, and whether it matches the visible title takes the page and a judgement.",
      Demo: LabelDiffers,
    },
  ],
};
