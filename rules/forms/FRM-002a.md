---
id: FRM-002a
title: Show a field's error as text at the field
short: Error at the field
area: forms
status: decided
version: "1.0.2"
verdict: unanimous
judges: { spoken: 2, agreeing: 2 }
law:
  - criterion: "3.3.1"
    name: Error Identification
    url: https://www.w3.org/TR/WCAG22/#error-identification
    relation: supports
  - criterion: "3.3.3"
    name: Error Suggestion
    url: https://www.w3.org/TR/WCAG22/#error-suggestion
    relation: supports
  - criterion: "1.3.1"
    name: Info and Relationships
    url: https://www.w3.org/TR/WCAG22/#info-and-relationships
    relation: supports
  - criterion: "1.4.1"
    name: Use of Color
    url: https://www.w3.org/TR/WCAG22/#use-of-color
    relation: supports
  - criterion: "4.1.2"
    name: Name, Role, Value
    url: https://www.w3.org/TR/WCAG22/#name-role-value
    relation: supports
stances:
  material: { stance: supports, sources: [material-text-fields, material-text-fields-accessibility] }
  apple:    { stance: silent }
  carbon:   { stance: supports, sources: [carbon-forms, carbon-text-input] }
  govuk:    { stance: supports, sources: [govuk-error-message, govuk-validation, govuk-error-summary] }
  nngroup:  { stance: supports, sources: [nngroup-errors-forms] }
conflicts_checked: 2026-11-21
check: review
how_to_check:
  - 'Field errors sent only to `toast.error()`, an `<Alert>` at the top or a `Dialog`, with no message at the field, such as no `<FormMessage />` or `Field` `error`. Problems that belong to no field, such as a service that is down, are fine there (see Exceptions).'
  - 'A field marked in error only by colour, such as `aria-invalid:border-destructive` or `border-red-500`, with no error text.'
  - 'An error message shown only in a `Tooltip` or `HoverCard` on an icon, instead of as text at the field.'
  - 'A control with `aria-invalid="true"` whose `aria-describedby` is missing or does not include the `id` of its visible error message.'
  - 'When the server rejects a value, such as an email address already in use, does the message show at that field and not only at the top?'
changelog:
  - version: "1.0.2"
    date: 2026-11-21
    note: Examples in English.
  - version: "1.0.1"
    date: 2026-11-21
    note: The example for an address that already has an account now gives a next step, as TXT-001a asks.
  - version: "1.0.0"
    date: 2026-11-20
    note: First version.
---

## Rule

When a field or a group of inputs has an invalid value, show the error as visible text at that field, and never only in a banner, a dialog or a tooltip somewhere else.

## Why

People correct a value where the value is. If the message lives in another place, they have to remember it, scroll between the two, or guess which field it means, and the message may be gone by the time they start typing. Placing it at the field and tying it to the control in code means sighted and screen reader users meet the problem and the field together. [WCAG 2.2, 3.3.1 Error Identification](https://www.w3.org/TR/WCAG22/#error-identification) asks that the field in error is named and the problem is described in text, but it leaves the place open (see [Understanding 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)). This rule is our design choice for that place.

## Do

- A field labelled "Postcode" holds "1234". Right at the field, the text "Enter a five-digit postcode, for example 11359." appears with an error icon, and stays there while the person edits.
- A bank account entered as a branch code box and an account number box gets one message for the pair. If only the branch code is wrong, the message says so: "The branch code must be four or five digits".
- The server sends the form back because the email address is already registered. The message "This email address already has an account. Sign in or use a different address." is shown at the email field, not only at the top.
- You add a summary at the top of a long form as an extra. Each line in it links to its field and uses the same words as the message at that field.
- The control points to its message with `aria-describedby` and is marked with `aria-invalid`, so the message is read out with the field. Justified's `Field` component does this for you.
- An end date comes before a start date. Show the message at the end date, since that is the field people most often change. This is our own choice for errors that involve two fields.

## Don't

- Show only a banner that says "The form contains errors" and leave the person to find the fields.
- Put the message behind an icon that reveals it on hover or focus.
- Open a dialog with the error that must be closed before the person can fix the value.
- Mark the field with a red outline and nothing else. Always add text, and an icon if you like.
- Place the text visually next to the field but leave it unlinked in code, so a screen reader reads the field without its error.

## Exceptions

- Problems that are not about a value the person entered, such as a service that is down, missing permission or not being eligible, do not belong at a field. Show them as a message for the page or the form instead.
- This rule does not set whether the message goes above or below the input, or whether it replaces the hint text. Both are left to the component. If the message does take the place of the hint, it must repeat whatever the hint said that the person needs to fix the value.
- When the error appears is covered by FRM-002b.
