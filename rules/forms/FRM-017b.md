---
id: FRM-017b
title: State a free-text field's length limit and show how much is used
short: Length limit shown
area: forms
status: proposed
version: "1.0.1"
verdict: insufficient-evidence
judges: { spoken: 1, agreeing: 1 }
law:
  - criterion: "3.3.2"
    name: Labels or Instructions
    url: https://www.w3.org/TR/WCAG22/#labels-or-instructions
    relation: supports
  - criterion: "4.1.3"
    name: Status Messages
    url: https://www.w3.org/TR/WCAG22/#status-messages
    relation: supports
stances:
  material: { stance: supports, sources: [material-text-fields, material-text-fields-accessibility] }
  apple:    { stance: silent }
  carbon:   { stance: silent }
  govuk:    { stance: supports, sources: [govuk-character-count] }
  nngroup:  { stance: silent }
conflicts_checked: 2026-11-26
check: review
how_to_check:
  - '`maxLength` on a `<Textarea>` or a free-text `<Input>` with no limit in its label or hint, or with no count anywhere in the field''s markup.'
  - 'A limit only in a schema, such as `z.string().max(500)`, with no limit stated and no count shown before the form is sent.'
  - 'A count such as `{value.length}/500` in a `<span>` that the field does not point to with `aria-describedby`.'
changelog:
  - version: "1.0.1"
    date: 2026-11-26
    note: Checked by review, since no lint rule covers it. No change in what the guideline asks.
  - version: "1.0.0"
    date: 2026-11-26
    note: First version.
---

## Rule

When a free-text field limits how many characters or words it takes, state the limit in its label or hint and show how much is used in a count that is tied to the field in code.

## Why

A limit people cannot see is one they find only by running into it. Knowing it before they start lets people plan what to write, and a count lets them trim while they write instead of after they are stopped or refused. A screen reader user cannot glance at a counter in the corner, so the count has to be tied to the field and read as words.

No WCAG criterion requires a counter. [WCAG 2.2, 3.3.2 Labels or Instructions](https://www.w3.org/TR/WCAG22/#labels-or-instructions) supports stating the limit, and [4.1.3 Status Messages](https://www.w3.org/TR/WCAG22/#status-messages) supports how a changing count reaches assistive technology without taking focus. What happens when the limit is reached is FRM-017c.

## Our reasons

Fewer than two judges have spoken about showing a length limit and a count, so the verdict is Insufficient evidence (1 of 3 judges spoke) and this guideline is our choice. Material supports it. So does GOV.UK, an expert witness who does not vote. Carbon and Apple are silent, which is not a vote against. We ask for the limit and the count for three reasons.

- **A rule people cannot see is unfair.** The product knows the limit from the start. Keeping it to itself until the text is too long makes the person pay for what the product did not say.
- **Writing to a length is easier with a gauge.** A person who sees "120 characters left" can choose what to cut. One who sees nothing finds out when the text stops going in or the form is refused.
- **The count costs little.** It is one line of text under the field, tied to it in code.

## Do

- On a volunteer sign-up form, *Tell us about yourself* has the hint "Up to 500 characters" and a count under the field that reads "320 characters left". The field points to the hint and the count with `aria-describedby`.
- Our own choice: the count may appear only once the person is near the limit, such as within 50 characters, as long as the hint states the limit from the start.
- The count reaches a screen reader as a polite announcement, as FBK-004 describes, and not on every key: for example when the person pauses, or once they are near the limit. It says the whole phrase, "20 characters left", not "20".
- A word limit works the same way: "Up to 250 words" in the hint and "40 words left" as the count.
- Count as the server counts. If the server counts a line break or an emoji differently, the visible count matches the server, so nobody is refused below the limit they were shown.
- The live count is not an error. It may change while the person types. An error for text that is too long appears when they leave the field or send the form, as FRM-002b says.

## Don't

- Copy `maxLength={500}` from the database column onto *Tell us about yourself* with no hint and no count.
- Put the limit only in `z.string().max(500)`, so the first sign of it is an error after the form is sent.
- Render `{value.length}/500` in a `<span>` that is not tied to the field, so a screen reader user never hears it.
- Announce the count with `aria-live="assertive"` on every key, so it interrupts the person as they type.

## Exceptions

- **Reaching the limit.** What the field says when the limit is reached or passed, and whether it stops input, is FRM-017c.
- **Short coded fields.** A postcode, a card number or another code is FRM-017a, which checks the length after cleaning.
- **Paste.** Whether a field takes a paste at all is FRM-017.
- **A product that chooses otherwise.** This is a guideline. A product without a count still never cuts text in silence (FRM-017c) and shows an error for text that is too long as FRM-002a describes.
