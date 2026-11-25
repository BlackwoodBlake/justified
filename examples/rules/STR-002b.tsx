import type { RuleExamples } from "./frame";
import { OutlineDemo, type HNode } from "./structure-demo";

/*
 * STR-002b (a requirement): a heading says what the part below it holds.
 *
 * Every heading here is a real heading at the right level, so each Don't
 * breaks only the wording. The heading list is the point: people who use it
 * hear the headings without the content under them.
 */

const p = (text: string): HNode => ({ t: "p", text });

const named: HNode[] = [
  { t: "h", text: "Spring launch", level: 1, look: 1 },
  { t: "card", children: [{ t: "h", text: "Dates", level: 2, look: 2 }, p("1 March to 30 April")] },
  { t: "card", children: [{ t: "h", text: "Owner", level: 2, look: 2 }, p("Maya Lindqvist")] },
  { t: "card", children: [{ t: "h", text: "Tags", level: 2, look: 2 }, p("design, launch")] },
];

const vague: HNode[] = [
  { t: "h", text: "Spring launch", level: 1, look: 1 },
  { t: "card", children: [{ t: "h", text: "Details", level: 2, look: 2 }, p("1 March to 30 April")] },
  { t: "card", children: [{ t: "h", text: "Info", level: 2, look: 2 }, p("Maya Lindqvist")] },
  { t: "card", children: [{ t: "h", text: "Misc", level: 2, look: 2 }, p("design, launch")] },
];

const numbered: HNode[] = [
  { t: "h", text: "Project settings", level: 1, look: 1 },
  { t: "card", children: [{ t: "h", text: "Section 1", level: 2, look: 2 }, p("Maya Lindqvist, Tomas Reyes and 2 more")] },
  { t: "card", children: [{ t: "h", text: "Section 2", level: 2, look: 2 }, p("14 Alder Lane, Bristol")] },
];

const hiddenWords: HNode[] = [
  { t: "h", text: "Spring launch", level: 1, look: 1 },
  { t: "card", children: [{ t: "h", text: "Activity", hidden: " in Spring launch", level: 2, look: 2 }, p("Maya added a date, 2 hours ago")] },
  { t: "card", children: [{ t: "h", text: "Members", hidden: " of Spring launch", level: 2, look: 2 }, p("Maya Lindqvist, Tomas Reyes")] },
];

export const STR002b: RuleExamples = {
  id: "STR-002b",
  examples: [
    {
      kind: "do",
      title: "Headings name their part",
      caption: (
        <>
          Press <em>Next heading</em>. Without the cards, the list still says what each part is: dates, owner, tags.
        </>
      ),
      Demo: () => <OutlineDemo title="Spring launch" nodes={named} />,
    },
    {
      kind: "dont",
      title: "Headings that fit any card",
      caption: (
        <>
          The cards hold the same things, but are headed <em>Details</em>, <em>Info</em> and <em>Misc</em>. The heading list tells a
          person nothing, so they open each card to find out.
        </>
      ),
      Demo: () => <OutlineDemo title="Spring launch" nodes={vague} />,
    },
    {
      kind: "dont",
      title: "Numbered sections",
      caption: (
        <>
          <em>Section 1</em> and <em>Section 2</em> say nothing about the members or the billing address below them.
        </>
      ),
      Demo: () => <OutlineDemo title="Project settings" nodes={numbered} />,
    },
    {
      kind: "do",
      title: "Short on screen, clear out of context",
      caption: (
        <>
          The visible heading stays short, <em>Activity</em>. A visually hidden span adds the rest, so in the list it is read as
          "Activity in Spring launch". Press <em>Next heading</em> to hear it.
        </>
      ),
      Demo: () => <OutlineDemo title="Spring launch" nodes={hiddenWords} />,
    },
  ],
};
