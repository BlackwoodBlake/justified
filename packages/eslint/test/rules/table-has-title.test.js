import rule from "../../rules/table-has-title.js";
import { run } from "../helpers.js";

/** shadcn's data table, with no caption, as its docs write it. */
const dataTable = (attrs = "") => `
export function DataTable({ table, columns }) {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table${attrs}>
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
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}`;

run("table-has-title", rule, {
  valid: [
    // shadcn's table demo, with its caption.
    `export function TableDemo({ invoices }) {
      return (
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.invoice}><TableCell>{invoice.invoice}</TableCell><TableCell>{invoice.paymentStatus}</TableCell></TableRow>
            ))}
          </TableBody>
          <TableFooter><TableRow><TableCell colSpan={2}>Total</TableCell></TableRow></TableFooter>
        </Table>
      );
    }`,
    // Tied to a heading above it.
    dataTable(` aria-labelledby="deliveries-title"`),
    dataTable(` aria-labelledby={titleId}`),
    // The fallback where the design has no visible title, and a name from an expression.
    dataTable(` aria-label="Stock below reorder level"`),
    dataTable(` aria-label={label}`),
    // Spread props may carry the name.
    dataTable(` {...props}`),
    // A caption under a condition.
    `<table>{title && <caption>{title}</caption>}<thead><tr><th>Item</th></tr></thead></table>`,
    `<table><caption className="caption-top">Builds</caption><thead><tr><th scope="col">Branch</th></tr></thead></table>`,
    // A layout table.
    `<table role="presentation"><tbody><tr><td>Logo</td><td>Address</td></tr></tbody></table>`,
    `<table role="none"><tr><th>Left</th><td>Right</td></tr></table>`,
    `<table role={role}><thead><tr><th>Item</th></tr></thead></table>`,
    // No header cells: not shown to be a data table.
    `<Table><TableBody><TableRow><TableCell>Logo</TableCell><TableCell>Address</TableCell></TableRow></TableBody></Table>`,
    // A child the rule does not know may draw the caption.
    `<Table><StockCaption /><StockRows /></Table>`,
    `<Table><TableHeader><TableRow><TableHead>Item</TableHead></TableRow></TableHeader>{children}</Table>`,
    // A table from another library, set up through props.
    `<Table dataSource={rows} columns={columns} />`,
    // Since the shadcn apps/v4 corpus.
    // A table in a figure with its caption beside it.
    `export const A = () => <figure><Table><TableHeader><TableRow><TableHead>Invoice</TableHead></TableRow></TableHeader><TableBody>{rows}</TableBody></Table><TableCaption>Recent invoices</TableCaption></figure>;`,
  ],
  invalid: [
    { code: dataTable(), errors: [{ messageId: "noTitle" }] },
    {
      // The untied Don't: a heading above, nothing tying it.
      code: `export function Untied() {
        return (
          <div>
            <h4 className="m-0 text-base font-semibold">Stock below reorder level</h4>
            <Table>
              <TableHeader><TableRow><TableHead scope="col">Item</TableHead><TableHead scope="col">On hand</TableHead></TableRow></TableHeader>
              <TableBody>{stock.map((s) => <TableRow key={s.item}><TableCell>{s.item}</TableCell></TableRow>)}</TableBody>
            </Table>
          </div>
        );
      }`,
      errors: [{ messageId: "noTitle" }],
    },
    {
      code: `<table className="w-full"><colgroup><col /></colgroup><thead><tr><th>Month</th><th>Total</th></tr></thead><tbody>{rows.map((r) => { return <tr key={r.id}><td>{r.month}</td></tr>; })}</tbody></table>`,
      errors: [{ messageId: "noTitle" }],
    },
    { code: `<table role="table"><tr><th>Item</th></tr></table>`, errors: [{ messageId: "noTitle" }] },
    {
      code: `<Table aria-describedby="note"><TableRow><TableHead>Item</TableHead></TableRow></Table>`,
      errors: [{ messageId: "noTitle" }],
    },
  ],
});
