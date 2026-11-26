---
id: LAY-003b
title: Keep all text and functions intact when people widen the text spacing
short: Text spacing
area: layout
status: proposed
version: "1.0.0"
verdict: requirement
judges: { spoken: 1, agreeing: 1 }
law:
  - criterion: "1.4.12"
    name: Text Spacing
    url: https://www.w3.org/TR/WCAG22/#text-spacing
    relation: requires
  - criterion: "1.4.4"
    name: Resize Text
    url: https://www.w3.org/TR/WCAG22/#resize-text
    relation: supports
stances:
  material: { stance: supports, sources: [material-text-truncation] }
  apple:    { stance: silent }
  carbon:   { stance: silent }
  govuk:    { stance: silent }
  nngroup:  { stance: silent }
conflicts_checked: 2026-11-26
check: runtime
how_to_check:
  - 'Apply line height 1.5, letter spacing 0.12em and word spacing 0.16em to every element, and 2em after paragraphs, with a bookmarklet or user style. Look over every view, open menus, dialogs, toasts, tabs and table cells included, for text that is cut off, hidden or overlapping.'
  - 'An element holding text with a fixed `h-*` or `max-h-*` and `overflow-hidden`, or with a fixed height and nothing else, where one more line would be cut or spill over the next element.'
  - 'A label with `truncate` or `whitespace-nowrap` inside a fixed width or height, such as a sidebar item, tab or pill, that is cut off under the wider spacing and has no way to the full text (see Exceptions).'
changelog:
  - version: "1.0.0"
    date: 2026-11-26
    note: First version.
---

## Rule

When a person sets line height to 1.5 times the font size, space after paragraphs to 2 times, letter spacing to 0.12 times and word spacing to 0.16 times, no text is cut off, hidden or laid over other content, and every function still works. The page need not use these values itself.

## Why

Some people with low vision or dyslexia read much better when lines, words and letters sit further apart, and they set this with a browser extension, a bookmarklet or a style sheet of their own. A layout that was measured to the pixel for the default spacing then cuts off the last line of a card or turns a tab label into half a word. [WCAG 2.2, 1.4.12 Text Spacing](https://www.w3.org/TR/WCAG22/#text-spacing) requires that nothing is lost when those four values are applied and no other style is changed. The values are the floor of the test; people may choose more. The criterion does not ask the page to use them by default or to offer a control for them; it asks the page to survive them. The Working Group documents the usual break, text in a box that cannot grow, clipped or spilling over its neighbour, as a failure ([F104](https://www.w3.org/WAI/WCAG22/Techniques/failures/F104)). The same boxes often break when text grows in size, which is LAY-003a.

## Do

- In a volunteer rota app, the badge "Needs 2 more volunteers" on a shift card has `px-2 py-0.5` and no height of its own, so a taller line or wider word spacing makes the badge bigger rather than cutting it. A row of such badges uses `flex flex-wrap gap-2`, so a badge that no longer fits moves to the next line.
- Let a shift's description set the card's height: `min-h-*` instead of `h-*`, vertical padding instead of a fixed height, and grid rows that size to their content.
- Clamp a long description with `line-clamp-3` only where the full text is one step away: the card's title *Saturday morning, food bank* is a link to the shift page, which shows the description in full.
- Let sidebar items, tabs, segmented controls and nav pills grow with their label. These often have a fixed height together with `overflow-hidden` or `truncate` on the label. Test the ones you use rather than assuming they pass.
- Let a sidebar item such as *Community kitchen volunteers* wrap onto a second line rather than truncate it. If it must stay on one line, make the full name one step away, such as on the page the item opens. A tooltip that also opens on focus is enough only when the visible part, such as *Community kitchen…*, still tells the item apart from the others (TXT-002b).
- A button with a fixed height and a one-line label, such as Justified's `Button` with `h-10`, usually still fits the taller line. Check any button whose label could wrap under the wider spacing, for example in a narrow column.
- Test with all four values at once and nothing else changed: `line-height: 1.5`, `letter-spacing: 0.12em` and `word-spacing: 0.16em` on every element, and `margin-bottom: 2em` on paragraphs. Open menus, dialogs and toasts during the test.

## Don't

- Give the chip "Morning shift, front desk" `h-6 overflow-hidden`, so the wider spacing pushes half of it out of sight.
- Clamp a description by hand with `max-h-[3rem] overflow-hidden` on a card that links nowhere, so the person never learns that the shift needs closed-toe shoes.
- Give a card a fixed height without `overflow-hidden`, so its text runs over the *Sign up for shift* button below it.
- Give the tabs *Open shifts*, *My shifts* and *Swap requests* `w-28 truncate`, so they read "Swap reque…" under the wider spacing, with no way to read the rest.
- Add `!leading-tight` or `!tracking-tight` to body text. The criterion does not forbid `!important` as such, but it can stop a person's own spacing from taking effect, so we advise against it on these properties. That is our own advice.

## Exceptions

- **A script that lacks a property.** Text in a writing system that does not use one of the four properties, such as paragraph spacing in some scripts, is tested only on the properties it uses.
- **Truncation with a way to the whole.** Let text wrap or its box grow first. Where that cannot be done, an ellipsis is acceptable when it is clear that more can be seen and the full text is one step away, such as a card that is visibly a link to a page with the text in full. A tooltip may be that way only when the visible part still tells the item apart from the others and is enough to use it, and it opens on focus too; what the person needs stays on the page (TXT-002b).
- **The person's tool fails.** If an extension or bookmarklet cannot apply the values, the page is not at fault, unless the page itself stops them.
- **Images of text and captions in the picture.** Text in an image, text drawn on a `canvas` and captions burned into a video's picture are outside this rule.
- **Neighbouring rules.** Text that grows in size is LAY-003a, and reflow at 320 pixels is LAY-001, which covers `truncate` and `line-clamp-*` at that width.
