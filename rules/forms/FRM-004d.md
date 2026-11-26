---
id: FRM-004d
title: Keep what people enter in a longer page form when they leave, and show that it is kept
short: Keep work on leaving
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
  - criterion: "4.1.3"
    name: Status Messages
    url: https://www.w3.org/TR/WCAG22/#status-messages
    relation: supports
stances:
  material: { stance: silent }
  apple:    { stance: supports, sources: [apple-file-management] }
  carbon:   { stance: silent }
  govuk:    { stance: supports, sources: [govuk-task-list, govuk-complete-multiple-tasks, govuk-button, govuk-question-pages] }
  nngroup:  { stance: supports, sources: [nngroup-serial-task-switching, nngroup-cancel-vs-close, nngroup-efficiency-vs-expectations] }
conflicts_checked: 2026-11-26
check: runtime
how_to_check:
  - 'On a page form with a multi-line text field, more than one step or five or more controls, fill it in, reload or close the tab, come back, and see whether everything entered is still there.'
  - 'After a change, see whether a short line near the form says it is kept, and whether that line stops saying so when a save fails.'
  - 'Such a form whose values live only in `useState` or react-hook-form, with no save on change and no draft kept on the server or in the browser.'
  - 'A save with no status shown near the form, a "Saved" that shows before the server has answered, or a delayed save that is dropped when the route changes or the tab closes.'
  - 'A draft in the browser''s storage that holds a password, a card number or a one-time code.'
changelog:
  - version: "1.0.0"
    date: 2026-11-26
    note: First version.
---

## Rule

On a page form with a multi-line text field, more than one step, or five or more controls, a radio or tick-box group counting as one, keep what the person enters when they leave: save each change or keep a draft to return to. Show near the form that it is kept.

## Why

A question before leaving, as FRM-004c asks, protects the work only at the moment the person leaves on purpose. It cannot help when the browser crashes, the battery runs out or the session ends, and many phone browsers never show the prompt when a tab is closed. Work that is kept as the person goes survives all of those, and leaving then needs no question at all. Keeping it quietly is not enough: on a form, people tend to assume nothing is stored until they press a button, so they need to see that it is. No WCAG criterion asks for this. [WCAG 2.2, 3.3.4 Error Prevention (Legal, Financial, Data)](https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data) covers stored data, not unsaved input; this guideline only shares its aim of avoiding a loss that is hard to put right. The line that says the work is kept is a status message, so it must reach assistive technology without taking focus, which supports [4.1.3 Status Messages](https://www.w3.org/TR/WCAG22/#status-messages).

## Our reasons

Fewer than two judges have spoken about keeping work on pages, so the verdict is Insufficient evidence (1 of 3 judges spoke) and this guideline is our choice. Apple supports keeping the work; showing that it is kept rests on NN/g, not on Apple. GOV.UK and NN/g support the guideline as expert witnesses who do not vote. That Apple's stance carries to the web is our own reading. We keep the work for four reasons.

- **A question does not cover every way out.** The browser decides whether its leave prompt shows, and a crash or a lost connection shows nothing. Only work that is already kept is safe in all those cases.
- **It costs the person nothing.** A question costs a step each time someone leaves with changes. A kept draft costs no step, and the person who comes back finds their work.
- **Seeing it matters as much as keeping it.** A person who cannot tell whether their work is kept either worries or saves it twice by hand. A short line near the form settles it.
- **The line has to be drawn somewhere.** A short form is quick to fill in again, and a plain *Save* can be clearer there. Where the line goes is our own choice: a multi-line text field, more than one step, or five or more controls the person fills in or sets, with a group of radio buttons or tick boxes counting as one.

## Do

- A hiking club has a page *Write a trip report* with *Route*, *Date*, *Report* and *Photos*. While the member writes, the product keeps a draft on the server a moment after typing stops. A line under the heading reads "Saving …" and then "Draft kept at 14:05". It is a polite status that does not move focus, as FBK-004 says. *Publish report* still publishes; keeping the draft never does.
- The member closes the tab and comes back on Thursday. *Write a trip report* opens with the draft and a line "Your draft from Tuesday is back." with *Discard draft*, so old values never appear without a word.
- *Discard draft* removes something the person stored, so it follows DST-001a, or DST-001b if the draft cannot be brought back.
- While every change is kept, leaving asks nothing and no guard from FRM-004c is active. While a save is still waiting or has failed, the work is not kept: send the waiting save at once when the person leaves, or let FRM-004c's guard ask until a save succeeds.
- Also write a draft in the browser's storage on `pagehide` or `visibilitychange`, not only after a pause, so closing the tab right after typing keeps the last words.
- A member who is not signed in fills in *Join the club*. The draft is kept in the browser's storage, and the page says so, with *Discard draft* for a shared computer. The draft belongs to this form, and to this person where the product knows who it is, and it is removed once *Join the club* has succeeded, so it never comes back on a later visit.
- *Join the club* has three steps. Going back a step shows every answer as it was, so the browser back button loses nothing.
- The page *Hike leader profile* has *Phone*, *First aid course date*, *Areas you lead in* (a group of tick boxes, which counts as one control), *Longest hike you lead* and *About you*. Each value is saved when the person moves on from its control, and one line at the top of the form reads "All changes saved" once the server has answered.
- Keep values as typed, also when they are not valid yet. Sending still checks them, and errors show as FRM-002a says.
- When a save fails, say so in the same line, such as "Not saved. Check your connection.", as FBK-002 asks. Until a save succeeds the work is not kept, so FRM-004c applies again.
- After each save, reset the form's starting values to the saved ones, such as `reset(values)` in react-hook-form, so a guard from FRM-004c does not think the work is unsaved.
- Our own choice: wait until typing pauses before saving, rather than sending every key press.
- When a change takes effect for other people at once, such as the club's public event page or a membership fee, do not save each change as it is made. Keep a draft, and let a deliberate *Publish* or *Save* apply it.

## Don't

- Hold a half-written trip report only in `useState`, so a reload or a closed tab throws it away.
- Save in the background with no line near the form, so the member cannot tell whether the report is kept.
- Show a toast for every save. The line near the form is enough, and FBK-003 asks for results in the view.
- Show "Saved" before the server has answered, or keep showing it after a save failed.
- Keep a draft and still ask "Discard changes?" when the person leaves.
- Show an unsaved-changes marker on a page whose work is kept as the person goes.
- Bring back an old draft without saying so, or with no way to throw it away.
- Keep a card number, a password or a one-time code in a draft in the browser's storage.

## Exceptions

- **Shorter forms.** Our own choice: a page form with one to four controls, none of them a multi-line text field, in one step, is outside this guideline. A plain *Save* is fine there, and FRM-004c asks before leaving throws its changes away.
- **Committing steps.** Keeping a draft never sends, pays, publishes or commits anything. The final action keeps any question DST-001b asks for it.
- **Sensitive values.** Our own choice: never keep passwords, card numbers or one-time codes in a draft in the browser's storage. Keep the rest of the form.
- **Dialogs and sheets.** FRM-004a and FRM-004b already prefer keeping the work in dialogs. This guideline is about pages.
- **Time limits.** A kept draft lets the person carry on after signing in again, but it does not replace what STA-004 asks for a time limit.
