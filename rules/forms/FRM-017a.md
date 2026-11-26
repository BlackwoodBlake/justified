---
id: FRM-017a
title: Accept the spaces and separators people write in a number or code, and remove them before checking
short: Separators accepted
area: forms
status: proposed
version: "1.0.0"
verdict: insufficient-evidence
judges: { spoken: 0, agreeing: 0 }
law:
  - criterion: "3.3.1"
    name: Error Identification
    url: https://www.w3.org/TR/WCAG22/#error-identification
    relation: supports
  - criterion: "3.3.3"
    name: Error Suggestion
    url: https://www.w3.org/TR/WCAG22/#error-suggestion
    relation: supports
  - criterion: "3.3.2"
    name: Labels or Instructions
    url: https://www.w3.org/TR/WCAG22/#labels-or-instructions
    relation: supports
stances:
  material: { stance: silent }
  apple:    { stance: silent }
  carbon:   { stance: silent }
  govuk:    { stance: supports, sources: [govuk-validation, govuk-telephone-numbers, govuk-payment-card-details, govuk-bank-details, govuk-national-insurance-numbers, govuk-text-input] }
  nngroup:  { stance: supports, sources: [nngroup-eas-framework-simplify-forms, nngroup-web-form-design, nngroup-mobile-input-checklist] }
conflicts_checked: 2026-11-26
check: lint
how_to_check:
  - 'A Zod `.regex()` or `.length()` on a phone, card, account or reference value with no `.transform()` or `z.preprocess()` before it that removes spaces, hyphens, brackets and dots, such as `z.string().regex(/^\d{16}$/)` on the raw value.'
  - 'An `onKeyDown` or `onBeforeInput` on such a field that calls `preventDefault()` for every key that is not a digit, so a space, hyphen or plus sign is refused.'
  - '`maxLength` on such a field, such as `maxLength={16}` on a card number, which cuts a value pasted with its separators, or `pattern="[0-9]*"` with the browser''s own check switched on.'
  - 'A controlled `<Input>` whose `onChange` rewrites the value, such as `.replace(/\D/g, "")` or adding separators, with no code that puts the caret back where the person was typing after an edit in the middle that the rewrite changes.'
  - 'A masking library set to drop a pasted value that does not match its pattern, or a fixed placeholder such as "(___) ___-____" that takes one country''s phone format only.'
changelog:
  - version: "1.0.0"
    date: 2026-11-26
    note: First version.
---

## Rule

When a field takes a number or code people write in several ways, such as a phone or card number, accept the spaces, hyphens, brackets, dots and letter case they type or paste, and remove them before checking.

## Why

People copy numbers from cards, letters and other apps with whatever spacing they came with, and voice input adds spaces of its own. A value that is right but refused because of a space is hard to put right: the space is easy to miss, and harder still to find with a screen reader, magnification or dictation. The value is only wrong in the form the page expected, so the page can fix it instead of the person.

[WCAG 2.2, 3.3.1 Error Identification](https://www.w3.org/TR/WCAG22/#error-identification) and [3.3.3 Error Suggestion](https://www.w3.org/TR/WCAG22/#error-suggestion) allow a page to refuse such a value, as long as it says what is wrong and how to fix it. [3.3.2 Labels or Instructions](https://www.w3.org/TR/WCAG22/#labels-or-instructions) asks that a format the page needs is stated. Accepting the value in the first place is a step beyond what those criteria ask, and that step is our choice.

## Our reasons

No judge has spoken about separators in numbers and codes, so the verdict is Insufficient evidence (0 of 3 judges spoke) and this guideline is our choice. GOV.UK and NN/g support it; they are expert witnesses who do not vote. GOV.UK gives a dissenting opinion on formatting the value as people type. We allow it within three limits rather than ban it. We accept separators for four reasons.

- **The person did nothing wrong.** "4111 1111 1111 1111" is how the number is printed on the card. Refusing it puts the work on the person and adds an error they have to read, understand and fix.
- **Cleaning is cheap and certain.** Removing spaces, hyphens, brackets and dots, and folding letter case, takes one line of code and loses nothing for these values.
- **A hidden space is the hardest error to see.** A message saying "Enter a valid card number" next to a number that looks valid sends people looking for a mistake they cannot find.
- **A formatter that works against the person is worse than none.** Keeping the caret in place is our own reading of what that means: a field that jumps the caret to the end after each edit in the middle makes a small fix hard, and no source names this. The other two limits, no refused character and no lost paste, follow from the rest of this guideline.

## Do

- A field that formats as people type never refuses a character, drops a paste or moves the caret from where they type.
- On a library's membership form, *Library card number* is checked with a schema that cleans first: `z.string().transform((v) => v.replace(/[\s\-().]/g, "")).pipe(z.string().regex(/^\d{14}$/))`. "2938 0047 1182 06" and "29380047118206" both pass.
- *Mobile number* takes "+44 7700 900123", "07700 900123" and "(07700) 900-123". Keep a leading plus sign; remove the rest of the separators before checking.
- *Booking reference* takes "kp4 92x", "KP492X" and " KP4-92X ". Fold it to one case and remove spaces and hyphens before checking.
- Clean the value that is checked and sent, not what the field shows. The field keeps what the person typed or pasted, so they can compare it with where it came from. FRM-017 counts this cleaning as no change to the paste.
- If *Card number* adds a space after every four digits as people type, a typed space or hyphen is ignored rather than refused, a pasted "4111-1111-1111-1111" is reformatted whole, and an edit in the middle leaves the caret where the person is typing.
- If the field shows a prefix such as "+44" outside the input, accept the prefix typed again in the field too.
- Leave `maxLength` off these fields and check the length after cleaning. A cap sized for any one format still cuts a paste in another, with nothing to say so, which FRM-017 rules out. An error for a value that is still wrong after cleaning appears at the field (FRM-002a) and says what to do, such as "Enter a card number with 16 digits", as TXT-001a describes.
- Keep these fields as text inputs (FRM-014b). A digit keypad from `inputMode="numeric"` (FRM-014a) may have no space or hyphen key; that is fine, since this guideline asks only that separators people type or paste are accepted.

## Don't

- Check *Card number* with `z.string().regex(/^\d{16}$/)` on the raw value, so "4111 1111 1111 1111" fails with "Invalid card number".
- Block every key but digits in `onKeyDown`, so *Mobile number* refuses the plus sign and the space.
- Give *Card number* `maxLength={16}`, so the spaces people write use up characters and a pasted "4111 1111 1111 1111" loses its last four digits.
- Rewrite the value in `onChange` with `.replace(/\D/g, "")` on a controlled `<Input>`, so the caret jumps to the end after an edit in the middle that the rewrite changes, such as a space typed between two digits.
- Use a phone mask with the placeholder "(___) ___-____", which drops a paste in any other country's format.

## Exceptions

- **Amounts and quantities.** Prices, sums and measurements are outside this guideline. Their decimal and thousands separators depend on the person's locale, which is a different problem.
- **Free text.** Names, addresses and messages keep the characters people type. Length limits on free text are FRM-017b and FRM-017c.
- **Sign-in codes.** A one-time code with a space in it is FRM-008.
- **A value that is still unclear after cleaning.** When the cleaned value could mean two things, such as a phone number that could belong to two countries, ask, or show an error that states the format, as FRM-002a and TXT-001a describe.
- **A product that chooses otherwise.** This is a guideline. A field that refuses separators still states the format it needs (3.3.2) and explains a refused value (3.3.1, 3.3.3).
