---
id: ACT-007b
title: Tell assistive technology what each step of a keyboard move did
short: Announce keyboard moves
area: actions
status: proposed
version: "1.0.0"
verdict: insufficient-evidence
judges: { spoken: 0, agreeing: 0 }
law:
  - criterion: "4.1.2"
    name: Name, Role, Value
    url: https://www.w3.org/TR/WCAG22/#name-role-value
    relation: supports
  - criterion: "4.1.3"
    name: Status Messages
    url: https://www.w3.org/TR/WCAG22/#status-messages
    relation: supports
  - criterion: "2.1.1"
    name: Keyboard
    url: https://www.w3.org/TR/WCAG22/#keyboard
    relation: supports
stances:
  material: { stance: silent }
  apple:    { stance: silent }
  carbon:   { stance: silent }
  govuk:    { stance: silent }
  nngroup:  { stance: supports, sources: [nngroup-drag-drop] }
conflicts_checked: 2026-11-25
changelog:
  - version: "1.0.0"
    date: 2026-11-25
    note: First version.
---

## Rule

When an item can be moved with the keyboard, tell assistive technology in words when it is picked up, where it is after each step, and where it was dropped or that the move was cancelled, using its visible label and positions such as "2 of 5".

## Why

KBD-001 makes sure a sortable list or a board can be rearranged with keys. For a person who cannot see the screen, that is only half the job: they press an arrow key and the row moves, but nothing tells them where it is now, so they cannot know when to stop. A few words at each step turn the keys into something they can steer. WCAG does not ask for this in every case. [WCAG 2.2, 4.1.2 Name, Role, Value](https://www.w3.org/TR/WCAG22/#name-role-value) asks that the handle has a name and a role, not a running account of the move. [4.1.3 Status Messages](https://www.w3.org/TR/WCAG22/#status-messages) applies when the product shows a line of text about the move, and then FBK-004 says how it is announced; a row that only shifts on screen is not a status message. [2.1.1 Keyboard](https://www.w3.org/TR/WCAG22/#keyboard) requires the keyboard route itself, which is KBD-001.

## Our reasons

None of the three judges speaks to telling assistive technology what a move did, so the verdict is Insufficient evidence (0 of 3 judges spoke) and this guideline is our choice. NN/g, an expert witness who does not vote, supports it. We ask for it for three reasons.

- **A keyboard route without words is a route only for sighted people.** KBD-001 requires that the move works with keys. A screen reader user who cannot tell where the item is cannot finish the move, so the requirement does them little good.
- **The tools already do it, badly by default.** dnd-kit speaks during a keyboard move out of the box, but it names items by their `id`. A sentence such as "Picked up draggable item 3f9a" is worse than silence. Writing the four messages takes a few lines.
- **It costs others nothing.** The messages go to a live region that sighted people do not see.

## Do

- In dnd-kit, pass `accessibility.announcements` to `DndContext` with `onDragStart`, `onDragOver`, `onDragEnd` and `onDragCancel`. In a list *Reading list*: "Picked up The Hobbit, position 3 of 6", "The Hobbit, position 2 of 6", "Dropped The Hobbit at position 2 of 6".
- On a board, name the column and the place in it: "Fix login bug, Done, 1 of 3".
- On Escape, say the item is back: "Move cancelled. Fix login bug is back in In progress, 2 of 4".
- Set `screenReaderInstructions` to say which keys pick up, move and drop. Our own choice, not part of the guideline: Space to pick up and drop, the arrow keys to move, Escape to cancel.
- Give each handle a name, as 4.1.2 asks. Putting the item in it, such as "Reorder The Hobbit", is our own choice.
- Keep the live region in the page before the first move, as FBK-004 says. dnd-kit does this for you; a region of your own must sit outside the list that re-renders.
- Our own advice: after the drop, keep focus on the moved item's handle, even when the re-order renders the row again, so focus does not fall to the top of the page. That serves [WCAG 2.2, 2.4.3 Focus Order](https://www.w3.org/TR/WCAG22/#focus-order).
- When the item is moved through the menu from ACT-007a, such as *Move to Done*, focus returns to the item and a short line "Moved to Done" is shown. That line is a status message, so FBK-004 applies.

## Don't

- Add `KeyboardSensor` and `sortableKeyboardCoordinates` and leave the default messages that read out ids.
- Use `aria-grabbed` or `aria-dropeffect`. Both are deprecated and not supported by screen readers.
- Write a message from a `pointermove` handler of your own, so the live region speaks at every pixel the item moves.
- Give positions in pixels or as an index starting at zero.
- Put the live region inside the sortable list, so it is rebuilt on every move and nothing is read.

## Exceptions

- **Pointer drags.** This guideline asks for words only for keyboard moves. dnd-kit writes its messages for pointer drags too, and that does no harm. The mark on the landing place is ACT-008.
- **A product that chooses otherwise.** This is a guideline. A product that leaves it out still meets KBD-001 and, for any text it shows, FBK-004.
