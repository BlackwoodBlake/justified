---
id: FRM-004b
title: Ask before a dialog or sheet that does not fill the screen throws away unsaved changes, and only when something would be lost
short: Unsaved changes, small dialog
area: forms
status: proposed
version: "1.0.0"
verdict: insufficient-evidence
judges: { spoken: 1, agreeing: 1 }
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
  material: { stance: silent }
  apple:    { stance: supports, sources: [apple-modality, apple-sheets, apple-alerts] }
  carbon:   { stance: silent }
  govuk:    { stance: silent }
  nngroup:  { stance: supports, sources: [nngroup-cancel-vs-close, nngroup-confirmation-dialog, nngroup-modal-nonmodal] }
conflicts_checked: 2026-11-24
check: runtime
how_to_check:
  - 'In a dialog or sheet that does not fill the screen, fill in two fields or a multi-line field, then try Cancel, the close icon, Escape, a backdrop press and a swipe, and see whether every way that discards asks first.'
  - 'Change nothing, or only one short field, one pick or one switch, then close the dialog, and see whether it closes at once with no question (see Exceptions).'
  - 'See whether the question replaces the dialog''s content instead of opening a second dialog on top, and whether its heading becomes the dialog''s name through `aria-labelledby`.'
  - 'An `onOpenChange`, `onEscapeKeyDown`, `onPointerDownOutside` or `onInteractOutside` handler that closes the dialog without the unsaved-changes check that Cancel uses.'
  - 'A change check that counts key presses or touched fields instead of comparing values with what the view started with, such as `touchedFields` in place of `isDirty`.'
changelog:
  - version: "1.0.0"
    date: 2026-11-24
    note: First version.
---

## Rule

When closing a dialog or sheet that does not fill the screen would throw away changes the person has not saved, ask first, whichever way they close it. The question offers *Cancel*, which keeps everything, and a button that names the discard. When nothing would be lost, close at once.

## Why

An ordinary dialog is the easiest view in a product to close without meaning to. Escape is pressed to clear the screen, a click lands just outside the box, a sheet is pulled down by a thumb that was scrolling. If the dialog held a half-written form, all of it is gone, and nothing on the page shows that anything was there. One short question at that moment lets the person take the slip back. When nothing was typed, there is nothing to take back, so the view just closes. No WCAG criterion requires the question. [WCAG 2.2, 3.3.4 Error Prevention (Legal, Financial, Data)](https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data) covers legal and financial steps and data already stored in the product, and unsaved input is none of those. The guideline only shares its aim, a pause before a loss that is hard to put right. When the question takes the form's place, it needs a name that assistive technology can read, so the change is announced, which supports [4.1.2 Name, Role, Value](https://www.w3.org/TR/WCAG22/#name-role-value).

## Our reasons

Fewer than two judges have spoken about ordinary dialogs and sheets, so the verdict is Insufficient evidence and this guideline is our choice. Apple supports it. So does NN/g, an expert witness who does not vote. Apple writes for its own platforms; which ways of closing count on the web is our own reading. We ask in ordinary dialogs too, for four reasons.

- **The loss does not depend on the size of the view.** FRM-004a already asks in a full-screen dialog. The same form is often a full-screen dialog on a phone and an ordinary dialog on a laptop. Twenty typed fields are worth the same in both, and a person should not lose them on one screen and keep them on the other.
- **These views have the most ways out.** Escape, a press on the backdrop and a swipe all close an ordinary dialog or sheet, and each can happen by accident. The more ways out a view has, the more it needs a check on the ones that destroy work.
- **Closing cannot be taken back.** Once the dialog is gone, no *Undo* can return what was typed in it. That is a loss of the same kind as the ones DST-001b keeps questions for, when the work has some size. DST-001b does not decide this case itself: its exception hands unsaved input in a dialog or sheet that does not fill the screen to this guideline.
- **The question must stay rare.** A question that shows on every close becomes a click people make without reading, and then it fails when it matters. So we ask only when a value really differs from what the view started with, and not for a single small change that takes a moment to make again (see Exceptions). We prefer saving as people go, which removes the question altogether. The cost is then one extra press, paid only by someone who did real work and still wants to leave.

## Do

- A volunteer coordinator opens the dialog *New shift* and fills in *Task*, *Date* and *Volunteers needed*, then presses Escape. The dialog's content is replaced by "Discard this shift?" with *Cancel* and *Discard shift*. No second dialog opens on top, as DLG-002 says.
- *Cancel* in the question means "do not leave". It brings back the three fields as the person left them. Focus returns to the form's *Cancel* button if that was pressed, as DLG-002 says, and otherwise to where it was.
- Ask on every way of closing that would throw the changes away: *Cancel*, the close icon, Escape, a press on the backdrop if the product closes dialogs that way, a swipe that dismisses a sheet, and the browser back button if it closes the view. Send them all through the same code, as DLG-001 asks for Escape, so none can skip the question.
- On a phone, a volunteer writes why they cannot come in a sheet *Report an absence* and swipes it down. The sheet stays open and its content is replaced by "Discard this absence report?" with *Cancel* and *Discard absence report*. Treat a modal sheet as a dialog when you apply DLG-002. That is our reading.
- The question is a destructive confirmation. Word its title and buttons as DLG-003 and ACT-001a say, put *Cancel* before *Discard shift* as ACT-003a says, start focus on *Cancel* as DLG-004 says, and give *Discard shift* the danger style as DLG-005 says. Escape inside the question does what *Cancel* does, as DLG-001 says.
- When the question replaces the content, let its heading become the dialog's name, for example with `aria-labelledby`, so a screen reader announces the question when focus moves to *Cancel*.
- Count a change only when a value differs from what the view started with. Typing in *Task* and deleting it again is no change. A value the product filled in, such as today's date in *Date*, is not a change by the person. A value the browser filled in at the person's request is. One small change alone does not bring the question; Exceptions says where the line goes.
- A dialog *Rename rota* has one field, *Name*. The person types a new name and presses Escape. The dialog closes at once and the rota keeps its old name, because one short field is quick to fill in again.
- The person opens *Edit shift*, checks the time, changes nothing and presses the close icon. The dialog closes at once.
- A sheet *Handover notes* saves each change as it is typed and shows "Saved". Closing it never asks, because nothing is at risk. Prefer this wherever the product can do it.
- Keep the question to two buttons. This is our choice. If the product can keep unfinished work, it does so as the person goes or through a way out that says it keeps a draft, as FRM-004a describes, and then no question is needed.
- What *Cancel* must do in the form itself is covered by FRM-003.

## Don't

- Close *New shift* at once on Escape after the person has filled in every field.
- Ask on *Cancel* but let a press on the backdrop or a swipe close the view with no question.
- Ask "Discard your changes?" when the person opened *Edit shift* and changed nothing.
- Ask after one field was touched and put back, because the product counts key presses instead of comparing values.
- Open the question as a second dialog over *New shift*.
- Add a third button to the question, such as *Save draft*.
- Ask "Discard your changes?" when the only change in *Edit shift* is a new pick in *Task*.
- Label the choices *Yes* and *No*, or put *Keep editing* in place of *Cancel*.
- Ask when the way out keeps the work, such as closing *Handover notes*.

## Exceptions

- **One small change.** Our own choice: do not ask when the only change is to one control that is not a multi-line text field, such as one short text field, one pick in a list or one switch. A change to a multi-line text field asks, and so do changes to two or more controls. A full-screen dialog asks after one small change too, because FRM-004a has no such exception.
- **Full-screen dialogs.** They are covered by FRM-004a, which is a rule. Neither text says anything about leaving an ordinary page or a form on a page.
- **Non-modal panels.** A side panel that leaves the page usable is not a modal view and is outside this guideline.
- **While sending.** Once the person has pressed the main action, such as *Add shift*, and the view shows progress, the input is on its way. STA-005a decides what closing does then.
