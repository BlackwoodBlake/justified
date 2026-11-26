---
id: STA-005b
title: While an action is being sent, a second press does not send it again
short: No double send
area: states
status: proposed
version: "1.0.2"
verdict: insufficient-evidence
judges: { spoken: 1, agreeing: 1 }
law:
  - criterion: "4.1.2"
    name: Name, Role, Value
    url: https://www.w3.org/TR/WCAG22/#name-role-value
    relation: supports
stances:
  material: { stance: silent }
  apple:    { stance: silent }
  carbon:   { stance: supports, sources: [carbon-inline-loading, carbon-forms] }
  govuk:    { stance: supports, sources: [govuk-button] }
  nngroup:  { stance: silent }
conflicts_checked: 2026-11-26
check: runtime
how_to_check:
  - 'Slow the network, double-click the button, then press Enter twice in a field of the same form, and count the requests sent. More than one is a break. Leave alone searches, refreshes and filters (see Exceptions).'
  - 'A send handler with no guard for a request in flight: no check of `isSubmitting`, `isPending` or a ref set on the first press, and no `disabled` or `aria-disabled` while it runs.'
  - 'A guard only on the button''s `onClick`, while the form''s `onSubmit` can still send again when Enter is pressed in a field.'
changelog:
  - version: "1.0.2"
    date: 2026-11-26
    note: Points to FRM-015 for Enter in a field and to VIS-008a for the state in code.
  - version: "1.0.1"
    date: 2026-11-24
    note: The judge count says how many of the three judges spoke.
  - version: "1.0.0"
    date: 2026-11-24
    note: First version.
---

## Rule

While an action is being sent, another press on the same button does not send it again, whether it comes as a click, a tap, Enter or Space.

## Why

A button that sends something is often pressed more than once, and the product cannot tell from the presses whether the person meant it. Almost always they did not: the second press is part of the same decision as the first. If each press is sent, one decision becomes two orders, two payments or two messages to the same people, and the person finds out later, when it takes a phone call to put right. One press should mean one action. No WCAG criterion asks for this, and none says how a repeat press is stopped. If the button changes state while it refuses presses, that state must be available to assistive technology, which is what [WCAG 2.2, 4.1.2 Name, Role, Value](https://www.w3.org/TR/WCAG22/#name-role-value) asks of every control. The sign that the action is under way is STA-005a.

## Our reasons

Fewer than two judges have spoken about a second press, so the verdict is Insufficient evidence (1 of 3 judges spoke) and this guideline is our choice. Carbon supports it. So does GOV.UK, an expert witness who does not vote. Applying it to every send that costs something to undo, without first asking for proof that duplicates happen, is our choice too. The guideline does not say how the press is stopped. The way we describe under Do is our own. We stop the second send for four reasons.

- **A duplicate is costly to undo.** A second order has to be cancelled, a second payment refunded, and a message sent twice cannot be taken back at all. The person who pressed twice did not ask for any of it.
- **The sign alone does not stop a fast hand.** STA-005a asks for a sign that the action is under way, and that removes most of the doubt that makes people press again. The sign may take a moment to show. A double-click still lands before anyone has read anything.
- **It costs the person nothing.** Nobody means to send the same thing twice within a second or two. A press that is dropped while the first is still on its way takes nothing from them.
- **The person should not have to be careful.** The product can count presses, and it knows that the first one is still on its way. The person should not need to keep track of that.

## Do

- At a theatre's box office site the person presses *Pay £38.00* for two seats and, out of habit, presses again half a second later. One payment is sent, and the second press does nothing. While the payment is on its way the button reads "Paying …", the sign STA-005a asks for. The guard starts at the first press, also before that sign shows.
- The guard covers every way of pressing: a click, a tap, Enter and Space on the button.
- Our own advice: put the guard on the send, not only on the button's click. Enter in a field sends a form too (FRM-015). In *Ask about a booking*, the person presses Enter twice in *Your question*, and one question is sent.
- Our own choice of mechanism: keep the button able to take focus, mark it `aria-disabled="true"` and ignore the press. We prefer that to the `disabled` attribute. A button that gets `disabled` while it has focus drops out of the tab order, and focus can fall to the top of the page; in a dialog it can fall out of the dialog. A team that uses `disabled` anyway moves focus to a sensible place first and puts it back when the reply comes, which is why we prefer the first way.
- Whichever mechanism you use, expose the state in code, not only as a faded look, as VIS-008a says. This helps meet 4.1.2.
- The working label or sign from STA-005a is the explanation for the pause. Nothing is missing from the form, so the note that ACT-005 asks for at an unavailable button is not shown.
- The guard lasts from the press until the reply, and no longer. When the payment is refused or the request is given up, *Pay £38.00* works again at once, so the person can try again.
- After a success, a new press is a new action. In a club's members' pages, *Send message* stays on screen once a message has gone out, and the next press sends the next message.
- When the press loads a new page, the guard holds until that page arrives.
- Not part of the guideline: let the server refuse duplicates as well. A script in the page can fail to load, and a request can be sent again by the network. The guard in the page is for the person; it is not the only protection.
- In a dialog, the main button is guarded in the same way. What *Cancel*, Escape and the close icon do during the wait is in STA-005a.

## Don't

- Take two payments because *Pay £38.00* was double-clicked.
- Guard the click on the button but let Enter in a field send the form a second time.
- Let the button look as usual and silently swallow presses, with no working sign and no state in code.
- Write "Press the button only once" next to it and send every press.
- Keep the button unavailable after the send failed, so the person has to reload the page to try again.
- Switch the button off with `disabled` while it has focus and leave focus to land wherever the browser puts it.

## Exceptions

- **A repeat that does no harm.** A search, a refresh or a filter that is sent twice gives the same answer twice. It needs no guard, though it may have one.
- **Other buttons.** This guideline is about the pressed button and the action it sent. Other buttons in the view keep working unless they depend on the same data, as STA-005a says.
- **Before the press.** A button that is unavailable before anything is sent is ACT-004 and ACT-005. This guideline gives no reason to switch a submit button off before the press.
- **A product that chooses otherwise.** This is a guideline. A product that lets a repeat through still shows the wait, as STA-005a, a rule, asks.
