import { DragDemo, type Col } from "./drag-demo";
import type { RuleExamples } from "./frame";

/*
 * ACT-007a: everything people can drag can also be done with a single
 * pointer and no dragging.
 *
 * Two Do scenes from the rule's own text. A playlist has Move up and Move
 * down on each row. A sprint board has cards that open a Move to row when
 * tapped. Both keep the drag handle and the keyboard route. The Don't has the
 * handle and the keyboard only: arrow keys count for KBD-001 and not here.
 *
 * Moving by the buttons is a status message (FBK-004): a polite line says
 * what moved, and a card that changes column gets focus back.
 */

const playlist = (): Col[] => [
  {
    id: "p",
    title: "Playlist order",
    code: "p1",
    items: [
      { id: "night", label: "Night drive", code: "a1" },
      { id: "river", label: "Slow river", code: "a2" },
      { id: "boats", label: "Paper boats", code: "a3" },
      { id: "train", label: "Late train", code: "a4" },
      { id: "salt", label: "Salt flats", code: "a5" },
    ],
  },
];

const sprint = (): Col[] => [
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

export const ACT007a: RuleExamples = {
  id: "ACT-007a",
  examples: [
    {
      kind: "do",
      title: "Move up and Move down on each row",
      caption: (
        <>
          Drag a row by its handle, or press <em>Move Slow river down</em> once with the pointer. The row moves one
          place and a line under the list says where it is now. The handle and the keyboard route stay for those who
          like them.
        </>
      ),
      Demo: () => <DragDemo title="Playlist order" layout="list" columns={playlist()} buttons announce="words" visibleStatus />,
    },
    {
      kind: "do",
      title: "Tap a card, then choose a column",
      caption: (
        <>
          Tap <em>Fix login bug</em>. Its <em>Move to</em> buttons appear, one for each other column. Press{" "}
          <em>Move to Done</em> and the card lands there, focus returns to it and the line below says so. The card can
          still be dragged, and the controls are 32 pixels tall or more.
        </>
      ),
      Demo: () => <DragDemo title="Sprint board" layout="board" columns={sprint()} mark="column" pick announce="words" visibleStatus />,
    },
    {
      kind: "dont",
      title: "Dragging, and arrow keys while picked up",
      caption: (
        <>
          Pick up <em>Paper boats</em> with Space and press the arrow keys: the keyboard route works and meets KBD-001.
          But a person with a head pointer or one finger has only the drag handle, and there is nothing to press that
          does the same. Arrow keys are not a single-pointer way.
        </>
      ),
      Demo: () => <DragDemo title="Playlist order" layout="list" columns={playlist()} announce="words" visibleStatus />,
    },
  ],
};
