---
id: ACT-007a
title: Offer a way without dragging for everything people can drag
short: No drag needed
area: actions
status: proposed
version: "1.0.0"
verdict: requirement
judges: { spoken: 3, agreeing: 3 }
law:
  - criterion: "2.5.7"
    name: Dragging Movements
    url: https://www.w3.org/TR/WCAG22/#dragging-movements
    relation: requires
  - criterion: "2.5.1"
    name: Pointer Gestures
    url: https://www.w3.org/TR/WCAG22/#pointer-gestures
    relation: supports
  - criterion: "2.1.1"
    name: Keyboard
    url: https://www.w3.org/TR/WCAG22/#keyboard
    relation: supports
stances:
  material: { stance: supports, sources: [material-bottom-sheets, material-loading-indicator-accessibility, material-gestures] }
  apple:    { stance: supports, sources: [apple-drag-and-drop, apple-gestures] }
  carbon:   { stance: supports, sources: [carbon-file-uploader, carbon-file-uploader-accessibility, carbon-slider-accessibility] }
  govuk:    { stance: supports, sources: [govuk-file-upload, govuk-question-pages] }
  nngroup:  { stance: supports, sources: [nngroup-drag-drop] }
conflicts_checked: 2026-11-25
check: review
how_to_check:
  - 'A dnd-kit `useSortable` or `useDraggable` item with no buttons, menu or field that makes the same move by pressing, such as "Move up", "Move down" or "Move to Done". A `KeyboardSensor` alone does not count.'
  - 'A react-dropzone `useDropzone` with `noClick: true` and no `Button` that calls `open()`, or any file drop area with no way to choose a file by pressing.'
  - 'A shadcn `Carousel` without `CarouselPrevious` and `CarouselNext`, a `ResizablePanel` with no button or menu that sets its size, or a Vaul `Drawer` with `modal={false}` and no close button.'
  - 'Custom drag code with `onPointerMove` or `onTouchMove` that sets a value or position, such as a knob or a two-thumb range, with no field or buttons beside it. Leave alone drawing and signature pads (see Exceptions).'
  - 'A swipe on a row as the only other way to an action, such as deleting or marking as paid, with no row menu or button for it.'
changelog:
  - version: "1.0.0"
    date: 2026-11-25
    note: First version.
---

## Rule

Anything people can do by dragging on the page can also be done with a single pointer and no dragging, such as buttons, a menu or a field. A keyboard route alone does not count, and the other way may not be a swipe or another gesture that follows a path.

## Why

A drag asks for a lot: press, hold, move and let go in the right place, all in one steady motion. People with a tremor, weak hands, a head pointer or a mouth stick, and anyone on a crowded train, can miss the spot or fail to hold on. [WCAG 2.2, 2.5.7 Dragging Movements](https://www.w3.org/TR/WCAG22/#dragging-movements) requires that whatever a drag does can also be done with a single pointer without dragging. The [Understanding page for 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) is clear that keyboard support is judged on its own: a person tapping on a phone or steering a head pointer has no keys to press, so they need something to click. A separate control elsewhere on the page is fine, as long as it gets the same result, and a field people type into counts too. It must not be a swipe or a flick, which [2.5.1 Pointer Gestures](https://www.w3.org/TR/WCAG22/#pointer-gestures) treats as a path. The keyboard route is a separate requirement and sits in KBD-001. Buttons and menus serve both at once, because they also take focus.

## Do

- On a *Sprint board* built with dnd-kit, give each card a `DropdownMenu` labelled *Move card* with *Move to To do*, *Move to In progress* and *Move to Done*. The card can still be dragged; the menu is the way without dragging.
- In a sortable list *Playlist order*, give each row *Move up* and *Move down* buttons, or a *Move to position* field that takes a number. The drag handle stays for those who like it.
- Make sure the drag handle `button` that carries dnd-kit's `{...listeners}` does not swallow the click that should open the row's menu. Test it by clicking without moving.
- Adding dnd-kit's `KeyboardSensor` is needed for KBD-001, but it does not meet this rule. Add the buttons or the menu as well.
- For an upload area built with react-dropzone, keep a real `Button` labelled *Choose file* that calls `open()`, or make the whole zone a button that opens the file picker and say so in its text: "Drop a file here or choose one". Do not set `noClick: true` without that button. Both 2.5.7 and 2.1.1 point to this; the Understanding page does not name file uploads.
- Keep the shadcn `Slider` as it is: a click on the track moves the thumb there. For a custom range picker such as *Budget, £0–£2,000*, put a labelled number `Input` beside each thumb, kept in step with it.
- Give a shadcn `Resizable` panel *Preview* a *Collapse preview* button or a menu with set widths, since the handle can only be dragged or moved with keys.
- Keep `CarouselPrevious` and `CarouselNext` on a shadcn `Carousel` that can be dragged, even when the design looks cleaner without them.
- A Vaul `Drawer` that closes by dragging down keeps a way to close it by pressing, such as a *Close* button or a click on the overlay, which a modal drawer closes on by default. A drawer with `modal={false}` has no overlay, so it needs the button.
- Rows with swipe actions, such as a swipe that marks a row in *Bills* as paid, keep the same actions in a row menu.
- In an image cropper *Crop photo*, offer set ratios such as *Square* and *4:3* and number fields for width and height. A map that pans by dragging gets arrow buttons and *Zoom in* and *Zoom out*.
- The controls may appear only once an item is selected. On a seating plan *Table layout*, a tap on a guest's pin shows *Move to table* with a list of tables. They must then be reachable without dragging and meet ACT-006 as targets.
- Our own advice, beyond the law: keep the other way visible. The law accepts a control that is visually hidden as long as a pointer can operate it, but a visible button is found by more people.
- A long press may start a drag on touch. The move that follows still needs a way without dragging.

## Don't

- Let the order of *Playlist order* change only by dragging rows, and count arrow keys while a row is picked up as the alternative.
- Offer a swipe left on a row as the only other way to delete it.
- Build a volume knob for *Master volume* from `div`s with only `onPointerMove`, so the level can be set only by dragging round the knob.
- Build a two-thumb range where a click on the track does nothing and there are no fields.
- Remove the arrows from a carousel because the slides can be dragged.
- Use a slider puzzle as a check before sign-in. It fails here as well as under FRM-008.

## Exceptions

- **The movement is the point.** When the path of the drag is the content, such as a signature pad or freehand drawing in *Inkhollow*, the drag is exempt. Putting an item in a chosen place is not exempt, because the place can be chosen by pressing. KBD-001 has the matching exception for the keyboard.
- **Scrolling that the browser provides.** Native scrolling, including `overflow` areas and the browser's own pull to refresh, is outside the rule. A custom area that blocks the browser's scrolling and moves its content by dragging is inside it again.
- **Neighbouring rules.** The keyboard route for the same task is KBD-001. What assistive technology hears during a keyboard move is ACT-007b, and the mark on the place where a dragged item will land is ACT-008. Undo after a move that loses something is DST-001a.
