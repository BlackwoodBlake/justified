---
id: STA-005a
title: Show that a sent action is under way until the reply comes
short: Show it is sending
area: states
status: proposed
version: "1.0.0"
verdict: unanimous
judges: { spoken: 3, agreeing: 3 }
law:
  - criterion: "4.1.3"
    name: Status Messages
    url: https://www.w3.org/TR/WCAG22/#status-messages
    relation: supports
  - criterion: "4.1.2"
    name: Name, Role, Value
    url: https://www.w3.org/TR/WCAG22/#name-role-value
    relation: supports
  - criterion: "2.5.3"
    name: Label in Name
    url: https://www.w3.org/TR/WCAG22/#label-in-name
    relation: supports
stances:
  material: { stance: supports, sources: [material-progress-indicators, material-loading-indicator] }
  apple:    { stance: supports, sources: [apple-buttons, apple-progress-indicators] }
  carbon:   { stance: supports, sources: [carbon-inline-loading, carbon-button, carbon-modal, carbon-loading-pattern] }
  govuk:    { stance: supports, sources: [govuk-button] }
  nngroup:  { stance: supports, sources: [nngroup-progress-indicators, nngroup-response-times] }
conflicts_checked: 2026-11-24
changelog:
  - version: "1.0.0"
    date: 2026-11-24
    note: First version. Covers the wait between the press and the reply, which ACT-004, ACT-005, DLG-001, DLG-003, FRM-003 and FRM-004a left open.
---

## Rule

When a button sends, saves or deletes something and the reply does not come at once, show that the action is under way until the reply comes.

## Why

Between the press and the reply the person knows nothing. If the view looks the same as before, they cannot tell a press that was taken from one that missed, so they press again, wait in doubt or leave before the work is done. A sign that the action is under way says "we have it". A sign that stays until the reply says "not yet", and keeps the person from reading a spinner that stopped early as an answer. STA-001 says where a wait is shown. This rule adds two things for an action that is sent: that the wait is shown at all, and that the sign lasts until the reply. What the reply then shows is decided by other rules: FBK-003 for a success and FBK-002 for a failure. No WCAG criterion asks for a sign that an action is under way. Once one is shown while focus stays put, it is a status message under [WCAG 2.2, 4.1.3 Status Messages](https://www.w3.org/TR/WCAG22/#status-messages); FBK-004 says how it reaches assistive technology. Two more criteria bear on a button that changes while it works, [4.1.2 Name, Role, Value](https://www.w3.org/TR/WCAG22/#name-role-value) and [2.5.3 Label in Name](https://www.w3.org/TR/WCAG22/#label-in-name), as described under Do.

## Do

- A tool hire shop has a page form *Hire a tool* with *Tool*, *Collection day* and *Number of days*. The person presses *Send hire request* and the reply takes three seconds. While it is on its way the button shows a small spinner and reads "Sending request …", and it goes on doing so until the reply is there. The page that then opens says "Hire request sent. We will confirm it by email." That page is the result, as FBK-003 allows.
- A member of staff presses *Mark as returned* on the hire card *Floor sander, 2 days*. While the change is saved, the card shows "Marking as returned …" next to the button. When the reply comes, the card's status reads *Returned*. The other hire cards show nothing and keep working.
- The dialog *Add an accessory* has *Accessory*, *Quantity*, *Cancel* and *Add accessory*. While it saves, the sign sits inside the dialog, on *Add accessory*, as STA-001 and DLG-002 ask. When the accessory is saved the dialog closes, the accessory is in the hire's list, and focus returns to the button that opened the dialog, as DLG-006 says.
- "Delete the hire Tile cutter, 3 days?" has *Cancel* and *Delete hire*. After the press on *Delete hire* the dialog shows "Deleting …" until the reply. Then the dialog closes and the hire is gone from the list.
- Where the sign goes, at the button, in the part the action acts on or, when STA-001 allows it, over the whole view, is decided by STA-001. This rule only asks that the sign is there and that it lasts.
- "Not at once" uses the figure STA-001 gives as our own choice. The sign may wait until that time has passed, so that nothing flashes for a quick reply. Once it shows, it stays until the reply. A reply that comes sooner shows its result with no sign in between.
- When the reply comes, the sign does not just disappear. A success shows as FBK-003 says and a failure as FBK-002 says. Those rules decide the result; this one does not.
- Our own option, not part of the rule: a short "Request sent" on the button before the next view opens. It never replaces what FBK-003 asks for.
- The working label describes a state. It is not a new action, so the verb-first form in ACT-001a does not apply to "Sending request …". When the reply comes and the button is still on screen, *Send hire request* returns. Our own choice: keep the button's width fixed while the label changes, so nothing around it jumps.
- For as long as the button reads "Sending request …", its accessible name contains those words, as ACT-001b says. A fixed `aria-label` with the old words breaks that. This helps meet 2.5.3.
- If the button changes state while it works, for example by becoming unavailable to a new press as STA-005b describes, expose that state in code, not only in its looks. This helps meet 4.1.2.
- How the wait and the result are announced is FBK-004. Applied here: write a text that names the action, such as "Sending hire request", into a polite live region that was in the page before the press. A spinner alone, with no text for assistive technology, is not enough. When the wait ends and focus stays where it is, write the result there in place of the working text. A result that moves focus, or that opens a new page or a dialog, is not also written to the region. A failure that needs attention now may use `role="alert"`, as FBK-004 says.
- Our own choice: focus stays on the pressed button during the wait. If the result removes the button, focus goes where the rule for that result says, such as DLG-006 when a dialog closes.
- Our own choice, for a dialog: while it sends, *Cancel*, Escape and the close icon behave alike. Choose one of two ways. Stop: each of them withdraws the request, and the view then says what happened. Wait: all three are unavailable until the reply, and the dialog keeps showing that it is working. The dialog never closes while the request runs on unseen.
- Stop, in practice: the dialog *Add photos of the tool* is uploading six photos. *Cancel* stops the upload. The dialog goes back to its form with the six photos still chosen, and a line reads "Upload stopped. No photos were added." A second press on *Cancel* is an ordinary close, and FRM-004b decides whether a question comes first.
- Offer Stop only when the request can truly be withdrawn. A delete or a payment that has left the browser cannot be called back by closing a dialog, so *Delete hire* above uses Wait: *Cancel*, Escape and the close icon do nothing until the reply. With Wait, keep *Cancel* and the close icon focusable and expose that they are unavailable.
- Our own choice: while a dialog sends, no question about discarding input is asked. The input is on its way, so FRM-004a and FRM-004b have nothing to protect until the reply.
- Our own choice: the form and what the person entered stay on screen during the wait. Nothing is cleared before the reply says the send worked.
- *Send hire request* fails because the booking system does not answer. The sign goes, *Send hire request* is ready again, and every answer is still in its field. A notice near the button says "The hire request was not sent. The booking system did not answer. Your answers are still here. Try again in a moment.", as FBK-002 and TXT-001a ask. If the reply instead points at fields, such as a collection day when the shop is closed, the messages show at those fields and focus moves as FRM-011 says.
- Fields may be locked during the wait. That is allowed, not asked for. Our own choice: if you lock them, make them read-only, not disabled, so the values stay readable and focus is not lost, and unlock them if the send fails. If you leave them open, do not silently drop an edit made during the wait.
- When a view has several buttons that send different things, only the pressed one shows work. Our own choice: make another button unavailable only if it depends on the same data.
- Our own choice, for a long wait: say more than a spinner can. STA-001 covers the switch to an indicator that shows how far the work has come. Add a line near the button about what is happening or roughly how long it takes. A send that stalls or times out becomes a failure the person can act on, as FBK-002 says, and never a spinner without end. A job that runs for minutes lets the person go on with other things and leaves a lasting sign when it is done, as FBK-003 says.

## Don't

- Leave *Send hire request* looking exactly as before for four seconds after the press, so the person cannot tell whether it was taken.
- Show "Sending request …" for a second and then put the old label back while the request is still running.
- Take the spinner away when the reply comes and show nothing else. FBK-002 and FBK-003 ask for the result.
- Empty the form as soon as *Send hire request* is pressed, so a failed send leaves nothing to send again.
- Close *Add an accessory* on Escape while the accessory is still being saved, and let the save carry on with no sign of how it ended.
- Let *Cancel* stop the request while Escape closes the dialog and leaves it running.
- Label a button *Stop* when pressing it only hides the dialog and the delete goes through anyway.
- Show the working sign on every hire card because one *Mark as returned* was pressed.
- Give the busy button a spinner with no text, so a screen reader user hears nothing during the wait.
- Let a spinner turn for minutes after the server has stopped answering.

## Exceptions

- **A reply that comes at once.** No sign is needed. The result is the answer.
- **A change shown at once and corrected on failure.** A tick box or a switch that shows its new state on the press, and goes back if the server refuses, has no sending state. FBK-002 covers the refusal.
- **A form that loads a new page.** When the press sends the form the classic way, the browser loads the next page and that page is the result. The browser's own sign of loading is small and easy to miss, so a sign at the button is still the better choice when the reply can be slow. STA-005b applies to a second press either way.
- **Loading content.** A wait for content to appear, with nothing sent, belongs to STA-001.
- **Before the press.** Whether the button is enabled, and what it says when it is not, is ACT-004 and ACT-005. A second press during the wait is STA-005b.
