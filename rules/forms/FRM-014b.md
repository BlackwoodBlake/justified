---
id: FRM-014b
title: Put a string of digits that is not a quantity in a text input, never a number input
short: Digit strings as text
area: forms
status: proposed
version: "1.0.0"
verdict: insufficient-evidence
judges: { spoken: 1, agreeing: 1 }
law: []
stances:
  material: { stance: silent }
  apple:    { stance: silent }
  carbon:   { stance: supports, sources: [carbon-number-input] }
  govuk:    { stance: supports, sources: [govuk-text-input] }
  nngroup:  { stance: supports, sources: [nngroup-input-steppers] }
conflicts_checked: 2026-11-26
check: lint
how_to_check:
  - '`type="number"` on an `<Input>` with `autoComplete="one-time-code"`, `cc-number`, `cc-csc`, `tel`, `tel-national` or `postal-code`.'
  - '`type="number"` on a field labelled as a code, PIN, card, account, member, customer or order number, phone number or postcode, also when classes such as `[appearance:textfield]` hide its spinner.'
changelog:
  - version: "1.0.0"
    date: 2026-11-26
    note: First version.
---

## Rule

Put a string of digits that is not a quantity, such as a one-time code, a card number, an account number, a phone number or a postcode, in a text input: `type="text"`, or `type="tel"` for a phone number. Never put it in `type="number"`.

## Why

A number input treats its value as a quantity that goes up and down in steps. A code or a card number never does: nobody wants the next card number. The browser's number handling then works against the value, in the ways listed under Our reasons. No WCAG criterion requires this.

## Our reasons

Fewer than two judges have spoken about which input a string of digits belongs in, so the verdict is Insufficient evidence (1 of 3 judges spoke) and this guideline is our choice. Carbon supports it. So do GOV.UK and NN/g, expert witnesses who do not vote. Material and Apple are silent, which is not a vote against. We keep such values out of a number input for four reasons.

- **The value changes on its own.** A leading zero can vanish once the value is read as a number, so "04718" becomes 4718. A long card number can be shown in exponent form or lose its last digits.
- **What people type is refused or let through wrongly.** Spaces and dashes are refused, `maxLength` is ignored, while "e", plus and minus are let through.
- **Errors cannot be explained.** A value the browser cannot read comes back empty, so the form cannot tell the person what was wrong.
- **The value moves by accident.** The arrow keys, and in some browsers the scroll wheel over a focused field, change the value when the person meant to move on.

## Do

- On a gym's payment page, *Card number*, *Security code* and *Membership number* are text inputs, with the `autocomplete` values from FRM-007. Check each value as a string, for example with `z.string().regex(/^\d{10}$/)` on the value with spaces removed, as the guideline FRM-017a describes, so leading zeros stay.
- Get the digit keypad from `inputMode="numeric"`, as FRM-014a describes, not from the number type.
- *Mobile number* is `type="tel"`, as FRM-014 says, and keeps the spaces and the plus sign the person typed.
- A one-time code on sign-in is a text input, so a pasted "482 913" goes in and the spaces can be stripped; FRM-008 covers the paste.
- Turn the browser's own check off with `noValidate`, as FRM-007 says, and show errors as FRM-002a and FRM-002b describe.
- A true small count may use a number input with step controls. On a café's booking form, *Tables* starts at 1 and is seldom more than three, so `<Input type="number" min={1} />` is allowed. This guideline does not require it.
- Our own advice, beyond this guideline: where people type an exact amount across a wide range, a text input with `inputMode="decimal"` (FRM-014a) is often the better choice.

## Don't

- Use `<Input type="number">` for *Membership number* to get the keypad. "0471826390" can come back as 471826390.
- Hide the spinner on a number input with `[appearance:textfield]` and call it a text field. The arrow keys and the scroll wheel still change the value.
- Read a code with `valueAsNumber` or `z.coerce.number()`, which throws away its leading zeros.
- Give *Postcode* `type="number"`, which refuses a postcode with a space or a letter. In a country where every postcode is digits only, it is still a text input, with `inputMode="numeric"` from FRM-014a.

## Exceptions

- **Quantities.** Counts, amounts, prices, years and ages are outside this guideline. It takes no side on quantities.
- **The keypad and the keyboard.** Which keypad a digit field shows is FRM-014a; email, phone and web address types are FRM-014.
- **Purpose.** The `autocomplete` values for card, code, phone and postcode fields are FRM-007.
- **A product that chooses otherwise.** This is a guideline. A product that keeps a number input for such a value still checks it as a string and shows errors as FRM-002a asks.
