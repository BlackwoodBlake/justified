---
id: FRM-016b
title: Let a click on a switch's text turn it on or off, as a click on the switch does
short: Clickable switch text
area: forms
status: proposed
version: "1.0.0"
verdict: insufficient-evidence
judges: { spoken: 1, agreeing: 1 }
law:
  - criterion: "2.5.8"
    name: Target Size (Minimum)
    url: https://www.w3.org/TR/WCAG22/#target-size-minimum
    relation: supports
stances:
  material: { stance: silent }
  apple:    { stance: silent }
  carbon:   { stance: supports, sources: [carbon-toggle] }
  govuk:    { stance: silent }
  nngroup:  { stance: silent }
conflicts_checked: 2026-11-26
check: lint
how_to_check:
  - 'A `<Switch>` whose visible text sits in a `<span>`, `<p>` or `<div>` beside it, with no `<Label htmlFor>` or `<label htmlFor>` matching its `id`, no wrapping `<label>`, and no `FormLabel` in the same `FormItem` or `FieldLabel` in the same `Field`.'
  - 'A `<Label>` beside a switch with no `htmlFor`, or one that matches no control''s `id`, for example in a `justify-between` settings row.'
  - 'Settings rendered with `.map()` that give every `Switch` the same hard-coded `id`, so each label turns the first one on or off.'
  - '`pointer-events-none` on the label of an enabled switch, not only in a disabled variant such as `group-data-[disabled=true]:`, or an `absolute` sibling placed over the label text, so a click on the text never reaches it.'
changelog:
  - version: "1.0.0"
    date: 2026-11-26
    note: First version.
---

## Rule

When a switch shows its own text beside it, a click, tap or pen press on that text turns the switch on or off exactly as a press on the switch does.

## Why

A switch and its text read as one setting, and people aim at the words as often as at the small track. Text that does nothing turns a near miss into a lost press. WCAG does not require this; a responding label serves the same need as [WCAG 2.2, 2.5.8 Target Size (Minimum)](https://www.w3.org/TR/WCAG22/#target-size-minimum), and text that does not respond does not by itself fail it. Checkboxes and radio buttons are FRM-016a, a rule.

## Our reasons

Fewer than two judges have spoken about the text of a switch, so the verdict is Insufficient evidence (1 of 3 judges spoke) and this guideline is our choice. Carbon supports it. We make it for two reasons.

- **One setting, one target.** The words and the track say the same thing, so a press on either should do the same.
- **One way of building.** The switch then works like the checkbox and radio button in FRM-016a, with the same label tied to the same kind of control.

## Do

- In a ferry app's settings, the row *Email me before departure* holds a shadcn `Switch` with `id="departure-email"` and a `<Label htmlFor="departure-email">`. A tap on the words turns the switch on and does everything a tap on the track does, firing the same `onCheckedChange`.
- In a `justify-between` row, where the text sits at the far side from the switch, tie the two with `htmlFor` and `id`, or wrap the row in one `<label>`.
- A whole row may act as the label, as long as it holds no other control, such as a *Learn more* link or a help button.
- In a list of settings built with `.map()`, build each `id` from the setting's key or from `useId()`.
- A switch that applies its setting at once does exactly the same when its text is pressed, no more. FRM-012a still applies.

## Don't

- Put *Email me before departure* in a `<span>` beside the switch, so the words do nothing.
- Use a `<Label>` with no `htmlFor` at the other end of the row.
- Give every mapped `Switch` the same `id`, so each label flips the first one.
- Fake it with an `onClick` on the row `div` that flips the state. A tap on the switch itself then flips it twice, and nothing is tied for assistive technology.

## Exceptions

- **No text of its own.** A switch with no visible text beside it is outside this guideline. Whether it needs text is FRM-001, and its name in code is FRM-010.
- **Target size.** This guideline does not make a small switch pass ACT-006.
- **A product that chooses otherwise.** This is a guideline. A product whose switch text does not respond still names the switch as FRM-010 asks.
