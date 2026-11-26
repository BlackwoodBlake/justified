---
id: FRM-004c
title: Ask before leaving a page throws away unsaved changes, and only when something would be lost
short: Unsaved changes, page
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
  apple:    { stance: silent }
  carbon:   { stance: supports, sources: [carbon-dialog-pattern, carbon-common-actions, carbon-tabs] }
  govuk:    { stance: silent }
  nngroup:  { stance: supports, sources: [nngroup-user-control-and-freedom, nngroup-serial-task-switching, nngroup-ui-copy] }
conflicts_checked: 2026-11-26
check: runtime
how_to_check:
  - 'On a page form, change one field, then try a menu link, a breadcrumb, the page''s Cancel, the browser back button, a reload and closing the tab, and see whether every way that discards asks first.'
  - 'Leave with nothing changed, after typing and deleting, or after a successful save. See whether it leaves at once with no question, and whether Cancel in a question keeps every value and the address.'
  - 'A route guard such as `useBlocker` that also stops the product''s own move after a successful save or a time-limit sign-out, so "Discard changes?" shows for a move the person did not make.'
  - 'A `beforeunload` listener that does not depend on `isDirty`, a `window.confirm()` for a move inside the product, or a guard on `router.push` alone that lets `Link` clicks and the back button through.'
  - 'A question with a third button such as "Save and leave", choices named "OK", "Yes" or "No", or any question on a page whose changes are already kept as the person goes.'
changelog:
  - version: "1.0.0"
    date: 2026-11-26
    note: First version.
---

## Rule

When leaving a page would throw away unsaved form changes, ask first, by every route out: inside the product with *Cancel* to stay and a button naming the discard, and on closing or reloading the tab with the browser's own prompt. When nothing would be lost, leave at once.

## Why

An edit page is where people spend the longest on one form: a profile, a listing, a record with a dozen fields. On the web it is also full of ways out. A menu item, a breadcrumb, the back button and the tab's close button all sit a few pixels from the work, and none of them says that it throws anything away. When the person finds out, the page is gone and so is what they wrote. One short question at that moment gives the work a second chance. The question only helps if it is rare, so a page that has nothing to lose lets the person go at once, and a page that keeps the work as the person goes, as FRM-004d prefers, never asks at all. FRM-004a and FRM-004b do the same for dialogs; this guideline covers pages, with the same buttons and the same way of counting changes. No WCAG criterion requires this question. [WCAG 2.2, 3.3.4 Error Prevention (Legal, Financial, Data)](https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data) asks for a safeguard before stored data is changed or deleted; unsaved input is not stored data, but this guideline gives the same kind of safeguard for a loss that is just as hard to undo. The product's question must be exposed as a dialog with a role and a name, so a screen reader user knows the page did not simply change, which supports [4.1.2 Name, Role, Value](https://www.w3.org/TR/WCAG22/#name-role-value).

## Our reasons

Fewer than two judges have spoken about leaving a page with unsaved changes, so the verdict is Insufficient evidence (1 of 3 judges spoke) and this guideline is our choice. Carbon supports it. So does NN/g, an expert witness who does not vote. Applying it to every way out of a page, and counting the browser's prompt as the question, is our own reading. We ask on pages for four reasons.

- **A page has more ways out than a dialog.** Every link in the sidebar, every breadcrumb and the browser's own buttons leave the form behind, and none of them looks like it throws anything away. A check on one of them alone protects nothing.
- **The loss is the same as in a dialog.** FRM-004a and FRM-004b already ask before a dialog throws work away. The same form often lives in a dialog on one screen and on a page on another, and the person should keep their work on both.
- **Leaving cannot be taken back.** Once the page is gone, no *Undo* returns what was typed. Only the moment before leaving can save it.
- **The question must stay rare.** So we ask only when a value really differs from what the page loaded with, and never when the work is kept, as FRM-004d prefers. Unlike FRM-004b, we make no exception for one small change. A page form is often long and leaves no trace of what was typed, so we keep the line simple: any change that would be lost asks.

## Do

- A holiday-rental host opens the page *Edit listing* for *Harbour Cottage*, with *Title*, *Description*, *Nightly price*, *Cancel* and *Save listing*. The page keeps no draft. The host rewrites the description, then clicks *Bookings* in the sidebar. A confirmation opens over the page: "Discard changes to Harbour Cottage?" with *Cancel* and *Discard changes*.
- *Cancel* in the question means "do not leave". It closes the confirmation, keeps every value on the page, and puts focus back on *Bookings*, the link that was clicked, as DLG-006 says. When the question came from the browser back button, there is no opener: focus goes back to where it was before the press, the logical place nearby that DLG-006 asks for.
- *Discard changes* goes where the person was heading, here to *Bookings*. Never trap the person on the page.
- Ask on every way of leaving inside the product that would throw the changes away: links and menu items, breadcrumbs, the page's own *Cancel* and back button, and the browser back and forward buttons when the router handles them. Send them all through one guard, such as React Router's `useBlocker`, so none can skip the question.
- The host presses the browser back button and then *Cancel* in the question. The page stays, and the address and the browser history are as they were before the press.
- Build the product's question as a destructive confirmation, such as shadcn `AlertDialog`. Word its title and buttons as DLG-003 and ACT-001a say, put *Cancel* before *Discard changes* as ACT-003a says, start focus on *Cancel* as DLG-004 says, and give *Discard changes* the danger style as DLG-005 says. Escape does what *Cancel* does, as DLG-001 says. It opens over the page, not over another dialog, so DLG-002 does not stand in its way.
- Leaving the document is the browser's to show: closing the tab, reloading, typing a new address or following a link to another site. For these, handle `beforeunload` and call `preventDefault()`, so the browser shows its own prompt. Add the handler only while the form has unsaved changes and remove it when they are saved or undone. The browser words the prompt; a custom text in `returnValue` is not shown. That this prompt counts as the question is our own reading for the web (see Our reasons).
- Count a change only when a value differs from what the page loaded with, such as `formState.isDirty` in react-hook-form. Typing in *Title* and deleting it again is no change. A value the product filled in by default is not a change by the person, but a value the browser or a password manager filled in at the person's request is.
- The host opens *Edit listing*, reads it, changes nothing and clicks *Bookings*. The page changes at once.
- *Save listing* succeeds and the product moves on to *Listings*. That move never asks. Reset the form's starting values to the saved ones, such as `reset(values)`, before the redirect, so the guard sees nothing unsaved.
- *Save listing* fails because the server does not answer. The page stays with every value kept and shows the failure as FBK-002 says. The changes are still unsaved, so leaving still asks.
- The page has tabs *Details* and *Photos*, and switching tab removes the *Details* fields with their values. Treat the switch as leaving and ask, or better, keep the values when the tab changes.
- Prefer keeping the work wherever the product can, by saving as the person goes or keeping a draft, as FRM-004d describes. Then leaving never asks.

## Don't

- Move to *Bookings* at once after the host has rewritten the description, with no word.
- Ask on the page's *Cancel* but let a sidebar link or the browser back button leave with no question.
- Use `window.confirm()` for a move inside the product, so the choices read *OK* and *Cancel* and none of them names the discard.
- Add a `beforeunload` handler that is always on, so reloading an untouched page brings up the browser's prompt.
- Ask "Discard changes to Harbour Cottage?" right after *Save listing* succeeded, because the form's starting values were never reset.
- Disable the back button, or push extra entries into the history so back stays on the page.
- Add a third button to the question, such as *Save and leave*. Keep the work as FRM-004d describes instead.
- Label the choices *Yes* and *No*, or put *Keep editing* or *Stay on page* in place of *Cancel*.
- Start focus on *Discard changes*, or let Enter press it before the person has moved there.

## Exceptions

- **Dialogs and sheets.** FRM-004a covers full-screen dialogs and the guideline FRM-004b dialogs and sheets that do not fill the screen. A form in a dialog follows them, also when the dialog sits on a page. Unlike FRM-004b, this guideline has no exception for one small change: a page asks after any change that would be lost. That is our own choice.
- **Work that is kept.** When the page saves each change as it is made, or keeps a draft and says so, as FRM-004d describes, nothing would be lost and the page never asks. If a save fails, the work is no longer kept, and this guideline applies until a save succeeds.
- **Moving within one form.** Going to another step of the same form is not leaving when the steps keep their values. If a step change throws values away, it asks like any other way out.
- **Opening a link in a new tab.** Nothing is lost, so nothing is asked.
- **While sending.** Our own choice: once the person has pressed the main action, such as *Save listing*, the changes still count as unsaved until the reply says they are saved, so leaving during the wait asks as before. STA-005a covers how the wait is shown.
- **Time limits.** Being signed out when a session runs out is not the person leaving. STA-004 covers it.
