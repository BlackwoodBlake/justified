---
id: VIS-003a
title: Never let colour be the only sign of what something means or which state it is in
short: Not by colour alone
area: visual
status: proposed
version: "1.0.1"
verdict: requirement
judges: { spoken: 2, agreeing: 2 }
law:
  - criterion: "1.4.1"
    name: Use of Color
    url: https://www.w3.org/TR/WCAG22/#use-of-color
    relation: requires
  - criterion: "1.4.11"
    name: Non-text Contrast
    url: https://www.w3.org/TR/WCAG22/#non-text-contrast
    relation: supports
  - criterion: "1.3.1"
    name: Info and Relationships
    url: https://www.w3.org/TR/WCAG22/#info-and-relationships
    relation: supports
stances:
  material: { stance: silent }
  apple:    { stance: supports, sources: [apple-color, apple-accessibility, apple-charts] }
  carbon:   { stance: supports, sources: [carbon-color-accessibility, carbon-status-indicator, carbon-tag] }
  govuk:    { stance: supports, sources: [govuk-tag] }
  nngroup:  { stance: supports, sources: [nngroup-visual-treatments-accessibility] }
conflicts_checked: 2026-11-26
check: review
how_to_check:
  - 'A `Badge`, dot or table cell whose only content is a colour, such as `<Badge className="bg-green-500" />` or a `size-2 rounded-full` span with no text or distinct icon beside it.'
  - 'Badges or icons that differ only by `variant` or colour while their text, icon and shape are the same.'
  - 'A field marked wrong only by `aria-invalid:border-destructive`, with no visible message; or a meaning given only in an `sr-only` span.'
  - 'Active tab, selected card or chart series told apart only by colour, such as `text-foreground` against `text-muted-foreground` or legend squares with no names. Look at the screen in grayscale and ask whether each state still reads.'
  - 'Instructions that name a colour, such as ''shown in red''. Leave alone decoration, tags that show their name, and visited links (see Exceptions).'
changelog:
  - version: "1.0.1"
    date: 2026-11-26
    note: Points to VIS-008b for a selected look kept under hover, focus and press.
  - version: "1.0.0"
    date: 2026-11-25
    note: First version.
---

## Rule

Never let colour be the only sign of what something means or which state it is in, such as a status, an error or a selection. Add text, an icon, a shape or a pattern. A lightness difference of 3:1 counts too, except where people must know what a particular colour means.

## Why

Many people see some colours differently, red and green most often. Others meet the page in grey: in forced-colours mode, on a dim screen, in sunlight or on a printout. For all of them a status that is only a green or a red dot says nothing. [WCAG 2.2, 1.4.1 Use of Color](https://www.w3.org/TR/WCAG22/#use-of-color) requires that colour is not the only visual means of giving information, showing an action, asking for a response or telling elements apart. The cue has to be visible: text that only a screen reader hears does not meet it. A difference in lightness can be the cue when the two colours differ by 3:1 or more, but not when the person has to recognise the colour itself, as with red for failed and green for passed. Then text, an icon or a shape is needed. In Justified this is always the case for statuses: `success`, `warning` and `destructive` are all tuned to read as text on the page, so they end up close in lightness, about 1.0:1 to 1.3:1 against each other in both themes. We measure in both themes, as VIS-001 explains. Colour is welcome as an extra. The rule asks for a second cue, not for less colour. That the meaning also reaches assistive technology is a matter for [1.3.1 Info and Relationships](https://www.w3.org/TR/WCAG22/#info-and-relationships) and, for messages, FBK-004.

## Do

- Show a selected option by more than its tint. On a pricing page with three plan cards, the chosen card gets a check icon and the text "Selected" as well as `bg-accent`, the fill VIS-002 gives to selected items. In a toggle group, the pressed item can swap fill and text, which differs by far more than 3:1.
- Give every status a word. In a build server's *Builds* table, the *Status* column reads "Passed", "Failed" or "Running", and each badge may carry an icon too (`CircleCheck`, `CircleX`, `Loader`). The colour is extra.
- Keep the sign on numbers that rise or fall. "+4.2 %" and "−1.3 %" keep their plus and minus signs, and an arrow up or down may stand beside them.
- Tell chart series apart without colour. In a line chart of *Weekly sign-ups* by plan, name each line at its end, or give the lines different dash patterns or marker shapes. A table of the same numbers below the chart also works.
- Mark free and booked slots in a calendar with a word or a symbol, not only green and red cells.
- Use different icons for different states: a filled check for done and an empty circle for not done, not one icon in two colours.
- Give the second cue enough contrast to be seen; an icon or a separating stroke needs 3:1 (VIS-004). An icon beside a word is clearer than an icon on its own, which is our own advice.
- Run a grayscale check of a new screen: everything that mattered should still be clear.

## Don't

- Show a status as `<Badge className="bg-green-500" />` with no text, or as a coloured `size-2 rounded-full` dot in a table cell.
- Use `variant="destructive"` and `variant="secondary"` badges that both read "Active", or that show only a number, so that colour carries the difference.
- Mark a field as wrong with `aria-invalid:border-destructive` and nothing else. The message in text is what meets the criterion; FRM-002a says where it goes.
- Show which tab is active only by `text-foreground` against `text-muted-foreground`. They differ by about 2.5:1 in the light theme and 2.1:1 in the dark one, short of 3:1. Add an underline bar or a weight change.
- Show a chart's legend as coloured squares only, and rely on a tooltip on hover to tell the lines apart. The chart at rest must already make sense.
- Write "Overdue items are shown in red." The instruction depends on colour as much as the items do.
- Put the meaning in an `sr-only` label and leave the screen with a colour only.

## Exceptions

- **Colour that carries nothing.** Decoration, brand colour and category colours on tags that also show their name are outside the rule.
- **Visited links.** A visited link may differ from an unvisited one by colour alone. Links in running text are VIS-003b, which comes first where both apply.
- **Colour as the data.** In a heat map or a map coloured by value, a pattern on every cell is rarely practical. Give the values another way instead: on the cells, in a table, or in a legend that names each step together with values the keyboard can reach.
- **Neighbouring rules.** The error text at a field is FRM-002a, the required marker FRM-005, the current page in a menu NAV-002b, the danger button DLG-005, and focus shown by more than colour KBD-001. The contrast of icons and strokes is VIS-004. A selected or on look kept visible under hover, focus and press is VIS-008b.
