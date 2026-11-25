import { Tallowbrook } from "./nav-demo";
import type { RuleExamples } from "./frame";

/*
 * NAV-002a (a requirement): when a menu shows the current page, the code or
 * the text says so too.
 *
 * Each scene is the drawn Tallowbrook sidebar: real links whose click is held
 * back, in a labelled group and not a nav, so the host page gets no extra
 * landmark. A readout under the scene shows what the highlighted item's
 * markup exposes and how a screen reader says it. Every Don't still
 * shows the highlight, so only the code differs.
 */

export const NAV002a: RuleExamples = {
  id: "NAV-002a",
  examples: [
    {
      kind: "do",
      title: "The highlighted item says it is current",
      caption: (
        <>
          <em>Invoices</em> is highlighted and carries <code>aria-current="page"</code>. Choose another item: the highlight
          and the code move together, and only one item has the mark. The items are real links, and the click is held back so the page does not move.
        </>
      ),
      Demo: () => <Tallowbrook mark="item" />,
    },
    {
      kind: "dont",
      title: "Only a highlight, nothing in the code",
      caption: (
        <>
          The highlight is the same, but the item has no <code>aria-current</code>. A person who cannot see the highlight
          hears "Invoices, link" and learns nothing about where they are.
        </>
      ),
      Demo: () => <Tallowbrook mark="none" />,
    },
    {
      kind: "do",
      title: "A page inside a section marks the section",
      caption: (
        <>
          This is invoice INV-0042, which is not in the menu, so <em>Invoices</em>, the section the person is in, has{" "}
          <code>"true"</code>. Press <em>Back to invoices</em> and it changes to <code>"page"</code>. <em>Open INV-0042</em>{" "}
          brings it back.
        </>
      ),
      Demo: () => <Tallowbrook mark="item" withDetail initial={{ item: "invoices", detail: "INV-0042" }} />,
    },
    {
      kind: "dont",
      title: "The mark sits on the list item",
      caption: (
        <>
          The attribute is on the <code>li</code> around the link, not on the link. When Tab or a list of links reaches the
          link, it is read as "Invoices, link", without "current page". Choose another item to see the mark move on the
          wrong element.
        </>
      ),
      Demo: () => <Tallowbrook mark="li" />,
    },
  ],
};
