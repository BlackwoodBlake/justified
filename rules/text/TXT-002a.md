---
id: TXT-002a
title: Let people close, hover and keep content that appears on hover or focus
short: Hover content
area: text
status: decided
version: "1.0.0"
verdict: requirement
judges: { spoken: 1, agreeing: 1 }
law:
  - criterion: "1.4.13"
    name: Content on Hover or Focus
    url: https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus
    relation: requires
  - criterion: "2.1.1"
    name: Keyboard
    url: https://www.w3.org/TR/WCAG22/#keyboard
    relation: supports
stances:
  material: { stance: silent }
  apple:    { stance: silent }
  carbon:   { stance: supports, sources: [carbon-tooltip, carbon-tooltip-accessibility] }
  govuk:    { stance: silent }
  nngroup:  { stance: silent }
conflicts_checked: 2026-11-22
check: runtime
how_to_check:
  - 'Open each tooltip and hover card by hover and by keyboard focus, press Escape, and see whether it closes while the pointer and focus stay where they are.'
  - 'Move the pointer from the trigger onto the content and rest there, and see whether it stays open on the way and for as long as the pointer is on it.'
  - 'Hover content built by hand with `onMouseEnter` and `onMouseLeave`, closed when the pointer leaves the trigger alone, with no Escape key handler, or closed by a `setTimeout` while still hovered.'
  - 'Radix settings that change this: `disableHoverableContent` on `Tooltip` or `TooltipProvider`, or `closeDelay={0}` on a `HoverCard` that sits apart from its trigger.'
  - 'Leave alone the browser''s own `title` tooltip, content opened by a click, tap or Enter such as `Popover` or `DropdownMenu`, and Escape for content that reports an input error (see Exceptions).'
changelog:
  - version: "1.0.0"
    date: 2026-11-22
    note: First version.
---

## Rule

Content that appears on hover or keyboard focus can be closed without moving the pointer or focus, usually with Escape. If hover opens it, the pointer can move onto it without it closing. It stays until the hover or focus that opened it ends, the person closes it, or it is no longer true.

## Why

A tooltip, a hover card or a link preview can cover what the person is reading or about to click. If the only way to get rid of it is to move the pointer, someone who uses a screen magnifier loses their place, and a keyboard user has to Tab away from the control they meant to use. If the content closes as soon as the pointer leaves the trigger, a person who needs a large cursor or high zoom cannot move onto it to read it. If it closes on a timer, slow readers miss it. [WCAG 2.2, 1.4.13 Content on Hover or Focus](https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus) requires all three conditions. Whatever closes the content must itself work from the keyboard, which supports [2.1.1 Keyboard](https://www.w3.org/TR/WCAG22/#keyboard). TXT-002b covers when a tooltip opens and what it may hold.

## Do

- An icon button with the accessible name "Copy link" shows the tooltip "Copy link" on hover and on focus. Pressing Escape hides the tooltip while focus stays on the button, so the next Enter still copies the link.
- A name in a comment thread, such as *Priya Shah*, opens a hover card with her role and team. The card sits right against the name, so the pointer can slide onto it and rest there while the person reads.
- A link to the document *Budget 2027* shows a preview on hover. The preview stays as long as the pointer is on the link or the preview, however long that takes.
- A meeting in a shared calendar opens a hover card that names the room, *Oak room*. When the organiser cancels the meeting, the card closes, because what it showed is no longer true.
- A short delay before closing, after the pointer has left both the trigger and the content, is fine. It makes the path from trigger to content forgiving.
- When focus opened the content, close it as soon as focus moves on, so it never lingers over the element that now has focus. KBD-002 covers what may hide the focused element.
- Inside a dialog, let the first Escape close only the open tooltip or hover card, and the next one close the dialog, as DLG-001 does for other popups.
- If you use shadcn's `Tooltip` or `HoverCard`, check in your own build that Escape closes the content, that the pointer can reach it without a gap closing it, and that no wrapper or custom delay changes this.

## Don't

- Hide a hover card only when the pointer moves away, with no key that closes it.
- Leave a gap between the trigger and the tooltip, so the content closes on the way there.
- Close a link preview after a fixed number of seconds while the pointer still rests on it.
- Make Escape close the whole dialog while a tooltip inside it is still open.
- Keep a tooltip that focus opened on screen after focus has moved on, so it covers the newly focused field.

## Exceptions

- **Content the browser draws.** A tooltip the browser draws and the author does not restyle, such as the one from the `title` attribute, is not covered. That is no reason to choose it: it does not open on keyboard focus, and under ACT-001b it must not be a button's name.
- **Errors and content that covers nothing.** The need to close without moving does not apply when the content reports an input error, or when it covers nothing that matters, not even its own trigger. It must still be hoverable and stay. FRM-002a already asks for field errors as visible text at the field.
- **Out of scope.** Content opened by a click, a tap or Enter, such as a toggletip, a popover or a menu, is not covered. Neither is an element that is hidden until it gets focus, such as a skip link, or a modal dialog.
- **Not decided here.** Whether content that appears on hover may hold links or buttons is not covered by this rule.
