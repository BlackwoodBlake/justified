import type { RuleExamples } from "./frame";
import { TabStill, TitleApp, type TitleView } from "./structure-demo";

/*
 * STR-001 (a requirement): every page has a title that says what it is for,
 * and a single page app sets a new one on every view.
 *
 * The app is a small bookkeeping tool, Fernhill. The tab is drawn and the
 * history list shows what each visit leaves behind. The real page's title is
 * never touched. Each Don't breaks only this rule: the views and their
 * headings are the same as in the Do.
 */

const NAME = "Fernhill";

const distinct: TitleView[] = [
  { id: "invoices", label: "Invoices", path: "/invoices", heading: "Invoices", title: `Invoices – ${NAME}` },
  { id: "invoice", label: "Invoice 2026-114", path: "/invoices/2026-114", heading: "Invoice 2026-114", title: `Invoice 2026-114 – ${NAME}`, loading: `Invoice – ${NAME}` },
  { id: "customers", label: "Customers", path: "/customers", heading: "Customers", title: `Customers – ${NAME}` },
  { id: "settings", label: "Settings", path: "/settings", heading: "Settings", title: `Settings – ${NAME}` },
];

const same: TitleView[] = distinct.map((v) => ({ ...v, title: NAME, loading: undefined }));

const leaking: TitleView[] = distinct.map((v) => (v.loading ? { ...v, loading: `undefined – ${NAME}` } : v));

const email = "anna.berg@example.com";
const personal: TitleView[] = [
  { id: "dashboard", label: "Dashboard", path: "/", heading: "Dashboard", title: `${email} – Dashboard` },
  { id: "invoices", label: "Invoices", path: "/invoices", heading: "Invoices", title: `${email} – Invoices` },
  { id: "customers", label: "Customers", path: "/customers", heading: "Customers", title: `${email} – Customers` },
];

export const STR001: RuleExamples = {
  id: "STR-001",
  examples: [
    {
      kind: "do",
      title: "Each view sets its own title",
      caption: (
        <>
          Choose a view. The tab changes to name it, with the product last, and the history list tells every visit apart.{" "}
          <em>Invoice 2026-114</em> loads for a moment: the tab says "Invoice" at once and gets the number when the data arrives.
        </>
      ),
      Demo: () => <TitleApp views={distinct} appName={NAME} />,
    },
    {
      kind: "dont",
      title: "One title on every view",
      caption: (
        <>
          Choose a view. The heading changes, but the title was set once in the root layout and every tab and every history entry
          reads "Fernhill". With ten tabs open, none can be told from another.
        </>
      ),
      Demo: () => <TitleApp views={same} appName={NAME} />,
    },
    {
      kind: "dont",
      title: "A placeholder leaks into the title",
      caption: (
        <>
          Choose <em>Invoice 2026-114</em>. While the data loads, the title is built from a value that does not exist yet, and the
          tab reads "undefined – Fernhill". The still shows the moment; the history keeps the final title.
        </>
      ),
      Demo: () => (
        <div className="grid w-full max-w-md gap-4">
          <TabStill title={`undefined – ${NAME}`} path="fernhill.example/invoices/2026-114" note="The tab while the invoice loads." />
          <TitleApp views={leaking} appName={NAME} />
        </div>
      ),
    },
    {
      kind: "dont",
      title: "A personal detail in the title",
      caption: (
        <>
          Choose a view. Every title starts with the signed-in person's email address. Titles travel into history, shared screens
          and reports, and the address is not what tells the views apart.
        </>
      ),
      Demo: () => <TitleApp views={personal} appName="Fernhill" />,
    },
  ],
};
