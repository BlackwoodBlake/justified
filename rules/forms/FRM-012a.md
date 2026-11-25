---
id: FRM-012a
title: Changing a value does not send a form, open a page or move focus unless people were told first
short: No context change on input
area: forms
status: proposed
version: "1.0.0"
verdict: requirement
judges: { spoken: 0, agreeing: 0 }
law:
  - criterion: "3.2.2"
    name: On Input
    url: https://www.w3.org/TR/WCAG22/#on-input
    relation: requires
  - criterion: "2.1.1"
    name: Keyboard
    url: https://www.w3.org/TR/WCAG22/#keyboard
    relation: supports
stances:
  material: { stance: silent }
  apple:    { stance: silent }
  carbon:   { stance: silent }
  govuk:    { stance: supports, sources: [govuk-date-input] }
  nngroup:  { stance: supports, sources: [nngroup-checkboxes-vs-radio-buttons] }
conflicts_checked: 2026-11-25
check: review
how_to_check:
  - 'An `onValueChange`, `onCheckedChange` or `onChange` on a `Select`, `RadioGroup`, `Checkbox`, `Switch` or input that calls `router.push` to another page, `navigate()`, `window.location`, `window.open` or opens a `Dialog`. Leave it if text before the control says so, or if only search params change for the same view.'
  - 'A value change or `onBlur` that calls `form.handleSubmit()`, `requestSubmit()` or a server action that sends the form, with no notice before the control. Saving a setting in the background is fine (see Exceptions).'
  - '`InputOTP` with an `onComplete` that sends the code, or a date part that calls `.focus()` on the next part, with no text before the field saying so.'
  - 'A notice given only in a `Tooltip`, a `placeholder` or text after the control. It must come before the control in reading order.'
  - 'Change a filter, sort or radio with the keyboard and see whether focus stays on the control rather than moving to the first result or elsewhere.'
changelog:
  - version: "1.0.0"
    date: 2026-11-25
    note: First version.
---

## Rule

Changing a control's value, such as choosing an option, ticking a box or typing, does not send a form, open a page, a window or a dialog that takes focus, or move focus, unless text before the control tells people it will. Changes in place, such as a list that filters, are allowed while focus stays put.

## Why

People change a value to say what they want, not to go anywhere. A keyboard user who arrows through a select to read the options, or a screen reader user who ticks a box and expects to hear it checked, is lost when the page sends, reloads or jumps elsewhere. They did not ask for it and may not notice it happened. [WCAG 2.2, 3.2.2 On Input](https://www.w3.org/TR/WCAG22/#on-input) requires that changing the setting of a control does not change the context unless people were told before they use it. A change of context, in WCAG's definition, includes a new page or something that looks like one, a new window, focus sent elsewhere and a large rearrangement of the page. A section that expands, extra fields that appear or a list that updates, with focus left where it is, is a change of content and outside the criterion. The Working Group lists as failures a form that sends itself when a field is filled or left ([F36](https://www.w3.org/WAI/WCAG22/Techniques/failures/F36)) and a window that opens when a radio button, checkbox or select changes, with no warning ([F37](https://www.w3.org/WAI/WCAG22/Techniques/failures/F37)).

It accepts a description placed before the control ([G13](https://www.w3.org/WAI/WCAG22/Techniques/general/G13)). Two of its other ways to pass hand the change to a button ([G80](https://www.w3.org/WAI/WCAG22/Techniques/general/G80), [H84](https://www.w3.org/WAI/WCAG22/Techniques/html/H84)), and another lets a select update something later on the same page without any change of context ([SCR19](https://www.w3.org/WAI/WCAG22/Techniques/client-side-script/SCR19)). The same note in F37 says a radio group that acts on change probably still fails [2.1.1 Keyboard](https://www.w3.org/TR/WCAG22/#keyboard) with a warning, because the arrow keys cannot move through it without changing the value. That is why 2.1.1 is listed as support.

This rule holds the law's floor, where a notice is enough. FRM-012b is the judges' stricter rule, which asks for a button or a link even with a notice.

## Do

- In a tool library app, the page *Find a tool* has filter checkboxes under *Category*. Ticking *Garden* filters the list below in place. Focus stays on the checkbox, the page does not scroll, and the line "18 tools match" is announced as FBK-004 asks. The wait for the new list shows in the list itself, as STA-001 asks.
- The select *Sort by* reorders the same list in place when *Nearest first* is chosen, with focus left on the select. That is a change of content, and the rule allows it.
- Choosing *Delivery* under *How do you want to get the tool?* reveals the field *Delivery address* below the radio group, and focus stays on the radio. Choosing *Branch* in a select fills the next select, *Pickup time*, with that branch's slots. The changed part comes after the control that changed it.
- The switch *Return reminders* turns reminders on as soon as it is flipped and the page says "Reminders on" from a polite live region. A setting that applies where it is changes no context.
- The *Confirmation code* field is shadcn's `InputOTP` with an `onComplete` that sends the code. Text above the field, tied to it with `aria-describedby`, says "We check the code as soon as all six digits are in." That notice is what the law asks. Our own advice is to go further and send with Enter or a *Verify code* button, as FRM-012b does for choices.
- Our own advice: do not move focus by itself from *Day* to *Month* to *Year* in *Return date*. People Tab between the parts, as in any other field. The law would accept a notice before the fields; we do not use it.
- A notice counts only when people get it before they use the control: earlier in reading order, or in an earlier step of the same task. A tooltip, a placeholder or text after the control is not enough. Our own advice: tie it to the control with `aria-describedby` so a screen reader reads it on arrival.
- A change of context the person asks for with a button or a link, such as *Apply filters* or *Go to checkout*, is activation and outside this rule.

## Don't

- Give a `Select` or `RadioGroup` an `onValueChange` that calls `router.push`, `navigate()`, `window.location` or `window.open` with no notice before it, such as a *Branch* select that loads that branch's own page.
- Call `form.handleSubmit()`, `form.requestSubmit()` or a server action from a `Select` or `Checkbox` change, such as a *Show returned loans* checkbox that sends the form and reloads the page. The Working Group lists sending on a change as a failure.
- Build a *Plan* radio group whose `onValueChange` opens checkout. Radix `RadioGroup` checks an item as soon as an arrow key moves to it, so `onValueChange` fires on every arrow press and a keyboard user is taken away on the first one. A notice does not fix that; see FRM-012b.
- Assume a select only commits on Enter. A native `select` can change value with arrow keys while closed on some platforms, and typing a letter on a closed Radix `Select` trigger chooses the matching option. Arrow keys, Enter and Space on that closed trigger only open it, so typing is the case that commits there. Check your build before tying anything to the change.
- Send the code from `InputOTP`'s `onComplete`, or move focus from *Day* to *Month* when two digits are in, with no text before the field that says so.
- Give the switch *Automatic payments* an `onCheckedChange` that opens a `Dialog`, which takes focus, with nothing before the switch that warns of it. Use a button such as *Set up automatic payments*, as FRM-012b asks.
- Save and go to the next page from `onBlur` when the person leaves the last field. Leaving a field may check it and show an error in place, as FRM-002b says, but not send.
- Let a filter move focus to the first result when it updates the list. Moving focus is a change of context.
- Our own reading, beyond what the criterion clearly covers: do not let a filter scroll the page back to the top either. People still at the filters lose their place and may tick the wrong one.

## Exceptions

- **Activation.** Pressing a button or a link is not a change of value. A submit button that sends the form, a button that opens a dialog, or a link to another page is outside this rule. Where focus goes after a failed send is FRM-011.
- **Saving a setting.** Saving a setting in the background, with the page left as it is, is not sending a form. The *Return reminders* switch under Do may save at once.
- **Changes of content.** Fields that appear, a list that filters or sorts, a setting that applies at once, tabs and accordions, all with focus kept, are allowed. Announcing them is FBK-004; where the wait shows is STA-001.
- **A view that swaps entirely.** A select that turns the whole main area from a list into a board may count as a large rearrangement. Our own advice: use tabs or a toggle group that updates in place and keeps focus.
- **Focus alone.** What may happen when a control merely receives focus is FRM-013, which allows no notice.
- **Neighbouring rules.** Where a language picker sits is ACT-003b. Whether a value control may act at all, even with a notice, is FRM-012b.
