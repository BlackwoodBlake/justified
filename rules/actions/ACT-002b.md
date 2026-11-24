---
id: ACT-002b
title: Use at most one primary button on a page
short: One primary per page
area: actions
status: decided
version: "1.0.2"
verdict: majority
judges: { spoken: 3, agreeing: 2 }
law: []
stances:
  material: { stance: supports, sources: [material-buttons] }
  apple:    { stance: opposes, sources: [apple-buttons] }
  carbon:   { stance: supports, sources: [carbon-button, carbon-common-actions] }
  govuk:    { stance: supports, sources: [govuk-button, govuk-question-pages] }
  nngroup:  { stance: silent }
conflicts_checked: 2026-11-24
changelog:
  - version: "1.0.2"
    date: 2026-11-24
    note: Says how this rule relates to ACT-002a.
  - version: "1.0.1"
    date: 2026-11-21
    note: Examples in English.
  - version: "1.0.0"
    date: 2026-11-21
    note: First version.
---

## Rule

Give a page at most one button in the most emphasised style, `default` or `destructive`, for the main task of the page; a dialog, sheet or side panel counts as its own page while it is open, and the actions of other sections, cards and smaller tasks use less emphasised styles.

## Why

A page usually exists for one main task. When that task's button is the only filled one, people find the way forward without reading the whole page. Each extra filled button pulls the eye away from it, and with three or four the page no longer says what comes next. Quieter styles for the smaller tasks keep them available without competing. This rule is about how buttons look, not about focus or Enter. No WCAG criterion asks for one primary button per page, so this rule is our choice.

## Our reasons

Most of the judges back this rule, and one disagrees. We keep the limit at one, for three reasons.

- **The signal stays sharp.** Two filled buttons on a page already ask the person to compare them. One leaves no doubt about the main task.
- **A second task often means a second page.** When two actions both feel like the main one, the page is often doing two jobs. Splitting it, or moving one task into a dialog, usually helps more than a second filled button.
- **Dialogs and panels have their own.** A dialog, sheet or side panel gets its own primary button, so the limit does not stop a focused sub-task from having a clear way forward.

## Do

- A page *My profile* has *Save profile* in `variant="default"`. The section *Change password* below has *Change password* in `variant="outline"`, and a card *Export your data* has *Export* in `variant="ghost"`.
- A list page *Members* has *Invite member* in `variant="default"`. Each row's *Edit* uses `variant="ghost"`.
- Pressing *Invite member* opens a dialog. Its *Send invitation* is filled, because the dialog counts as its own page while it is open.
- A side panel *Filter* has *Show results* in `variant="default"` while the page behind it keeps its own primary button.
- A settings page where no task is the main one has no button in the most emphasised style. Each section uses `variant="outline"` or `variant="secondary"`.

## Don't

- Give every section of *Settings* its own filled *Save* button.
- Put a filled *Try it free* in a banner above a page whose main task is *Place order*, which is also filled.
- Give every card in a grid of offers a filled *Choose* button. Use a quieter style, or make the cards themselves the choice.
- Put a filled `variant="destructive"` *Delete list* beside the page's filled *Save list*. A destructive button counts toward the limit. Only a page made for the deletion, such as *Clear old logs*, may use it as its one emphasised button.

## Exceptions

- **Dialogs, sheets and side panels.** Each one counts as its own page while it is open.
- **The product's top bar.** A bar shown on every page, such as one with *Sign in*, counts on its own and does not take the page's one most emphasised button.
- **No main task.** A page may have no button in the most emphasised style. This rule sets a limit, never a minimum.
- **Within a group.** How the buttons shown together for one task or decision relate to each other is covered by ACT-002a. A page that follows this rule also follows ACT-002a, except in the product's top bar. They are two rules because their verdicts differ.
