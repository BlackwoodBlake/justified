import type { RuleExamples } from "./frame";
import { OutlineDemo, type HNode } from "./structure-demo";

/*
 * STR-002a (a requirement): text that heads a part is a heading in code.
 *
 * The page is drawn and the heading list is what the code exposes. Every
 * chip names the element in code. The Don'ts differ from the Do only in
 * the element: same words, same look.
 */

const body = (a: string): HNode => ({ t: "p", text: a });

const doNodes: HNode[] = [
  { t: "h", text: "Project settings", level: 1, look: 1 },
  { t: "h", text: "Members", level: 2, look: 2 },
  body("Maya Lindqvist, Tomas Reyes and 2 more"),
  { t: "h", text: "Billing address", level: 2, look: 2 },
  body("14 Alder Lane, Bristol"),
  { t: "h", text: "Delete project", level: 2, look: 2 },
  body("This cannot be undone."),
];

const styledNodes: HNode[] = [
  { t: "h", text: "Project settings", level: null, look: 1, tag: "p" },
  { t: "h", text: "Members", level: null, look: 2, tag: "div" },
  body("Maya Lindqvist, Tomas Reyes and 2 more"),
  { t: "h", text: "Billing address", level: null, look: 2, tag: "div" },
  body("14 Alder Lane, Bristol"),
  { t: "h", text: "Delete project", level: null, look: 2, tag: "div" },
  body("This cannot be undone."),
];

const priceNodes: HNode[] = [
  { t: "h", text: "Choose a plan", level: 1, look: 1 },
  {
    t: "card",
    children: [
      { t: "h", text: "Team", level: 2, look: 2 },
      { t: "h", text: "€12 a month", level: 3, look: 3 },
      body("Up to 10 members"),
    ],
  },
];

export const STR002a: RuleExamples = {
  id: "STR-002a",
  examples: [
    {
      kind: "do",
      title: "Section titles are headings",
      caption: (
        <>
          Press <em>Next heading</em> as a screen reader's heading key would. It steps through the page's <code>h1</code> and each section.
          The chips show every title is a heading element, styled with classes to look as it does.
        </>
      ),
      Demo: () => <OutlineDemo title="Project settings" nodes={doNodes} />,
    },
    {
      kind: "dont",
      title: "Styled text, not headings",
      caption: (
        <>
          Same page, same looks, but the titles are a <code>p</code> and <code>div</code> with bold type. The heading list is empty
          and <em>Next heading</em> has nowhere to go: to a screen reader the page has no sections.
        </>
      ),
      Demo: () => <OutlineDemo title="Project settings" nodes={styledNodes} />,
    },
    {
      kind: "dont",
      title: "A price marked as a heading",
      caption: (
        <>
          The plan card is headed <em>Team</em>, but the price is an <code>h3</code> too so that it stands out. A price heads nothing,
          and the heading list now offers it as a section.
        </>
      ),
      Demo: () => <OutlineDemo title="Plans" nodes={priceNodes} />,
    },
  ],
};
