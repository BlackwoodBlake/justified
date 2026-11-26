import rule from "../../rules/sort-in-header-button.js";
import { run } from "../helpers.js";

/** A TanStack header row inside a table, with the given TableHead. */
const tanstack = (head) => `
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
export function Results({ table }) {
  return (
    <Table>
      <TableCaption>Spring 10k results</TableCaption>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              ${head}
            ))}
          </TableRow>
        ))}
      </TableHeader>
    </Table>
  );
}`;

/** shadcn's data table: the sort button lives in the column definition and the head renders it. */
const shadcnDataTable = `
import { flexRender } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
export const columns = [
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Email
        <ArrowUpDown />
      </Button>
    ),
  },
];
export function DataTable({ table }) {
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
    </Table>
  );
}`;

/** shadcn's plain table demo. */
const shadcnTable = `
export function TableDemo({ invoices }) {
  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}`;

run("sort-in-header-button", rule, {
  valid: [
    shadcnTable,
    shadcnDataTable,
    // The Do: a Button in the header, aria-sort on the cell.
    `export function Head({ ariaSort, press }) {
      return (
        <TableHead scope="col" aria-sort={ariaSort}>
          <Button variant="ghost" size="sm" onClick={() => press("time")}>Finish time<ArrowUpIcon /></Button>
        </TableHead>
      );
    }`,
    // A link that loads the sorted page.
    `<th aria-sort="ascending"><a href="?sort=time">Finish time</a></th>`,
    // TanStack with aria-sort on the cell.
    tanstack(`<TableHead key={header.id} aria-sort={sortOf(header.column.getIsSorted())}>
      <Button variant="ghost" onClick={header.column.getToggleSortingHandler()}>Finish time<ArrowUpDown /></Button>
    </TableHead>`),
    // TanStack with the order said in hidden text.
    tanstack(`<TableHead key={header.id}>
      <Button variant="ghost" onClick={header.column.getToggleSortingHandler()}>
        Finish time<span className="sr-only">{orderText(header)}</span><ArrowUpDown />
      </Button>
    </TableHead>`),
    // TanStack with the heading from flexRender: its text may say the order.
    tanstack(`<TableHead key={header.id}>
      <Button variant="ghost" onClick={header.column.getToggleSortingHandler()}>
        {flexRender(header.column.columnDef.header, header.getContext())}<ArrowUpDown />
      </Button>
    </TableHead>`),
    // Some other header in the table sets aria-sort.
    `export function T({ col, sort }) {
      return (
        <Table>
          <TableHeader><TableRow>
            <TableHead aria-sort={sort}><Button onClick={() => col.a.toggleSorting()}>Club</Button></TableHead>
            <TableHead><Button onClick={() => col.b.toggleSorting()}>Time</Button></TableHead>
          </TableRow></TableHeader>
        </Table>
      );
    }`,
    // A TableHead with no Table around it in this file: other cells may set aria-sort.
    `export function SortHead({ column }) {
      return <TableHead><Button onClick={() => column.toggleSorting()}>Club</Button></TableHead>;
    }`,
    // A handler on the cell next to a real control inside it.
    `<TableHead onClick={stop}><Checkbox aria-label="Select all" /></TableHead>`,
    `<th onClick={track}><button type="button" onClick={sort}>Club</button></th>`,
    // Without an import from an icon library, ArrowUpDown may be anything.
    `<TableHead><div onClick={() => sortBy("club")}>Club<ArrowUpDown /></div></TableHead>`,
    // A component inside may be a control.
    `<TableHead onClick={sort}><SortMenu column="club" /></TableHead>`,
    // A row header in the body does not sort a column.
    `<TableHead scope="row" onClick={open}>Pallet wrap</TableHead>`,
    `<table><tbody><tr><th onClick={open}>Pallet wrap</th></tr></tbody></table>`,
    // tabIndex -1 takes the cell out of the tab order, it does not make it a control.
    `<TableHead tabIndex={-1}>Club</TableHead>`,
    `<th tabIndex={tab}>Club</th>`,
    // Several columns with aria-sort: multi-sort is outside the rule.
    `<TableRow><TableHead aria-sort="ascending"><Button>Club</Button></TableHead><TableHead aria-sort="descending"><Button>Time</Button></TableHead></TableRow>`,
    // A div with a role is a hand-made control: KBD-001 and the review skill.
    `<TableHead><div role="button" tabIndex={0} onClick={sort} onKeyDown={key}>Club</div></TableHead>`,
    // An aria-label on the button is our own advice, not the rule.
    `<TableHead aria-sort="ascending"><Button aria-label="Sort by finish time" onClick={sort}>Finish time</Button></TableHead>`,
    // aria-sort on a plain span inside the cell is not checked.
    `<TableHead aria-sort="none">Club</TableHead>`,
  ],
  invalid: [
    {
      // The pointer Don't, with its values written out.
      code: `export function Head({ press, ariaSort, text, icon }) {
        return (
          <TableHead key="club" scope="col" aria-sort={ariaSort} onClick={() => press("club")} className="cursor-pointer">
            <span className="inline-flex items-center gap-2">{text}{icon}</span>
          </TableHead>
        );
      }`,
      errors: [{ messageId: "pointerOnly", data: { handler: "onClick" } }],
    },
    {
      code: `<TableHead onClick={header.column.getToggleSortingHandler()}>Email</TableHead>`,
      errors: [{ messageId: "pointerOnly" }],
    },
    {
      code: `<th onMouseDown={sort}>Club <ArrowUpDownIcon /></th>`,
      errors: [{ messageId: "pointerOnly", data: { handler: "onMouseDown" } }],
    },
    {
      code: `import { ArrowUpDown } from "lucide-react";
      <TableHead><div className="flex cursor-pointer items-center" onClick={() => sortBy("club")}>Club<ArrowUpDown /></div></TableHead>`,
      errors: [{ messageId: "pointerInside", data: { name: "div", handler: "onClick" } }],
    },
    {
      code: `<th><span onPointerDown={sort}>Club</span></th>`,
      errors: [{ messageId: "pointerInside" }],
    },
    {
      code: `<TableHead tabIndex={0} role="button" onKeyDown={key}>Club</TableHead>`,
      errors: [{ messageId: "cellAsButton", data: { what: 'role="button"' } }],
    },
    {
      code: `<th tabIndex={0} onKeyDown={key}>Club</th>`,
      errors: [{ messageId: "cellAsButton", data: { what: "tabIndex={0}" } }],
    },
    {
      // Both: a cell made a control and a pointer handler with nothing inside.
      code: `<TableHead tabIndex="0" onClick={sort}>Club</TableHead>`,
      errors: [{ messageId: "cellAsButton" }, { messageId: "pointerOnly" }],
    },
    {
      code: `<TableHead><Button variant="ghost" aria-sort={order} onClick={sort}>Club</Button></TableHead>`,
      errors: [{ messageId: "ariaSortOnButton", data: { name: "Button" } }],
    },
    {
      code: `<th><button type="button" aria-sort="ascending">Club</button></th>`,
      errors: [{ messageId: "ariaSortOnButton", data: { name: "button" } }],
    },
    {
      // The arrow-only Don't, written with TanStack.
      code: tanstack(`<TableHead key={header.id}>
        <Button variant="ghost" onClick={header.column.getToggleSortingHandler()}>Finish time<ArrowUpDown /></Button>
      </TableHead>`),
      errors: [{ messageId: "orderNotInCode" }],
    },
    {
      code: tanstack(`<TableHead key={header.id}>
        <Button variant="ghost" onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}>
          Club
          {header.column.getIsSorted() === "asc" ? <ArrowUp /> : header.column.getIsSorted() === "desc" ? <ArrowDown /> : <ArrowUpDown />}
        </Button>
      </TableHead>`),
      errors: [{ messageId: "orderNotInCode" }],
    },
  ],
});
