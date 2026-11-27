---
id: FRM-014a
title: Give a text field that takes only digits the digit keypad with inputmode
short: Digit keypad
area: forms
status: proposed
version: "1.0.1"
verdict: insufficient-evidence
judges: { spoken: 1, agreeing: 1 }
law:
  - criterion: "1.3.5"
    name: Identify Input Purpose
    url: https://www.w3.org/TR/WCAG22/#identify-input-purpose
    relation: supports
stances:
  material: { stance: silent }
  apple:    { stance: supports, sources: [apple-virtual-keyboards, apple-text-fields] }
  carbon:   { stance: silent }
  govuk:    { stance: supports, sources: [govuk-text-input] }
  nngroup:  { stance: silent }
conflicts_checked: 2026-11-26
check: lint
how_to_check:
  - 'A text `<Input>` with `autoComplete="cc-number"` or `cc-csc` and no `inputMode="numeric"`.'
  - 'A text `<Input>` validated by a digits-only pattern, such as `z.string().regex(/^\d+$/)` or `/^\d{6}$/` on a one-time code, with no `inputMode="numeric"`.'
  - 'A text `<Input>` validated by a pattern for a decimal number with no minus sign, such as `z.string().regex(/^\d+([.,]\d+)?$/)`, with no `inputMode="decimal"`.'
  - '`inputMode="numeric"` or `inputMode="decimal"` on a field whose validation pattern allows letters, such as `/^[A-Z]{2}-\d+$/`.'
changelog:
  - version: "1.0.1"
    date: 2026-11-27
    note: Leaves the number input to FRM-014b instead of listing it as a Don't.
  - version: "1.0.0"
    date: 2026-11-26
    note: First version.
---

## Rule

When a text field takes a value made of digits only, other than a phone number, give it `inputMode="numeric"`. When it takes an amount or measurement with a decimal part, give it `inputMode="decimal"`. A phone or tablet then shows a digit keypad.

## Why

On a phone, digits sit behind a second layout of the standard keyboard, in a row of small keys. Typing a sixteen-digit card number or a six-digit code there means switching layouts and aiming at small keys, which is slow and easy to get wrong. The `inputmode` attribute asks the browser for a keypad of large digit keys instead. It only picks the keypad: it does not check or limit what can be typed, so a person with a physical keyboard, or one who pastes, loses nothing.

No WCAG criterion asks for a keypad. The field's purpose under [WCAG 2.2, 1.3.5 Identify Input Purpose](https://www.w3.org/TR/WCAG22/#identify-input-purpose) comes from its `autocomplete` value (FRM-007), not from `inputmode`; the keypad only makes the same field easier to fill in by hand.

## Our reasons

Fewer than two judges have spoken about the digit keypad, so the verdict is Insufficient evidence (1 of 3 judges spoke) and this guideline is our choice. Apple supports it. So does GOV.UK, an expert witness who does not vote. Material and Carbon are silent, which is not a vote against. We ask for the keypad for three reasons.

- **Fewer slips.** Large digit keys and no layout switching cut the taps and the mistakes on long strings of digits, most of all for people with motor or dexterity difficulties.
- **It takes nothing away.** The attribute changes only the on-screen keyboard. Paste, autofill and physical keyboards work as before.
- **The field stays a text field.** Leading zeros, spaces and long values keep working, which a number input does not promise (FRM-014b).

## Do

- On a gym's payment page, *Card number* is `<Input autoComplete="cc-number" inputMode="numeric" />` and *Security code* is `<Input autoComplete="cc-csc" inputMode="numeric" />`. Both keep their visible labels (FRM-001) and their `autocomplete` values (FRM-007). A keypad may have no space key, but spaces people paste are still accepted, as the guideline FRM-017a says.
- *Membership number* takes ten digits, such as "0471826390". It gets `inputMode="numeric"` and is checked as a string, so the leading zero stays.
- A masked *PIN* field still gets `inputMode="numeric"`. On sign-in, FRM-008 covers how it takes a paste and a password manager.
- *Top-up amount* in euros and *Room length in metres* take a decimal part, so they get `inputMode="decimal"`. Parse the value with the person's locale in mind: on many devices the decimal key types a comma.
- A postcode field gets `inputMode="numeric"` only in a country where every postcode is digits only, and keeps `autoComplete="postal-code"` (FRM-007).
- A one-time code on sign-in gets the keypad the same way; FRM-008 covers how it takes a paste.
- In JSX, write the prop as `inputMode`, which React renders as the `inputmode` attribute.
- Keep the field's type as text. Whether a digit field may be a number input is FRM-014b.

## Don't

- Our own advice: don't give *Card number* `type="tel"` to get digits. That tells the browser it is a phone number, which can bring the wrong autofill suggestions.
- Rely on `pattern="[0-9]*"` alone for the keypad. It is not a keypad setting, and it starts the browser's own check when the form is sent.
- Give `inputMode="numeric"` to a value that can hold letters, such as an order reference like "RX-20931" or a postcode in a country where postcodes mix letters and digits. Some keypads have no letters at all.

## Exceptions

- **Values that can be negative.** Some digit keypads have no minus sign. A field that allows one, such as *Temperature change*, is a plain text field without `inputmode`; that is our reading of the safer choice.
- **Phone numbers.** A phone number gets `type="tel"`, as FRM-014 says, and needs no `inputmode` of its own.
- **Values that mix letters and digits.** These keep the standard keyboard; see Don't.
- **A product that chooses otherwise.** This is a guideline. A field without the keypad still needs its label (FRM-001) and its `autocomplete` value (FRM-007).
