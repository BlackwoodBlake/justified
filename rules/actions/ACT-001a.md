---
id: ACT-001a
title: Start an action button with a verb that names the action
short: Verb first
area: actions
status: decided
version: "1.0.3"
verdict: unanimous
judges: { spoken: 3, agreeing: 3 }
law:
  - criterion: "2.4.6"
    name: Headings and Labels
    url: https://www.w3.org/TR/WCAG22/#headings-and-labels
    relation: supports
stances:
  material: { stance: supports, sources: [material-buttons, material-dialogs] }
  apple:    { stance: supports, sources: [apple-alerts, apple-buttons, apple-writing] }
  carbon:   { stance: supports, sources: [carbon-button, carbon-modal, carbon-common-actions] }
  govuk:    { stance: supports, sources: [govuk-button, govuk-question-pages] }
  nngroup:  { stance: supports, sources: [nngroup-ui-copy, nngroup-ok-cancel, nngroup-confirmation-dialog] }
conflicts_checked: 2026-11-26
check: review
how_to_check:
  - 'A `Button` or `AlertDialogAction` whose visible text is only "OK", "Yes", "No" or "Submit". Leave alone the lone button of a message that only informs, and the button that confirms a date or time picker (see Exceptions).'
  - 'A button labelled with a noun alone, such as "Report" or "Settings", or a vague verb such as "Manage" or "Confirm", on an action that does something. Leave alone a `Button asChild` around a link (see Exceptions).'
  - 'A button that saves, sends, creates or removes something labelled "Continue", "Done", "Close" or "Next". Those words are fine only where nothing new is committed or the work is already kept (see Exceptions).'
  - 'Read each action button with its dialog title, heading, row or card: does the label start with a verb, and does the label or that context say what it acts on? On repeated row buttons the object may sit in the accessible name.'
changelog:
  - version: "1.0.3"
    date: 2026-11-26
    note: A link styled as a button names where it goes and points to TXT-003 and ACT-009a.
  - version: "1.0.2"
    date: 2026-11-24
    note: Shorter rule sentence; the detail moved to Do. No change in what the rule asks.
  - version: "1.0.1"
    date: 2026-11-21
    note: Examples in English.
  - version: "1.0.0"
    date: 2026-11-21
    note: First version.
---

## Rule

Start the label of every button that performs, confirms or commits an action with a verb naming that action. Add the object unless the verb and its context say what it acts on; where the verb repeats or space is tight, it may go in the accessible name instead (ACT-001b). Never use OK, Yes, No, Submit or a noun alone.

## Why

A button is a promise about what happens next. When its text names the action, the person can decide from the button alone, without reading the question again and working out what "Yes" would mean. People who move fast, people who read a second language and people who jump between buttons with a screen reader all depend on that. A verb up front says it is something you do. The object says what it is done to, which matters when the same screen holds several actions. Clear labels help meet [WCAG 2.2, 2.4.6 Headings and Labels](https://www.w3.org/TR/WCAG22/#headings-and-labels). That criterion asks that labels describe their purpose. It does not ask for a verb or rule out any word, so the verb-first form is our own choice. What the button's accessible name must contain is covered by ACT-001b.

## Do

- A dialog titled "Book a dentist appointment?" has *Cancel* and *Book appointment*.
- A report page has *Export report* next to *Print summary*. Each says what it does and to what.
- The context is what the verb is read with: the dialog title, a nearby heading, or the row, card or toolbar the button sits in. When that does not say what the verb acts on, add the object.
- A dialog titled "Invite people to the Spring Fair project" has a field for an email address and the button *Invite*. The title gives the object, so the verb is enough.
- A settings page has *Publish changes* at the bottom, not *Submit*.
- Where the same short verb repeats on a page, such as *Archive* on each row of a list, keep the visible word and add the row's name to the accessible name, as ACT-001b describes: "Archive Invoice 1042".
- A toggle on a project page names what pressing it will do now: *Follow project* while the person does not follow it, *Unfollow project* while they do.
- Keep the verb on a destructive button that DLG-003 and DLG-005 already ask for, and keep the same verb in the dialog's title.

## Don't

- Ask "Do you want to book this time?" with *Yes* and *No*.
- Close a form for a new invoice with *Submit* or *OK* when *Create invoice* would say what happens.
- Put a noun alone on an action, such as *Report* for a button that exports the report, or *Settings* for one that applies new settings.
- Use a vague verb such as *Manage* where *Connect bank account* says what will happen.
- Label the confirming button of a dialog *Confirm*, or put *Continue* on a button that commits something, such as placing an order. Name the action, as DLG-003 does: *Place order*.

## Exceptions

- **Cancel.** *Cancel* stays the word for backing out, as FRM-003 and DLG-003 require.
- **Fixed single verbs.** *Close*, *Done*, *Next*, *Continue*, *Back* and *Undo* need no object when the context gives it, such as *Next* on a step of a form (see ACT-004) or *Undo* in the message after an action (see DST-001a). Prefer a more specific label where it fits. These words never replace the verb on a button that saves, sends, creates or removes something. *Done* and *Close* only end a flow whose work is already kept, or close a view where nothing new is committed. *Close* is never the way out when input is thrown away; that is *Cancel*, as FRM-003 says.
- **A message that asks nothing.** The lone button of a message that only informs may read *OK* or, better, *Done*. A failure the person can act on is not such a message; FBK-002 covers it.
- **Date and time pickers.** The button that confirms the chosen date or time in a picker may read *OK*.
- **Links that look like buttons.** A link styled as a button, such as `Button asChild` around a `Link`, names where it goes, as TXT-003 asks, and needs no verb (ACT-009a).
