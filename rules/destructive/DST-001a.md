---
id: DST-001a
title: Make destructive actions reversible, and offer Undo instead of asking first
short: Undo over asking
area: destructive
status: decided
version: "1.0.4"
verdict: unanimous
judges: { spoken: 2, agreeing: 2 }
law:
  - criterion: "3.3.4"
    name: Error Prevention (Legal, Financial, Data)
    url: https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data
    relation: supports
stances:
  material: { stance: supports, sources: [material-snackbar, material-snackbar-accessibility, material-dialogs, material-ux-writing] }
  apple:    { stance: supports, sources: [apple-undo-and-redo, apple-alerts, apple-feedback] }
  carbon:   { stance: silent }
  govuk:    { stance: silent }
  nngroup:  { stance: supports, sources: [nngroup-confirmation-dialog, nngroup-user-control-and-freedom] }
conflicts_checked: 2026-11-26
check: review
how_to_check:
  - 'For each delete, archive, remove or bulk change, ask whether the product can bring back the whole previous state. If it can, the step should run at once and offer *Undo*, with no confirmation question first.'
  - 'Code that erases a record for good, such as a hard `DELETE`, and ask whether a soft delete to *Deleted items*, an archive or a kept history could make it reversible.'
  - 'A sonner `toast` with an *Undo* `action` that closes by itself while the person is still in the view, because neither it nor the `Toaster` sets `duration: Infinity`.'
  - 'An *Undo* that restores only part, such as the item without its files, comments or place in the list, or an *Undo* shown for something that has left the product, such as a sent email.'
  - 'An *Undo* reachable only by Ctrl+Z with nothing on screen, or a message with *Undo* that takes focus when it appears.'
changelog:
  - version: "1.0.4"
    date: 2026-11-26
    note: The exception for unsaved input now also covers pages and names FRM-004c and FRM-004d. A delete the server refuses brings the item back and withdraws Undo (STA-005a).
  - version: "1.0.3"
    date: 2026-11-24
    note: The exception for unsaved input now also names FRM-004b.
  - version: "1.0.2"
    date: 2026-11-24
    note: How long Undo stays now follows FBK-005 instead of repeating it as our own choice.
  - version: "1.0.1"
    date: 2026-11-21
    note: Examples in English.
  - version: "1.0.0"
    date: 2026-11-21
    note: First version.
---

## Rule

Make destructive and other significant actions reversible wherever the product can, and when an action can be fully reversed, carry it out at once and offer Undo right after it. DST-001b decides when a question is still needed; it never is for a routine action that Undo fully reverses.

## Why

People slip. They pick the wrong row, tap a moment too early or change their mind a second later. A question before every such step does not stop that for long: when it comes every time, people answer it without reading, and then it protects nothing. An Undo works the other way round. The person gets what they asked for at once, and a mistake costs one click to put right. That only holds if the reversal is real and easy to reach. It has to bring back everything as it was, and it has to stay long enough to be used. A message that closes after a few seconds can be gone before someone who uses a screen reader, magnification or a switch has reached it. Keeping *Undo* until the person is done with it means no one has to race a timer, which stays clear of the time limits that [WCAG 2.2, 2.2.1 Timing Adjustable](https://www.w3.org/TR/WCAG22/#timing-adjustable) is about. On the web, as we read it, a visible Undo is needed: the browser's own undo reaches text being typed, not what an app does with its own data, so without a control on the page there is no way back at all. Where [3.3.4 Error Prevention (Legal, Financial, Data)](https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data) applies, a way to reverse the action is one of the safeguards it accepts. Checking the input or a chance to confirm are the others, so the criterion does not ask for Undo. Choosing Undo over a question is our design choice.

## Do

- The person archives the project *Autumn 2026*. It leaves the list at once, and a message near the list says "Project Autumn 2026 archived" with the button *Undo*. *Undo* puts it back in the same place, and the project also stays under *Archive*.
- The person removes the tag *Receipt* from twelve files at once. The tags disappear, and the message "Tag Receipt removed from 12 files" offers *Undo*, which puts the tag back on exactly those twelve files.
- Build the reversal before choosing not to ask. Move a deleted item to *Deleted items* for 30 days instead of erasing it, or keep the previous values of a settings page under *History*, so *Undo* can restore them all and the person can still do so later.
- Let *Undo* bring back the whole previous state: the item, its contents, its comments, its tags, its place in the list and who could see it.
- Say in the message what happened, so *Undo* is clear without guessing. If the button needs a longer accessible name, start it with the visible word, such as "Undo archiving Autumn 2026".
- Keep *Undo* on screen for as long as FBK-005 says: until the person uses it, closes it or leaves the view, or a newer message makes it moot. Nobody has to catch it in time. After that, a lasting way back such as *Deleted items*, *Archive* or *History* remains.
- Show the new state in the view itself, as FBK-003 says. The message is an addition, never the only sign. Announce the message without moving focus, as FBK-004 says.
- Make *Undo* reachable with the keyboard in the normal tab order. A shortcut such as Ctrl+Z may also work, but never as the only route.
- If the server refuses a delete that has already left the list, the item comes back in its place, the message with *Undo* is withdrawn, and the failure shows where FBK-002 says (STA-005a).
- After *Undo*, show the project back in its place. If focus was on *Undo* and the message closes, move focus to the restored project.
- The person presses *Delete* in the dialog *Edit contact*. The action closes the dialog, the contact leaves the list, and *Undo* is offered on the page. No confirmation question is added. If one were, DLG-002 would have it replace the dialog's content.

## Don't

- Put a question such as "Archive this project?" in place of *Undo*. Whether to ask is for DST-001b, and an archive that *Undo* or *Archive* reverses in one click is the kind of step it lets run at once.
- Let the message with *Undo* close by itself after five seconds while the person is still in the view.
- Offer *Undo* that brings back the project but not its files, or the tag on some files but not all of them.
- Hide the reversal behind Ctrl+Z alone, with nothing on the screen.
- Move focus into the message when it appears, so the person is pulled away from what they were doing.
- Erase a record for good because a soft delete was more work to build. "Where the product can" means what is possible, not what is convenient.
- Show *Undo* for something that has already left the product, such as an email sent to a customer, as if it could call it back.

## Exceptions

- **Actions that cannot be fully reversed.** A payment that has gone through, a message delivered to other people or a legal step has no full Undo, so this rule's second half does not apply. DST-001b decides whether to ask first, also for a step that can be reversed but would cost a lot if it went wrong. How that question looks and behaves is covered by DLG-003, DLG-004 and DLG-005.
- **Unsaved input in a dialog, a sheet or on a page.** FRM-004a decides what closing a full-screen dialog does, and the guideline FRM-004b what closing a smaller dialog or a sheet does. The guideline FRM-004c decides what leaving a page does, and the guideline FRM-004d prefers keeping the work there. If closing or leaving keeps a draft the person can get back, nothing is thrown away and no question is asked.
- **Typing in a field.** Changing text the person is still typing is not an action in this rule. The browser's own undo covers it.
