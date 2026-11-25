import type { RuleExamples } from "./frame";
import { OutlineDemo, type HNode } from "./structure-demo";

/*
 * STR-003 (a guideline, our own choice): one h1 per view, and levels that
 * step down one at a time. Going back up may skip.
 *
 * The page is drawn and the heading list is indented by level. The Check
 * line is what a linter would say. Words and looks are the same in each
 * Don't, so only the level differs.
 */

const p = (text: string): HNode => ({ t: "p", text });

const right: HNode[] = [
  { t: "h", text: "Project settings", level: 1, look: 1 },
  { t: "h", text: "Members", level: 2, look: 2 },
  { t: "h", text: "Pending invitations", level: 3, look: 3 },
  { t: "h", text: "Current members", level: 3, look: 3 },
  { t: "h", text: "Admins", level: 4, look: 4 },
  { t: "h", text: "Billing address", level: 2, look: 2 },
  p("Back up from h4 to h2 is fine."),
];

const skipped: HNode[] = [
  { t: "h", text: "Project settings", level: 1, look: 1 },
  { t: "h", text: "Members", level: 2, look: 2 },
  { t: "h", text: "Pending invitations", level: 4, look: 3 },
  { t: "h", text: "Billing address", level: 2, look: 2 },
];

const two: HNode[] = [
  { t: "h", text: "Ridgeway", level: 1, look: 3 },
  p("The shared layout's header"),
  { t: "h", text: "Project settings", level: 1, look: 1 },
  { t: "h", text: "Members", level: 2, look: 2 },
];

const none: HNode[] = [
  p("The header shows a logo"),
  { t: "h", text: "Project settings", level: 2, look: 1 },
  { t: "h", text: "Members", level: 3, look: 2 },
];

const markdown: HNode[] = [
  { t: "h", text: "Spring launch", level: 1, look: 1 },
  { t: "h", text: "Comments", level: 2, look: 2 },
  p("A comment written in Markdown:"),
  { t: "card", children: [{ t: "h", text: "Launch checklist", level: 3, look: 3 }, p("Its own # heading, shifted down to h3")] },
];

export const STR003: RuleExamples = {
  id: "STR-003",
  examples: [
    {
      kind: "do",
      title: "One h1, one level at a time",
      caption: (
        <>
          The list steps down one level at a time and the Check line is clean. After <em>Admins</em> (h4) the page goes back to{" "}
          <em>Billing address</em> (h2) in one step, which is fine. This is our own choice, not something the judges decided.
        </>
      ),
      Demo: () => <OutlineDemo title="Project settings" nodes={right} check />,
    },
    {
      kind: "dont",
      title: "A level is skipped",
      caption: (
        <>
          <em>Pending invitations</em> is an <code>h4</code> straight under an <code>h2</code>. The gap in the list is what makes a
          person wonder what they missed.
        </>
      ),
      Demo: () => <OutlineDemo title="Project settings" nodes={skipped} check />,
    },
    {
      kind: "dont",
      title: "An h1 in the shell and one in the view",
      caption: (
        <>
          The shared layout puts the product name in an <code>h1</code> and each view adds its own. "Jump to the h1" has two
          answers and neither is clearly the main content.
        </>
      ),
      Demo: () => <OutlineDemo title="Project settings, in the app shell" nodes={two} check />,
    },
    {
      kind: "dont",
      title: "A view with no h1",
      caption: (
        <>
          The view starts at an <code>h2</code>, as when its title is a card title. There is no one place to begin.
        </>
      ),
      Demo: () => <OutlineDemo title="Project settings" nodes={none} check />,
    },
    {
      kind: "do",
      title: "Written Markdown sits below the h1",
      caption: (
        <>
          A comment's own top heading becomes an <code>h3</code> inside the <code>h2</code> <em>Comments</em>, so the view keeps its
          single <code>h1</code>.
        </>
      ),
      Demo: () => <OutlineDemo title="Spring launch" nodes={markdown} check />,
    },
  ],
};
