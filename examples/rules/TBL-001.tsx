import { Checkbox } from "@blackwoodblake/justified-shadcn/checkbox";
import { useId, useState } from "react";

import type { RuleExamples } from "./frame";
import {
  CellReader,
  rowHeadClass,
  ScrollArea,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  titleCaption,
} from "./table-demo";

/*
 * TBL-001: values in rows and columns are a table in code, with headings
 * marked as headers.
 *
 * Both scenes are a council's page "Water samples". Each has a cursor that
 * moves cell to cell and says which headings the code ties to the value, the
 * way a screen reader moving through the table would.
 *
 * Do 1: a real table, scope="col" on the headings, the site as a row header,
 *   and "Not measured" in the empty cell.
 * Don't 1: the same picture built from divs in a grid. Nothing is tied.
 * Do 2: a column of checkboxes whose heading is "Select" for screen readers.
 * Don't 2: the same table, but the heading over the checkboxes is empty.
 *
 * Every table sits in its own scroll area that takes focus and has a name
 * (LAY-001), and has a visible title tied to it (TBL-004).
 */

const SAMPLES = [
  { site: "Mill Lane footbridge", ph: "7.4", nitrate: "12", by: "R. Okafor" },
  { site: "Harbour steps", ph: "7.1", nitrate: "9", by: "M. Lindqvist" },
  { site: "Quarry pond", ph: "6.8", nitrate: "Not measured", by: "R. Okafor" },
  { site: "Weir Road culvert", ph: "7.6", nitrate: "15", by: "T. Haddad" },
];

function RealTable() {
  const id = useId();
  return (
    <CellReader>
      <Table scrollLabelledBy={id}>
        <TableCaption id={id} className={titleCaption}>
          Water samples
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Site</TableHead>
            <TableHead scope="col">pH</TableHead>
            <TableHead scope="col">Nitrate (mg/l)</TableHead>
            <TableHead scope="col">Collected by</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SAMPLES.map((s) => (
            <TableRow key={s.site}>
              <TableHead scope="row" className={rowHeadClass}>
                {s.site}
              </TableHead>
              <TableCell>{s.ph}</TableCell>
              <TableCell>{s.nitrate}</TableCell>
              <TableCell>{s.by}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CellReader>
  );
}

const gridRow = "grid grid-cols-4 border-b border-border last:border-0";

function DivGrid() {
  const id = useId();
  return (
    <CellReader>
      <h4 id={id} className="m-0 mb-2 text-base font-semibold">
        Water samples
      </h4>
      <ScrollArea scrollLabelledBy={id}>
        <div className="min-w-[34rem] text-sm">
          <div className={`${gridRow} font-medium text-muted-foreground`}>
            {["Site", "pH", "Nitrate (mg/l)", "Collected by"].map((h) => (
              <div key={h} className="px-3 py-2.5">
                {h}
              </div>
            ))}
          </div>
          {SAMPLES.map((s) => (
            <div key={s.site} className={gridRow}>
              {[s.site, s.ph, s.nitrate, s.by].map((v, i) => (
                <div key={i} data-cell className="px-3 py-2">
                  {v}
                </div>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>
    </CellReader>
  );
}

function SelectTable({ named }: { named: boolean }) {
  // The Don't is drawn as a still: its empty heading is the failure, and a live one would fail axe on this page.
  const id = useId();
  const [picked, setPicked] = useState<string[]>([]);
  return (
    <CellReader start={0} still={!named}>
      <Table scrollLabelledBy={id}>
        <TableCaption id={id} className={titleCaption}>
          Water samples
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col" className="w-12">
              {named && <span className="sr-only">Select</span>}
            </TableHead>
            <TableHead scope="col">Site</TableHead>
            <TableHead scope="col">pH</TableHead>
            <TableHead scope="col">Collected by</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SAMPLES.map((s) => (
            <TableRow key={s.site}>
              <TableCell>
                <Checkbox
                  aria-label={`Select ${s.site}`}
                  checked={picked.includes(s.site)}
                  onCheckedChange={(c) => setPicked((p) => (c ? [...p, s.site] : p.filter((x) => x !== s.site)))}
                />
              </TableCell>
              <TableHead scope="row" className={rowHeadClass}>
                {s.site}
              </TableHead>
              <TableCell>{s.ph}</TableCell>
              <TableCell>{s.by}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CellReader>
  );
}

export const TBL001: RuleExamples = {
  id: "TBL-001",
  examples: [
    {
      kind: "do",
      title: "A real table with headers",
      caption: (
        <>
          Click a value, or press <em>Next cell</em>, and read what the code ties to it. 7.4 sits under <em>pH</em>, in
          the row for <em>Mill Lane footbridge</em>. The empty nitrate reading is a cell that says &ldquo;Not
          measured&rdquo;. Tab to the table area to scroll it from the keyboard.
        </>
      ),
      Demo: () => <RealTable />,
    },
    {
      kind: "dont",
      title: "A grid of divs that looks like a table",
      caption: (
        <>
          The same picture, built from <code>div</code> elements. Click 7.4, or press <em>Next cell</em>: it is a loose
          value, with no column or row heading in the code. A sighted person sees the ties and a screen reader user
          does not.
        </>
      ),
      Demo: () => <DivGrid />,
    },
    {
      kind: "do",
      title: "A checkbox column that has a heading",
      caption: (
        <>
          The column of checkboxes has the heading <em>Select</em>, drawn for screen readers only. The note under the
          table starts on the first checkbox: its column heading is found, and so is its row. Press <em>Next cell</em>{" "}
          to move on, and tick a few boxes.
        </>
      ),
      Demo: () => <SelectTable named />,
    },
    {
      kind: "dont",
      title: "An empty heading over the checkboxes",
      caption: (
        <>
          The same table, but the heading cell over the checkboxes is empty. The table is shown as a picture, since a
          live one would fail the page&apos;s own checks. The note under it starts on the first checkbox: the code
          finds a heading cell with nothing in it, so the column has no name. <em>Next cell</em> moves the note on.
        </>
      ),
      Demo: () => <SelectTable named={false} />,
    },
  ],
};
