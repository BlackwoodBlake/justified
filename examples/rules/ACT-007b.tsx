import { DragDemo, type Col } from "./drag-demo";
import type { RuleExamples } from "./frame";

/*
 * ACT-007b (a guideline, our own choice): tell assistive technology what
 * each step of a keyboard move did.
 *
 * The live region sits outside the list and is real. A dashed box repeats
 * what it says as text, since the point cannot be seen: it is hidden from
 * assistive technology, which already hears the region. Every example has the
 * same handles, keys and focus, so each Don't breaks only the words.
 *
 * words: item labels, positions counted from one, the column on a board, and
 * a message for Escape. ids: the messages a library gives by default, which
 * name items by their id. zero: positions counted from zero.
 */

const reading = (): Col[] => [
  {
    id: "r",
    title: "Reading list",
    code: "r1",
    items: [
      { id: "mid", label: "Middlemarch", code: "3f9a" },
      { id: "per", label: "Persuasion", code: "7c20" },
      { id: "hob", label: "The Hobbit", code: "b41e" },
      { id: "dra", label: "Dracula", code: "09d5" },
      { id: "reb", label: "Rebecca", code: "e6a3" },
      { id: "emm", label: "Emma", code: "52bf" },
    ],
  },
];

const board = (): Col[] => [
  {
    id: "t",
    title: "To do",
    code: "c41e",
    items: [
      { id: "faq", label: "Draft the FAQ", code: "1a9f" },
      { id: "footer", label: "Update footer links", code: "8d02" },
    ],
  },
  {
    id: "w",
    title: "In progress",
    code: "5c1e",
    items: [
      { id: "search", label: "Add search", code: "a7b3" },
      { id: "login", label: "Fix login bug", code: "3f9a" },
      { id: "copy", label: "Review the copy", code: "d640" },
      { id: "export", label: "Export report", code: "2e8c" },
    ],
  },
  {
    id: "d",
    title: "Done",
    code: "9b77",
    items: [
      { id: "inv", label: "Check invoices", code: "f013" },
      { id: "notes", label: "Write release notes", code: "6a5d" },
    ],
  },
];

export const ACT007b: RuleExamples = {
  id: "ACT-007b",
  examples: [
    {
      kind: "do",
      title: "Labels and positions at every step",
      caption: (
        <>
          Tab to <em>Reorder The Hobbit</em>, press Space, then the arrow keys, then Space again. The box shows what the
          live region says: the title and its place, such as "position 2 of 6". Press Escape instead of Space and it
          says where the book is back. Focus stays on the handle after the drop. This is a guideline, our own choice.
        </>
      ),
      Demo: () => <DragDemo title="Reading list" layout="list" columns={reading()} announce="words" log />,
    },
    {
      kind: "do",
      title: "On a board, the column too",
      caption: (
        <>
          Pick up <em>Fix login bug</em> and press the down arrow a few times. It walks through every column, and each
          step names the card, the column and the place: "Fix login bug, Done, 1 of 3". A drop with the pointer is
          announced the same way. This is a guideline, our own choice.
        </>
      ),
      Demo: () => <DragDemo title="Sprint board" layout="board" columns={board()} mark="column" announce="words" log />,
    },
    {
      kind: "dont",
      title: "The library's default, which reads out ids",
      caption: (
        <>
          Pick up <em>The Hobbit</em> and press the down arrow. The region says "Draggable item b41e was moved over
          droppable area r1": nothing a person can use. The keys work, and the words only say an id.
        </>
      ),
      Demo: () => <DragDemo title="Reading list" layout="list" columns={reading()} announce="ids" log />,
    },
    {
      kind: "dont",
      title: "Positions counted from zero",
      caption: (
        <>
          Pick up <em>Middlemarch</em>. It is called "index 0", and the last of six books is "index 5". A reader who
          counts from one hears a place that does not match the list.
        </>
      ),
      Demo: () => <DragDemo title="Reading list" layout="list" columns={reading()} announce="zero" log />,
    },
  ],
};
