---
id: DST-001b
title: Ask before an action only when it cannot be reversed or a mistake would cost a lot
short: When to ask first
area: destructive
status: decided
version: "1.0.4"
verdict: unanimous
judges: { spoken: 3, agreeing: 3 }
law:
  - criterion: "3.3.4"
    name: Error Prevention (Legal, Financial, Data)
    url: https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data
    relation: supports
stances:
  material: { stance: supports, sources: [material-dialogs, material-snackbar] }
  apple:    { stance: supports, sources: [apple-alerts, apple-feedback, apple-action-sheets] }
  carbon:   { stance: supports, sources: [carbon-modal, carbon-dialog-pattern, carbon-notification-pattern] }
  govuk:    { stance: supports, sources: [govuk-button] }
  nngroup:  { stance: supports, sources: [nngroup-confirmation-dialog] }
conflicts_checked: 2026-11-26
check: review
how_to_check:
  - 'For each confirmation question, ask whether the whole previous state can come back right after, for the person who acted. If it can, the question should go and *Undo* take its place.'
  - 'For each step without a question, ask whether it erases stored data with no way back, moves money or commits the person, such as *Pay*, *Send invoice* or a permanent delete. Those need a question.'
  - 'A question before a routine step that can be switched back, such as hiding a column, changing a setting or archiving, or before a chat message, comment or reaction.'
  - 'A payment or legal step treated as reversible because a short-lived *Undo* shows, or a bulk step whose *Undo* brings back only part of what has value. Leave alone closing a dialog with unsaved input.'
changelog:
  - version: "1.0.4"
    date: 2026-11-26
    note: The exception for unsaved input now also covers pages and names FRM-004c and FRM-004d.
  - version: "1.0.3"
    date: 2026-11-24
    note: The exception for unsaved input now also names FRM-004b for dialogs and sheets that do not fill the screen.
  - version: "1.0.2"
    date: 2026-11-24
    note: Adds a three-step test for when to ask.
  - version: "1.0.1"
    date: 2026-11-21
    note: Examples in English.
  - version: "1.0.0"
    date: 2026-11-21
    note: First version.
---

## Rule

Ask the person to confirm a step only when it cannot be reversed and destroys, spends or commits something of value, or when a mistake would cost a lot and be hard to put right, such as a charge to a card; never ask before any other step.

## Why

A question before a step is a small wall. Put up rarely, it makes people stop and read. Put up for everything, it becomes a click people make without looking, and then it fails on the one day it matters. So the question is kept for the two cases in the rule, where there is no way back from a real loss, or where the way back is long, costly or uncertain. Inside those cases, choosing the step on purpose is no reason to skip the question. For every other step, the safeguard is to let it happen and make it easy to take back, as DST-001a describes. That includes routine steps, and it includes rare steps that cost little and can be fully reversed. A routine step is one people take often in their normal work, and that costs little if it goes wrong. "Fully reversed" means the whole previous state comes back, for the person who acted, right after they acted. "Never ask" is our firm reading: outside those two cases, a question costs more attention than it saves. For pages that make payments or legal commitments, or that change or delete data the person has stored in the product, [WCAG 2.2, 3.3.4 Error Prevention (Legal, Financial, Data)](https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data) accepts a chance to review and confirm as one safeguard and a way to reverse as another. It requires neither one in particular. Asking only rarely, and preferring Undo where it is possible, is our design choice on top of that.

The rule as a test, taken in order:

1. Can the whole previous state be brought back, by the person who acted, right after they acted? Then never ask. Run the step and offer *Undo*.
2. If not, does the step erase stored data, move money or commit the person to something, such as an invoice or a legal step? Then ask.
3. Otherwise, do not ask.

A way back that is slow, costly or uncertain counts as no way back in the first step.

## Do

- Ask before *Delete March readings* when the readings are stored nowhere else.
- Ask before *Pay $4,800*. Money that has left the account is slow and uncertain to get back.
- Ask before *Cancel booking* when the $500 fee is not refunded.
- Ask before *Send invoice to customer*. Once it is in someone else's inbox, the product cannot pull it back, and the customer now owes money.
- Ask before *Delete 2024 receipts* when it erases 340 receipts for good. DLG-003 covers how the question names what is lost.
- Archive a project at once when *Archive* brings it back with one click. Show a message with *Undo* instead of a question, as DST-001a says.
- Remove the tag *Draft* from twelve files at once when *Undo* puts it back on all twelve.
- Reset a dashboard to its default layout without a question, even though people seldom do it, when *Undo* brings back the old layout.
- When you do ask, word the question and the buttons as DLG-003 says, place focus as DLG-004 says, and style the action as DLG-005 says. If the step is started inside a dialog, the question follows DLG-002.

## Don't

- Ask "Hide the Price column?" when the column can be shown again with one click.
- Ask before every change to a setting that can simply be switched back.
- Show the same warning style and the same question for archiving a project as for erasing a year of bookkeeping. When every step gets a question, people stop reading them.
- Skip the question before *Delete March readings* because the person picked it from a menu on purpose.
- Count a payment as reversible because an *Undo* link shows for five seconds. A short-lived Undo is not a full way back for money or a legal step.

## Exceptions

- **Routine sends.** A chat message, a comment or a reaction cannot be called back once others have seen it, but it is a routine step that spends or commits nothing of value. Send it without a question.
- **Undo that covers only part.** When a step on many items has an Undo that brings back only some of what changed, and what is lost has value, treat the rest as something that cannot be reversed and ask. When Undo brings back everything, as with the tag on twelve files, do not ask.
- **Unsaved input in a dialog, a sheet or on a page.** Closing a view or leaving a page that would throw away unsaved input is not decided by this rule. FRM-004a covers full-screen dialogs, the guideline FRM-004b covers dialogs and sheets that do not fill the screen, and the guideline FRM-004c covers pages, with FRM-004d for keeping the work instead.
