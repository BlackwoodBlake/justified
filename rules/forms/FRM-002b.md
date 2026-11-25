---
id: FRM-002b
title: Show a field's error when the person leaves the field or sends the form, and clear it as soon as the value is valid
short: When errors show
area: forms
status: decided
version: "1.0.3"
verdict: unanimous
judges: { spoken: 2, agreeing: 2 }
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
  apple:    { stance: supports, sources: [apple-text-fields] }
  carbon:   { stance: supports, sources: [carbon-forms, carbon-text-input] }
  govuk:    { stance: opposes, sources: [govuk-validation] }
  nngroup:  { stance: supports, sources: [nngroup-errors-forms] }
conflicts_checked: 2026-11-24
check: lint
how_to_check:
  - '`useForm({ mode: "onChange" })` or `mode: "all"` in react-hook-form, which shows new errors while people type, unless the field creates a new value with its rules listed beside it, such as a new password (see Exceptions).'
  - '`mode: "onBlur"` or `mode: "onTouched"` in react-hook-form. Both check a field on blur even when it was only tabbed past. `onBlur` also keeps a shown error until the field is left again, and `onTouched` shows new errors while typing once a field is touched.'
  - '`reValidateMode: "onBlur"` or `reValidateMode: "onSubmit"`, which, once the form has been sent, keeps a shown error after the value is fixed until the field is left or the form is sent again.'
  - 'An `onChange` handler that calls `setError`, `trigger()` or a zod `safeParse` and sets a new error, rather than only clearing an error already shown.'
  - 'A check only the server can make, such as an address lookup, called from `onChange` or a debounced effect on the value instead of on blur or send.'
changelog:
  - version: "1.0.3"
    date: 2026-11-24
    note: Focus on a failed send now refers to FRM-011, for every form.
  - version: "1.0.2"
    date: 2026-11-21
    note: Examples in English.
  - version: "1.0.1"
    date: 2026-11-21
    note: Point to FRM-003 for moving from a field to Cancel in a modal form.
  - version: "1.0.0"
    date: 2026-11-20
    note: First version.
---

## Rule

Show a new error on a field only when the person leaves it after changing it or sends the form, never while they type; recheck an error that is already shown on every change and remove it as soon as the value is valid.

## Why

An error that appears halfway through a word scolds people for something they have not finished, and it hits slow typists and screen reader users hardest. Waiting until the person moves on lets them finish first and still hear about a mistake while the field is fresh in their mind. Sending the form is the safety net for every field they skipped. Clearing works the other way round: once the value is right, a lingering error is just noise, so it should go at once. Adding an error early hurts; removing one early helps. Where the error is shown is covered by FRM-002a.

## Do

- A person types "1135" in *Postcode* and moves on to *City*. Only then does *Postcode* show "Enter a five-digit postcode, for example 11359."
- They go back and type the missing "9". The error disappears on that key press, without waiting for them to leave the field.
- They press *Send* without ever visiting *National ID number*. Every field with a problem shows its error at once, *National ID number* included.
- A check that only the server can make, such as whether a delivery address exists, runs when the person leaves the field or sends the form, and its result appears at the field. It never runs while they are still typing.
- When an error appears as the person leaves a field, or a shown error clears while they type, keep focus where it is and announce the change, so screen reader users learn about it without being moved. Where focus goes when the form is sent with problems is the guideline FRM-011: to the first problem or to a summary of them.

## Don't

- Show "Invalid postcode" after the first digit, while the person is still typing.
- Mark *Customer number* as missing just because the person tabbed past it on the way to *Postcode*. A field that is entered and left without a change waits until the form is sent.
- Keep an error on a field after the person has fixed it, until they leave the field or send the form again.
- Send the form and report only the first problem, leaving the rest to appear one round at a time.
- Move focus to an error that appears when the person leaves a field. They have already moved on and should stay where they are.
- Treat a live check on a new password as a reason to check email addresses, postcodes or national ID numbers while people type.

## Exceptions

When a person creates a new value that must meet rules shown next to the field, such as a new password or a new user name, the field shows progress against those rules while they type. List the rules before they start and mark each one as met the moment it is, for example "At least one digit" turning to done after the first digit. This is progress, not an error: no red error state appears on a key press. A rule that is still unmet becomes an error only when the person leaves the field or sends the form. The exception covers new values with stated rules only, never ordinary fields.

When a short form keeps its send button unavailable until required input is in, as ACT-004 allows, sending can no longer reveal skipped fields. ACT-005 then applies: the text next to the button says what is still needed, and those untouched fields are not shown as errors.

Moving from a field to Cancel or the close control in a modal form holds back that field's check until focus moves on to something else, as FRM-003 describes.
