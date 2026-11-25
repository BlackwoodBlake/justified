import { DragDemo, type Col, type Drag } from "./drag-demo";
import { Still } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * ACT-008: mark where a dragged item would land, and only while it is over
 * that place.
 *
 * Each scene has a still picture of a card mid-drag above the live one,
 * since the mark exists only during a drag. Try the live one with the mouse
 * or with Space and the arrow keys; Escape clears the mark.
 *
 * line: a 2px line in the gap where the row would go. column: a thicker
 * border and a light fill on the column under the card, the card inside it
 * unmarked. stale: every column the card has passed stays marked. hue: only
 * the border changes colour, from grey to blue.
 */

const reading = (): Col[] => [
  {
    id: "r",
    title: "Reading list",
    code: "r1",
    items: [
      { id: "mid", label: "Middlemarch", code: "a1" },
      { id: "per", label: "Persuasion", code: "a2" },
      { id: "hob", label: "The Hobbit", code: "a3" },
      { id: "dra", label: "Dracula", code: "a4" },
    ],
  },
];

const board = (): Col[] => [
  {
    id: "t",
    title: "To do",
    code: "t1",
    items: [
      { id: "faq", label: "Draft the FAQ", code: "b1" },
      { id: "footer", label: "Update footer links", code: "b2" },
    ],
  },
  { id: "w", title: "In progress", code: "w1", items: [{ id: "login", label: "Fix login bug", code: "b3" }] },
  { id: "d", title: "Done", code: "d1", items: [{ id: "notes", label: "Write release notes", code: "b4" }] },
];

const listDrag: Drag = { id: "mid", from: { c: 0, i: 0 }, to: { c: 0, i: 2 }, by: "pointer", dx: 14, dy: 110, seen: [0] };
const boardDrag: Drag = { id: "faq", from: { c: 0, i: 0 }, to: { c: 1, i: 1 }, by: "pointer", dx: 24, dy: 70, seen: [0, 1] };
const staleDrag: Drag = { id: "faq", from: { c: 0, i: 0 }, to: { c: 2, i: 1 }, by: "pointer", dx: 8, dy: 190, seen: [0, 1, 2] };

function Pair({ still, note, children }: { still: React.ReactNode; note: string; children: React.ReactNode }) {
  return (
    <div className="grid w-full justify-items-center gap-4">
      <Still note={note}>{still}</Still>
      {children}
    </div>
  );
}

export const ACT008: RuleExamples = {
  id: "ACT-008",
  examples: [
    {
      kind: "do",
      title: "A line in the gap where the row would go",
      caption: (
        <>
          The still shows a row held over the third place with a 2-pixel line in the gap. Drag <em>Middlemarch</em> down
          by its handle: the line follows the pointer from gap to gap. Let go and the line is gone. Move the pointer off
          the list, or press Escape, and it is gone too. Space and the arrow keys show the same line.
        </>
      ),
      Demo: () => (
        <Pair
          note="Held over the third place."
          still={<DragDemo title="Reading list" layout="list" columns={reading()} mark="line" frozen={listDrag} />}
        >
          <DragDemo title="Reading list" layout="list" columns={reading()} mark="line" announce="words" />
        </Pair>
      ),
    },
    {
      kind: "do",
      title: "The column under the card, and only that one",
      caption: (
        <>
          Drag <em>Draft the FAQ</em> across the board. The column under the card gets a thicker border and a light fill,
          so it differs in weight and tone as well as hue. The card inside it is not marked, so one place takes the
          drop. The mark moves on with the card and is cleared on a drop or on Escape.
        </>
      ),
      Demo: () => (
        <Pair
          note="Held over In progress."
          still={<DragDemo title="Sprint board" layout="board" columns={board()} mark="column" frozen={boardDrag} />}
        >
          <DragDemo title="Sprint board" layout="board" columns={board()} mark="column" announce="words" />
        </Pair>
      ),
    },
    {
      kind: "dont",
      title: "Columns stay marked after the card has gone on",
      caption: (
        <>
          Drag <em>Draft the FAQ</em> from the top to the bottom column. Each column it passes stays marked until the
          drop, so the still shows three at once and nobody can tell which one will take the card.
        </>
      ),
      Demo: () => (
        <Pair
          note="Held over Done. Every column it passed is still marked."
          still={<DragDemo title="Sprint board" layout="board" columns={board()} mark="stale" frozen={staleDrag} />}
        >
          <DragDemo title="Sprint board" layout="board" columns={board()} mark="stale" announce="words" />
        </Pair>
      ),
    },
    {
      kind: "dont",
      title: "Only the border changes colour",
      caption: (
        <>
          Drag <em>Draft the FAQ</em> over a column. Its 1-pixel border turns from grey (<code>--input</code>) to blue
          (<code>--primary</code>) with the same weight and no fill. The two differ by about 2.2 to 1 in lightness
          in the light theme and 1.8 to 1 in the dark one, under the 3:1 that VIS-003a asks for, so the change is a
          change of hue and little else, and it is easy to miss which column is meant.
        </>
      ),
      Demo: () => (
        <Pair
          note="Held over In progress. Only the border colour differs."
          still={<DragDemo title="Sprint board" layout="board" columns={board()} mark="hue" frozen={boardDrag} />}
        >
          <DragDemo title="Sprint board" layout="board" columns={board()} mark="hue" announce="words" />
        </Pair>
      ),
    },
  ],
};
