---
id: FRM-004a
title: Ask before a full-screen dialog throws away unsaved changes, and only when something would be lost
short: Unsaved changes, full screen
area: forms
status: decided
version: "1.0.3"
verdict: unanimous
judges: { spoken: 2, agreeing: 2 }
law:
  - criterion: "3.3.4"
    name: Error Prevention (Legal, Financial, Data)
    url: https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data
    relation: supports
  - criterion: "4.1.2"
    name: Name, Role, Value
    url: https://www.w3.org/TR/WCAG22/#name-role-value
    relation: supports
stances:
  material: { stance: supports, sources: [material-dialogs] }
  apple:    { stance: supports, sources: [apple-modality, apple-alerts] }
  carbon:   { stance: silent }
  govuk:    { stance: silent }
  nngroup:  { stance: supports, sources: [nngroup-cancel-vs-close, nngroup-confirmation-dialog, nngroup-modal-nonmodal] }
conflicts_checked: 2026-11-24
check: runtime
how_to_check:
  - 'In a full-screen dialog, type in a field, then try Cancel, the close icon, Escape, a swipe and the browser back button, and see whether every way that discards asks first.'
  - 'Open the full-screen dialog and close it with nothing typed, or after typing and deleting, and see whether it closes at once with no question.'
  - 'When the question opens, see whether focus starts on Cancel, whether Escape and Cancel keep every value, and whether focus returns to where it was.'
  - 'An `onOpenChange`, `onEscapeKeyDown` or `popstate` handler that closes the full-screen dialog without the same unsaved-changes check that Cancel uses.'
  - 'A question with a third button such as "Save as draft", choices named "Yes" and "No", or a question shown when the way out keeps a draft.'
changelog:
  - version: "1.0.3"
    date: 2026-11-24
    note: Refers to FRM-004b for dialogs and sheets that do not fill the screen and to STA-005a for the time while sending.
  - version: "1.0.2"
    date: 2026-11-24
    note: Title says that the question comes only when something would be lost.
  - version: "1.0.1"
    date: 2026-11-21
    note: Examples in English.
  - version: "1.0.0"
    date: 2026-11-21
    note: First version.
---

## Rule

When closing a full-screen dialog would throw away changes the person has not saved, ask first, whichever way they close it, with *Cancel* to keep everything and a button that names the discard; when nothing would be lost, close at once.

## Why

A full-screen dialog, one that covers the whole screen and is used on small screens, is where people do longer work, and it is easy to leave by accident. A thumb slips onto the close icon, or a swipe meant for something else takes the person back. If that throws away ten minutes of typing without a word, the loss is real and may not be noticed until later. One short question at that moment gives the work a second chance. The question only helps if it is rare. A product that asks every time, also when nothing was typed, teaches people to tap straight through it, and then it protects nothing. That is why closing at once when nothing would be lost matters as much as the question, and why saving as people go is better still. No WCAG criterion requires this question. [WCAG 2.2, 3.3.4 Error Prevention (Legal, Financial, Data)](https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data) asks for a safeguard before stored data is changed or deleted; unsaved input is not stored data, but this rule gives the same kind of safeguard for a loss that is just as hard to undo. The question must be exposed with a role and a name, so a screen reader user knows the view did not simply close, which supports [4.1.2 Name, Role, Value](https://www.w3.org/TR/WCAG22/#name-role-value).

## Do

- On a phone, the person writes a review of a hotel stay in a full-screen dialog *Write a review*, then presses the close icon. One short confirmation opens on top: "Discard this review?" with two buttons, *Cancel* and *Discard review*. Over a full-screen dialog, this one confirmation may sit on top, as DLG-002 says. It opens nothing further.
- Ask on every way of closing that would throw the changes away. That is always *Cancel*. It is also the close icon, Escape, a swipe that dismisses the view and the browser back button, if it closes the view, whenever those throw the changes away too. Send every way out that discards through the same code, so none can skip the question.
- *Cancel* in the question means "do not leave". It closes the confirmation, keeps every word of the review, and puts focus back where it was in the full-screen dialog.
- An action that keeps the work and then closes never asks. If the close icon keeps the review as a draft and says so, it closes at once. Keeping a draft happens this way, or by saving as the person goes, never as a third button in the confirmation.
- When the close icon keeps a draft and *Cancel* discards, give the close icon an accessible name that says so, such as "Save draft and close". Escape, a swipe and the browser back button do what the close icon does: they keep the draft and close at once. Only *Cancel* leads to "Discard this review?". Escape still matches a visible way out, as DLG-001 asks.
- Focus starts on *Cancel* when the confirmation opens, as DLG-004 says. *Discard review* is never the default, so a stray Enter changes nothing. Escape inside the confirmation does what *Cancel* does, as DLG-001 says.
- Give *Discard review* the danger style and a label that names what is lost, as DLG-003 and DLG-005 say.
- Mark only the confirmation as the modal layer while it is open, with the question as its name, so a screen reader announces it and the review beneath cannot be reached.
- Count a change only when a value differs from what the view started with. Typing a word and deleting it again is no change. A value the product filled in by default is not a change by the person, but a value the browser or a password manager filled in at the person's request is.
- The person opens *Write a review*, reads the hotel's questions, types nothing and closes it. It closes at once.
- A full-screen *Packing list* saves each item as it is ticked or typed and shows "Saved". Closing it never asks, because nothing is at risk. Prefer this wherever the product can do it.
- The close icon tries to keep the review as a draft and the save fails. Keep the review open with everything kept, and do not close. Show the problem at the field if it belongs to one, as FRM-002a says, or as a notice inside the dialog if it does not, as DLG-002 says.
- What *Cancel* must do in the form itself is covered by FRM-003.

## Don't

- Close *Write a review* at once on the close icon after the person has typed three paragraphs.
- Ask on *Cancel* but let a swipe or the browser back button close the view with no question.
- Ask "Discard this review?" when the person opened the dialog and typed nothing.
- Show the question when the close icon keeps the review as a draft, since nothing would be lost.
- Add a third button to the confirmation, such as *Save as draft*. Keep a draft by saving as the person goes or through the close icon instead.
- Label the choices *Yes* and *No*, or put *Keep writing* in place of *Cancel*.
- Start focus on *Discard review*, or let Enter press it before the person has moved there.
- Let *Publish review* close the view without publishing when the review cannot be sent, so the person believes it went out. The main action does its job or keeps the view open and says why.
- Stack a second confirmation on top of the first.

## Exceptions

- **Full-screen dialogs only.** Dialogs and sheets that do not fill the screen are covered by the guideline FRM-004b. This rule says nothing about leaving a page or a form on a page.
- **While sending.** Once the person has pressed the main action and the view shows progress, such as "Publishing …", the input is on its way. STA-005a covers what closing does then. Its own choice is that no discard question is asked during the wait.
