---
id: STA-005a
title: Show that a sent action is under way until the reply comes
short: Show it is sending
area: states
status: proposed
version: "1.1.1"
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
conflicts_checked: 2026-11-26
check: runtime
how_to_check:
  - 'Slow the network, press a button that sends, saves or deletes, and see whether a sign that it is working shows and stays until the reply. Leave alone replies that come at once and small changes shown at once that meet the conditions under Exceptions.'
  - 'A submit or save button that does not use `isSubmitting` from react-hook-form, `isPending` from a mutation or `pending` from `useFormStatus`, with no other working sign nearby. A classic form post that loads a new page is left alone (see Exceptions).'
  - 'A working label put back on a fixed timer, such as a `setTimeout` that restores *Send* while the request is still running.'
  - 'A dialog that closes on Escape, *Cancel* or the close icon while its request is still running, so the work goes on with no sign of how it ended. Leave it alone when closing withdraws the request and the view says so.'
  - 'A change drawn before the reply, with `useOptimistic` or a cache write in `onMutate`, for something that pays, sends to other people, publishes or cannot be called back, with no working sign. Also one whose failure branch does not put the earlier state back (see Exceptions); the notice is FBK-002''s.'
changelog:
  - version: "1.1.1"
    date: 2026-11-27
    note: How to check tests the earlier state coming back as this rule's own condition; announcements and state in code are left to FBK-004 and VIS-008a.
  - version: "1.1.0"
    date: 2026-11-26
    note: The exception for a change shown at once now covers any small change the view can put back, not only tick boxes and switches, and says what happens when the change is refused.
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
- Our own choice: a short "Request sent" on the button before the next view opens. It never replaces what FBK-003 asks for.
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
- A change shown at once, as the second exception allows: on the staff board a member of staff drags the hire card *Concrete mixer, 1 day* from *Booked* to *Out*. The card sits in *Out* from the moment it is dropped, and the moved card is the result, as FBK-003 allows. The move itself is announced as ACT-007b describes; the server's agreement adds nothing. The card's *Move to* menu does the same without dragging, as ACT-007a asks.
- The same move, refused: the card goes back to *Booked*, in the place it had, and the card itself reads "Could not be moved to Out. The booking system did not answer." with *Try again*, as FBK-002 asks. The text is written to a polite live region that was in the page before the move, as FBK-004 says. If the card was moved with the keyboard, focus stays on the card in its old place.
- Our own choice: a star button on the tool *Pressure washer* adds it to the person's favourites and fills at once. It goes back to empty after a refusal, and the tool's row then says "Could not be added to favourites." Its accessible name, or `aria-pressed`, follows the star both ways, as VIS-008a asks.
- Our own choice, for fast repeats: when the star is pressed three times within a second, the view follows the last press. A late reply to an earlier press never undoes a later one, and a refusal puts back the last state the server agreed to, not an older copy. Each press sets a state, so this is the harmless repeat STA-005b allows, not a second send.
- Our own choice: the tool name *Hammer drill 800 W* is edited in place and the new name shows as soon as the person presses Enter or leaves the field. If the save fails for a server reason, the old name comes back and the message sits at the name. If the server refuses the value itself, such as "A tool with this name already exists.", that is a field error: the field opens again with what the person typed and the message follows FRM-002a. The typed name is never thrown away.
- Delete with *Undo*, as DST-001a describes, is the same pattern and needs no working sign. If the server then refuses the delete, the row comes back where it was with a notice in the row or the list, as FBK-002 says, and the message with *Undo* is removed or replaced, since there is nothing left to undo (FBK-005).
- Our own choice: a faint "Saving …" or a small mark on the changed item while the reply is out. It never blocks the item.

## Don't

- Leave *Send hire request* looking exactly as before for four seconds after the press, so the person cannot tell whether it was taken.
- Show "Sending request …" for a second and then put the old label back while the request is still running.
- Empty the form as soon as *Send hire request* is pressed, so a failed send leaves nothing to send again.
- Close *Add an accessory* on Escape while the accessory is still being saved, and let the save carry on with no sign of how it ended.
- Let *Cancel* stop the request while Escape closes the dialog and leaves it running.
- Label a button *Stop* when pressing it only hides the dialog and the delete goes through anyway.
- Show the working sign on every hire card because one *Mark as returned* was pressed.
- Let a spinner turn for minutes after the server has stopped answering.
- Add a hire request to *My hires* as confirmed the moment *Send hire request* is pressed, with no working sign. A request that leaves the product, like a payment or an invitation, is not a small change and shows the sign this rule asks for.
- Let the card *Concrete mixer, 1 day* jump back to *Booked* after a refusal with no word at all, as `useOptimistic` does when nothing renders the error.
- Leave a reordered accessory list in its new order after the server refused it.
- Put the old tool name back when the server says the new one is taken, so what the person typed is lost.

## Exceptions

- **A reply that comes at once.** No sign is needed. The result is the answer.
- **A change shown at once and corrected on failure.** A small change to something already on screen, such as ticking a box, flipping a switch, starring an item, moving a card to another column, changing the order of a list or renaming an item in place, may show its result on the press with no sending sign. It holds only when all four of these are true, for a tick box or a switch as well. Everything beyond tick boxes and switches, and the four conditions, is our own choice:
  1. The view can show the result without the server: nothing shown is made by the server, such as an order number, a price or a generated name; a count the view can work out, such as one more star, is fine.
  2. The product can put the earlier state back in full: the same value, the same place in the list, the same column.
  3. A wrong guess costs little: the action does not pay, send anything to other people, publish, or do anything else that cannot be called back. Payments, messages, invitations and sign-ups show the sending sign.
  4. The reply usually comes within the time STA-001 gives and usually agrees.

  When the reply refuses the change, put the earlier state back, say so as text where the change was made, as FBK-002 asks, and announce it, as FBK-004 asks. A refusal of the value itself, such as a name already taken, is a field error instead: keep what the person typed and follow FRM-002a. The view never keeps showing a change that did not happen. This exception allows such changes; it does not prefer them to the sending sign.
- **A form that loads a new page.** When the press sends the form the classic way, the browser loads the next page and that page is the result. The browser's own sign of loading is small and easy to miss, so a sign at the button is still the better choice when the reply can be slow. STA-005b applies to a second press either way.
- **Loading content.** A wait for content to appear, with nothing sent, belongs to STA-001.
- **Before the press.** Whether the button is enabled, and what it says when it is not, is ACT-004 and ACT-005. A second press during the wait is STA-005b.
