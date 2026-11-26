---
id: FRM-016a
title: Let a click on a checkbox's or radio button's text change it, as a click on the box does
short: Clickable option text
area: forms
status: proposed
version: "1.0.0"
verdict: unanimous
judges: { spoken: 2, agreeing: 2 }
law:
  - criterion: "1.3.1"
    name: Info and Relationships
    url: https://www.w3.org/TR/WCAG22/#info-and-relationships
    relation: supports
  - criterion: "2.5.8"
    name: Target Size (Minimum)
    url: https://www.w3.org/TR/WCAG22/#target-size-minimum
    relation: supports
stances:
  material: { stance: supports, sources: [material-checkbox-accessibility, material-radio-button-accessibility, material-radio-button] }
  apple:    { stance: silent }
  carbon:   { stance: supports, sources: [carbon-radio-button, carbon-checkbox] }
  govuk:    { stance: silent }
  nngroup:  { stance: supports, sources: [nngroup-checkboxes-vs-radio-buttons] }
conflicts_checked: 2026-11-26
check: lint
how_to_check:
  - 'A `<Checkbox>` or `<RadioGroupItem>` whose visible text sits in a `<span>`, `<p>` or `<div>` beside it, with no `<Label htmlFor>` or `<label htmlFor>` matching its `id`, no wrapping `<label>`, and no `FormLabel` in the same `FormItem` or `FieldLabel` in the same `Field`.'
  - 'A `<Label>` beside a checkbox or radio button with no `htmlFor`, or one that matches no control''s `id`, for example because the `id` sits on a wrapping `div`.'
  - 'Options rendered with `.map()` that give every item the same hard-coded `id`, so each label selects the first option.'
  - '`pointer-events-none` on the label of an enabled option, not only in a disabled variant such as `group-data-[disabled=true]:`, or an `absolute` sibling placed over the label text, so a click on the text never reaches it.'
  - 'A row `div` with an `onClick` that sets the checked state, standing in for a label tied to the control.'
changelog:
  - version: "1.0.0"
    date: 2026-11-26
    note: First version.
---

## Rule

When a checkbox or a radio button shows its own text beside it, a click, tap or pen press on that text checks or unchecks the checkbox, or selects the radio button, exactly as a press on the box or circle does.

## Why

The box or circle is small, and the words beside it are what people read and aim at. When the words do nothing, a near miss on the box is a lost press, and anyone with a tremor or a large fingertip pays for it most. Making the text respond gives each option a target as wide as its words, with no change to how it looks.

WCAG does not require this. It supports it: the label technique for [WCAG 2.2, 1.3.1 Info and Relationships](https://www.w3.org/TR/WCAG22/#info-and-relationships) ([H44](https://www.w3.org/WAI/WCAG22/Techniques/html/H44)) names the larger click area as an extra gain for people with limited motor control, and a responding label serves the same need as [2.5.8 Target Size (Minimum)](https://www.w3.org/TR/WCAG22/#target-size-minimum). Text that does not respond does not by itself fail either criterion. Whether the control has a name in code is FRM-010; whether the box itself is large enough is ACT-006.

## Do

- On a ferry booking form, the checkbox *Add a cabin for the night crossing* is a shadcn `Checkbox` with `id="cabin"` and a `<Label htmlFor="cabin">` beside it. A click on the words ticks the box and does everything a click on the box does, firing the same `onCheckedChange`.
- The question *Seat type* is the `<legend>` of a `FieldSet` around a `RadioGroup`, as FRM-010 advises. Each `RadioGroupItem`, *Reclining seat* and *Cabin bed*, has its own `Label` tied to its `id`, so a tap on *Cabin bed* picks that option.
- In a list of options built with `.map()`, build each `id` from the item's key or from `useId()`, so every label reaches its own control.
- In shadcn's `Form`, keep the `FormLabel` in the same `FormItem` as the `FormControl`; it gets the right `htmlFor` by itself. The `Field` component with `FieldLabel` does the same.
- Wrapping the control and its text in one `<label>` works too. An option card where the whole card is the label is fine, as long as the card holds no other control.
- A disabled option stays still when its text is clicked, just as when its box is.

## Don't

- Put *Add a cabin for the night crossing* in a `<span>` next to the box, so the words look like a label and do nothing.
- Name the box with `aria-label` and leave the visible text as plain text. FRM-010 may be met; this rule is still broken.
- Give every mapped `Checkbox` the `id` "option", so each label ticks the first box.
- Fake it with an `onClick` on the row `div`. A click on the box then toggles twice, and nothing is tied for assistive technology.
- Put a click handler on the row or the label that toggles the box, so a click on the link *cabin prices* inside the option's text also ticks it. A plain link in a `<label>` only follows the link. Nor let a link fill most of the text, which leaves little to click that ticks the box.

## Exceptions

- **No text of its own.** A checkbox with no visible text beside it, such as one that selects a table row, is outside this rule. Its name in code is FRM-010.
- **Other text.** Only the option's own text is meant. A group label, a hint under the option or a heading need not respond.
- **Target size.** This rule does not make a small box pass ACT-006. The text counts toward the target only as ACT-006 says.
- **Switches.** A switch's text is FRM-016b.
