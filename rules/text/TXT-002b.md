---
id: TXT-002b
title: Open tooltips on focus too, and keep what people need on the page
short: Tooltips
area: text
status: decided
version: "1.0.0"
verdict: unanimous
judges: { spoken: 2, agreeing: 2 }
law:
  - criterion: "2.1.1"
    name: Keyboard
    url: https://www.w3.org/TR/WCAG22/#keyboard
    relation: supports
stances:
  material: { stance: supports, sources: [material-tooltips, material-tooltips-accessibility] }
  apple:    { stance: silent }
  carbon:   { stance: supports, sources: [carbon-tooltip, carbon-tooltip-accessibility] }
  govuk:    { stance: silent }
  nngroup:  { stance: supports, sources: [nngroup-tooltip-guidelines] }
conflicts_checked: 2026-11-22
changelog:
  - version: "1.0.0"
    date: 2026-11-22
    note: First version.
---

## Rule

A tooltip opens when its trigger gets keyboard focus, not only when the pointer rests on it. It holds only extra help. Anything the person needs to finish the task is visible on the page without hovering or focusing.

## Why

A tooltip that only opens on hover does not exist for someone who uses a keyboard, and touch screens have no hover at all. Tooltips are also easy to miss and gone the moment the person moves on, so they must remember what it said. That is fine for a hint they can do without. It fails when the hint is the only place that says how to finish. Opening on focus supports [WCAG 2.2, 2.1.1 Keyboard](https://www.w3.org/TR/WCAG22/#keyboard), which asks that all functionality works from a keyboard. We record 2.1.1 as support, not as a requirement, so this rule rests on the judges. How the tooltip closes, stays and can be hovered is set by TXT-002a.

## Do

- An icon button with the accessible name "Share" shows the tooltip "Share" both when the pointer rests on it and when the person Tabs to it.
- The term *Net amount* in an invoice summary has a tooltip "The total before tax". The term can take focus, so a keyboard user can open the tooltip as well.
- A field *Project code* shows "Six letters or digits, for example KX4721" as text under the field. A tooltip on the label could add where to find the code, but the format stays on the page.
- A chart's data point shows its exact value in a tooltip, and the same values are in a table or a list next to the chart.
- If you use shadcn's `Tooltip`, check in your own build that the tooltip appears when you Tab to the trigger, and that the trigger can take focus, for example a `Button` rather than a plain `span`.

## Don't

- Show a tooltip only on mouse hover, so Tab reaches the button but no help appears.
- Put the only note that a booking cannot be changed after 6 pm the day before in a tooltip on an info icon.
- Put the only explanation of a price or a deadline the person must act on in a tooltip.
- Add a tooltip to a word that cannot take focus, so only pointer users can open it.

## Exceptions

- **The name of an icon-only button.** A tooltip on an icon-only button may show its name, in the same words as its accessible name, such as the tooltip "Share" on a button named "Share". The accessible name itself is set on the button, as ACT-001b says.
- **Other rules cover these cases.** Field errors follow FRM-002a, the reason a button is unavailable follows ACT-005, the meaning of a required marker follows FRM-005, and labels follow FRM-001.
- **Actions, not information.** This rule covers information. Actions that appear on hover, such as row buttons, are covered by KBD-001.
- **Not decided here.** Whether a tooltip may hold links or buttons is not covered by this rule.
