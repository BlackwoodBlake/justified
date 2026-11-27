---
id: ACT-003a
title: Put the confirming button last when a dialog's action buttons sit side by side
short: Confirm button last
area: actions
status: decided
version: "1.0.2"
verdict: unanimous
judges: { spoken: 3, agreeing: 3 }
law: []
stances:
  material: { stance: supports, sources: [material-dialogs, material-buttons] }
  apple:    { stance: supports, sources: [apple-alerts, apple-sheets, apple-buttons] }
  carbon:   { stance: supports, sources: [carbon-modal, carbon-dialog-pattern, carbon-button] }
  govuk:    { stance: silent }
  nngroup:  { stance: opposes, sources: [nngroup-ok-cancel] }
conflicts_checked: 2026-11-24
check: lint
how_to_check:
  - 'An `AlertDialogAction` written before `AlertDialogCancel` inside `AlertDialogFooter`, or inside `DialogFooter` a confirming `Button` written before the "Cancel" button or the `DialogClose` that wraps it.'
  - 'A `Button` written after the confirming button in a dialog footer, such as "Remind me later", so the confirming one is no longer last.'
  - 'A dialog footer, or a row inside it, with `flex-row-reverse`, `sm:flex-row-reverse` or `order-*` classes that show the confirming button before Cancel, or `justify-start` on a side-by-side row that leaves it away from the trailing end. Leave alone stacked buttons and buttons that fill the row (see Exceptions).'
  - 'In a multi-step dialog, step buttons such as "Back" and "Next" that are split apart, or with the forward one not last. Leave alone a way out that stands alone at the leading edge (see Exceptions).'
changelog:
  - version: "1.0.2"
    date: 2026-11-27
    note: The title names the condition the rule applies under. No change in what it asks.
  - version: "1.0.1"
    date: 2026-11-24
    note: The single-button example uses Done, as ACT-001a allows.
  - version: "1.0.0"
    date: 2026-11-22
    note: First version.
---

## Rule

When a dialog's action buttons sit side by side, put the confirming or primary button last, at the trailing end of the row (the right in left-to-right languages, the left in right-to-left), with Cancel or the other dismissive action before it and no action button after it.

## Why

People learn where the answer to a dialog lives. After a few dialogs, the hand and the eye go to the trailing end of the row for "yes, do it" and look just before it for the way out. If one dialog swaps the two, someone who reads fast presses the wrong button, and in a confirmation that can be the costly one. A fixed order also gives Cancel a fixed place, which FRM-003 asks for. No WCAG criterion asks for any button order, so this rule rests on a convention that the judges share, not on the law. We follow the order all three judges use.

## Do

- A dialog titled "Renew your library loan for two more weeks?" shows *Cancel* and then *Renew loan* at the trailing end.
- A dialog for ordering photo prints has *Cancel* and *Order prints*, packed together at the right edge of the footer.
- The same dialog on a narrow screen lets the two buttons fill the width of the footer, *Cancel* on the left half and *Order prints* on the right half. The order is the same, so both layouts are fine.
- A dialog with a single button, such as *Done* after a short notice, places it at the trailing end.
- In an Arabic or Hebrew interface the whole row mirrors: *Cancel* on the right, the confirming button on the left. Use logical alignment, such as `justify-content: flex-end` in a row that follows the page direction, so the mirroring happens without extra code.
- Write *Cancel* before the confirming button in the code too, so the order screen readers and the keyboard follow matches the order on screen, as LAY-002 asks. Focus in a destructive confirmation still starts on *Cancel*, as DLG-004 says; being last does not make the confirming button the default.
- If one button is emphasised, it is the trailing one, as ACT-002a allows. In a destructive confirmation the destructive button takes that trailing place, styled as DLG-005 describes.
- If you use shadcn's `DialogFooter` or `AlertDialogFooter`, write *Cancel* before the confirming button, and check in your own build that the buttons are not shown in reverse when they stack on a narrow screen, since that would break LAY-002 and DLG-004.

## Don't

- Put *Join waitlist* first and *Cancel* after it.
- Add a third button such as *Remind me later* after the confirming button, so the action people came for is no longer at the end.
- Reverse the buttons with the CSS `order` property or `row-reverse` so the screen shows one order and the code another. That breaks LAY-002.
- Apply this rule to a full-page form. A page form is a different layout, and this rule does not decide where its main button goes.

## Exceptions

- **Stacked buttons.** When the buttons no longer fit in a row and stack, this rule does not apply. Keep the order of the code on screen, as LAY-002 and DLG-004 say, so *Cancel* stays first.
- **A help control on the Mac.** In a dialog styled for the Mac, a help button that explains the dialog may sit apart in the leading corner of the footer, on the same line as the action buttons.
- **Multi-step dialogs.** In a dialog that walks through several steps, the way out may stand alone at the leading edge, while the buttons that move between steps stay together at the trailing end with the forward one last. A three-step dialog for booking a bike service could have *Cancel* on its own at the leading edge, and *Change bike* (back to the first step) and *Choose a time* at the trailing end.
- **A top bar instead of a footer.** A sheet or full-screen dialog that puts *Cancel* at the start of its top bar and the confirming action at the end keeps the confirming action trailing, so it fits the rule.
- **Not an exception: a link that leaves the dialog.** A link to another page is not a reason to break the row or to place it at the leading edge.
