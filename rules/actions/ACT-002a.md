---
id: ACT-002a
title: Give at most one button in a group the most emphasised style
short: One emphasised per group
area: actions
status: decided
version: "1.0.2"
verdict: unanimous
judges: { spoken: 3, agreeing: 3 }
law: []
stances:
  material: { stance: supports, sources: [material-buttons, material-dialogs] }
  apple:    { stance: supports, sources: [apple-buttons, apple-alerts, apple-sheets] }
  carbon:   { stance: supports, sources: [carbon-button, carbon-dialog-pattern, carbon-modal, carbon-forms, carbon-common-actions] }
  govuk:    { stance: supports, sources: [govuk-button] }
  nngroup:  { stance: supports, sources: [nngroup-ok-cancel] }
conflicts_checked: 2026-11-24
changelog:
  - version: "1.0.2"
    date: 2026-11-24
    note: Says how this rule relates to ACT-002b.
  - version: "1.0.1"
    date: 2026-11-21
    note: Examples in English.
  - version: "1.0.0"
    date: 2026-11-21
    note: First version.
---

## Rule

Among the buttons shown together for one task or decision, such as the action row of a form, dialog, sheet or card, give at most one the most emphasised style, for the action most people want there, and give every other button a less emphasised style; a group may have no emphasised button at all.

## Why

A filled button tells the eye where to go first. When two buttons in the same row are both filled, that signal cancels out, and the person has to read every label and weigh them before they can act. One strong button and quieter ones around it make the likely next step plain at a glance, while the other choices stay easy to find. This rule is about how buttons look. It does not decide which button has focus or what Enter does; for destructive confirmations DLG-004 decides that. No WCAG criterion asks for one emphasised button, so this rule is our choice.

## Do

- A form *Book an appointment* ends with *Book appointment* in `variant="default"` and *Cancel* in `variant="outline"`.
- A dialog *Rename folder* has *Save name* in `variant="default"` and *Cancel* in `variant="ghost"`.
- A card *Monthly report, October* has *Open report* in `variant="secondary"` and *Download PDF* in `variant="ghost"`. Neither uses the most emphasised style.
- A confirmation "Delete the project Autumn 2026?" has *Delete project* in `variant="destructive"` and *Cancel* in `variant="outline"`. The red button is that dialog's one emphasised button, as DLG-005 says.
- A form *Edit contact* has *Save contact* in `variant="default"`. *Delete contact* sits in the same row in `variant="outline"`, with a label that names what it removes. Pressing it removes the contact at once and offers *Undo*, with no question, as DST-001a says.
- A sheet asks "Which copy do you want to keep?" with *Keep the new one* and *Keep the old one*. Neither is clearly the main choice, so both use `variant="outline"`.

## Don't

- Put *Save contact* in `variant="default"` and *Delete contact* in `variant="destructive"` side by side. Justified's `Button` has no quieter danger variant, so pick a less emphasised style for the delete action or move it out of the group.
- Fill *Cancel* as well as *Delete project* in a confirmation, or fill *Cancel* instead, to steer people away from deleting.
- Force a filled button onto a group where no action is clearly the main one.
- End the form *Book an appointment* with both *Book appointment* and *Book and pay now* in `variant="default"`.

## Exceptions

- **No clear main action.** A group may have no emphasised button. This rule sets a limit, never a minimum.
- **Focus and Enter.** Which button takes focus first and what Enter does are outside this rule. DLG-004 covers destructive confirmations.
- **The whole page.** How many primary buttons a page may hold is covered by ACT-002b. That rule is the stricter one: a page that follows it also follows this rule, except in the product's top bar. They are two rules because their verdicts differ.
