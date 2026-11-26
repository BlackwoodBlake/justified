---
id: FRM-017c
title: Say in words when a free-text limit is reached, and never cut text in silence
short: Limit reached in words
area: forms
status: proposed
version: "1.0.0"
verdict: insufficient-evidence
judges: { spoken: 1, agreeing: 1 }
law:
  - criterion: "3.3.1"
    name: Error Identification
    url: https://www.w3.org/TR/WCAG22/#error-identification
    relation: supports
  - criterion: "4.1.3"
    name: Status Messages
    url: https://www.w3.org/TR/WCAG22/#status-messages
    relation: supports
stances:
  material: { stance: silent }
  apple:    { stance: silent }
  carbon:   { stance: supports, sources: [carbon-text-input] }
  govuk:    { stance: supports, sources: [govuk-character-count, govuk-text-input] }
  nngroup:  { stance: silent }
conflicts_checked: 2026-11-26
check: lint
how_to_check:
  - '`maxLength` on a `<Textarea>` or a free-text `<Input>` with no text that appears when the limit is reached.'
  - 'An `onChange` that keeps only `value.slice(0, max)` on a free-text field, with nothing on screen that says the text was cut.'
  - 'A count or field that only changes colour at the limit, with no words such as "Limit reached" or "20 characters over the limit".'
changelog:
  - version: "1.0.0"
    date: 2026-11-26
    note: First version.
---

## Rule

When a free-text field limits how many characters or words it takes, say in words when people reach or pass the limit. Never stop or cut typed or pasted text without saying so.

## Why

A field that stops taking text without a word looks broken: the person keeps typing and nothing appears. A paste that loses its end looks whole at a glance and is sent short. A screen reader user cannot see either happen, so the field has to say it. [WCAG 2.2, 3.3.1 Error Identification](https://www.w3.org/TR/WCAG22/#error-identification) supports naming the error when text is too long, and [4.1.3 Status Messages](https://www.w3.org/TR/WCAG22/#status-messages) supports how a message at the limit reaches assistive technology without taking focus. Neither requires a message at the limit itself.

## Our reasons

Fewer than two judges have spoken about what a field says at its limit, so the verdict is Insufficient evidence (1 of 3 judges spoke) and this guideline is our choice. Carbon supports it. So does GOV.UK, an expert witness who does not vote. Material and Apple are silent, which is not a vote against. We ask for words at the limit for three reasons.

- **A silent stop is mistaken for a fault.** People who see nothing appear as they type try again, reload or give up. One short line tells them the field is working and why it stopped.
- **A silent cut changes what is sent.** The end of a message is often the part that matters most, such as the question or the date. Losing it without a sign sends something the person did not write.
- **Colour is not words.** A count that turns red tells nothing to people who cannot see the colour or do not know what it means, as VIS-003a says.

## Do

- On a volunteer sign-up form, *Tell us about yourself* takes up to 500 characters. If input stops at 500, the count under the field reads "Limit reached".
- When a paste is cut at a hard stop, the line says how much did not fit: "Limit reached. The last 200 characters you pasted were not added."
- If input runs past 500 instead, the count reads "20 characters over the limit". That count is not an error while the person types: no `aria-invalid` and no error styling on a key press. The error appears at the field when they leave it or send the form (FRM-002a, FRM-002b), such as "Your answer to Tell us about yourself is 520 characters. Shorten it to 500 or fewer.", worded as TXT-001a describes.
- The words at the limit reach a screen reader without moving focus, as FBK-004 describes.
- Our own advice: saved text that is already over a new, lower limit shows as over and is not cut.
- A word limit works the same way: "Limit reached" or "12 words over the limit".
- How the limit and the count are shown before the person gets there is FRM-017b.

## Don't

- Put `maxLength={500}` on *Tell us about yourself*, so a 700-character paste keeps the first 500 and nothing says so.
- Trim the value in `onChange` with `value.slice(0, 500)` and leave the field silent.
- Turn the count red at the limit with no words.

## Exceptions

- **Hard stop or overflow.** Input may stop at the limit, or run past it and show an error. This guideline allows both and does not choose.
- **Short coded fields.** A postcode, a card number or another code is FRM-017a, which checks the length after cleaning.
- **Paste.** Whether a field takes a paste at all is FRM-017.
- **A product that chooses otherwise.** This is a guideline. A product that leaves out the words at the limit still states the limit and shows the count (FRM-017b).
