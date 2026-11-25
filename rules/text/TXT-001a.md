---
id: TXT-001a
title: Say what went wrong, what it concerns and what to do next
short: Error messages
area: text
status: decided
version: "1.0.2"
verdict: unanimous
judges: { spoken: 3, agreeing: 3 }
law:
  - criterion: "3.3.1"
    name: Error Identification
    url: https://www.w3.org/TR/WCAG22/#error-identification
    relation: supports
  - criterion: "3.3.3"
    name: Error Suggestion
    url: https://www.w3.org/TR/WCAG22/#error-suggestion
    relation: supports
stances:
  material: { stance: supports, sources: [material-dialogs, material-text-fields] }
  apple:    { stance: supports, sources: [apple-writing, apple-alerts, apple-feedback] }
  carbon:   { stance: supports, sources: [carbon-notification, carbon-notification-pattern, carbon-forms, carbon-login, carbon-modal] }
  govuk:    { stance: supports, sources: [govuk-error-message, govuk-error-summary, govuk-validation] }
  nngroup:  { stance: supports, sources: [nngroup-error-message-guidelines, nngroup-errors-forms] }
conflicts_checked: 2026-11-24
check: review
how_to_check:
  - 'A problem message that is only a verdict or a code, such as "Invalid value", "Error", "Something went wrong" or "B-4031".'
  - 'zod''s default texts left in place at a field, such as "Required" or "String must contain at least 1 character(s)" in zod 3, or "Invalid input" in zod 4, instead of a message that says what is wrong or what to do.'
  - 'A message that names an internal key, such as "billing_zip is missing", or that sits away from its thing, such as in a toast, without naming the file, field or item by its visible name.'
  - 'A message that stops after the fault, such as "Payment declined.", with no fix, retry, wait or place to get help in its text or a control beside it. Leave alone sign-in and security messages that name only the pair (see Exceptions).'
changelog:
  - version: "1.0.2"
    date: 2026-11-24
    note: Focus on a failed send now refers to FRM-011.
  - version: "1.0.1"
    date: 2026-11-21
    note: Examples in English.
  - version: "1.0.0"
    date: 2026-11-21
    note: First version.
---

## Rule

Every message about a problem says in plain words what went wrong, names the thing it concerns by the name the person sees, and gives a next step: the fix when it is known, otherwise a retry, a wait or where to get help.

## Why

A problem stops people in the middle of a task. If the message only says that something failed, they have to guess what broke, where, and whether their work is lost, and some give up. A message that names the thing and the way forward lets them carry on. When a value someone entered is caught automatically, much of this is what [WCAG 2.2, 3.3.1 Error Identification](https://www.w3.org/TR/WCAG22/#error-identification) and [3.3.3 Error Suggestion](https://www.w3.org/TR/WCAG22/#error-suggestion) ask for. Those criteria do not reach a server that does not answer, a session that has expired or a missing permission. Asking the same of every problem message is our design choice.

## Do

- A receipt is too large to upload. Write "The file *receipt-march.pdf* is 18 MB. Upload a file of 10 MB or less." It names the file, says what is wrong and what to do.
- A field *Start date* holds "3 June". The message "Write the date in numbers, for example 2027-06-03" is enough on its own: the instruction makes the fault plain.
- A message shown at the field, row or panel it concerns, and tied to it in code, names the thing by that place. The *Start date* message above need not repeat the field's name. Anywhere else, name the thing in words.
- A control placed with the message counts as the next step when its label says what it does, such as a button *Try again* or a link *Sign in* right after "This email address already has an account."
- The time slot a person picked was booked by someone else while they filled in the form. Write "The Friday 2:30 pm slot is no longer free. Choose another time below."
- A card payment is declined. Write "Your bank declined the card ending in 4821. You have not been charged. Try another card or contact your bank." Saying whether anything was charged or kept saves people from worry and from doing the work twice.
- Saving a report fails because the service does not answer. Write "The report *Quarter 3* could not be saved. Your changes are still here. Try again in a moment." and add a button *Try again*.
- Give the time when you know it: "Exports are paused for maintenance until 10 pm. Try again after that."
- The person may not delete a project. Write "You cannot delete the project *Spring campaign*. Ask the project's owner for access."
- A code helps support staff, so add it after the plain words: "If this happens again, contact support and give the code B-4031."
- A heading or a count may sit above the specific messages, such as "2 things need fixing" with one line for each field right beneath it.

## Don't

- Show only "Invalid value" at the field *Start date*. A bare verdict says neither what is wrong nor how to fix it.
- Show only a code, such as "B-4031", when a report cannot be saved.
- Use one catch-all line for every fault, such as "That didn't work", when the person needs to know what failed and what it concerns.
- Repeat the field's purpose instead of the fault. A field *Membership number* holds six digits instead of seven, and the message says "Type your membership number". The same words are right when the field is empty.
- Name the thing by an internal name the person never sees: "billing_zip is missing" instead of *Postcode*.
- Stop after the fault: "Payment declined." with no word on what to do next.
- Show the heading "This form has errors" on its own, with no specific lines beneath it.

## Exceptions

- **Sign-in and other security checks.** When naming the exact field would reveal which accounts exist, name the pair and still give a next step: "That member number and PIN do not go together. Check both and try again." A password reset says what happens next without revealing whether the address has an account: "If that address is registered with us, an email will reach you within a few minutes." The same holds where a hint would give away the answer, as in a test.
- **The note next to an unavailable button.** Under ACT-005, that note may only point the person to a field, such as "Check the postcode to continue", as long as the message at that field follows this rule once it appears.
- **Placement and timing.** Where a field's message is shown is set by FRM-002a, when it appears and clears by FRM-002b, and where focus goes when a form is sent with problems by the guideline FRM-011. Problems inside a dialog follow DLG-002. Where a failed action is shown and how long it stays is set by FBK-002, and how a message is announced by FBK-004. This rule covers only the words.
