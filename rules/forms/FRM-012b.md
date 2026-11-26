---
id: FRM-012b
title: Let a control that holds a choice only record it, and put actions on buttons and links, even with a notice
short: Choices are not actions
area: forms
status: proposed
version: "1.0.1"
verdict: majority
judges: { spoken: 3, agreeing: 2 }
law:
  - criterion: "3.2.2"
    name: On Input
    url: https://www.w3.org/TR/WCAG22/#on-input
    relation: supports
  - criterion: "2.1.1"
    name: Keyboard
    url: https://www.w3.org/TR/WCAG22/#keyboard
    relation: supports
stances:
  material: { stance: supports, sources: [material-switch, material-chips, material-radio-button, material-checkbox, material-segmented-buttons] }
  apple:    { stance: supports, sources: [apple-pop-up-buttons, apple-pull-down-buttons, apple-segmented-controls, apple-toggles] }
  carbon:   { stance: opposes, sources: [carbon-select, carbon-dropdown] }
  govuk:    { stance: silent }
  nngroup:  { stance: supports, sources: [nngroup-checkboxes-vs-radio-buttons, nngroup-drop-down-menus, nngroup-toggle-switch-guidelines] }
conflicts_checked: 2026-11-26
check: lint
how_to_check:
  - 'A `Select`, `RadioGroup`, `Checkbox`, `Switch`, `ToggleGroup` or `DropdownMenuRadioItem` whose `onValueChange` or `onCheckedChange` calls `router.push`, `navigate()`, `window.location` or `window.open` to go to another page or step, even with a notice. Leave alone a change of search params that filters or sorts the same view.'
  - 'A value change on such a control that calls `form.handleSubmit()`, `requestSubmit()` or runs a command such as export. A switch that applies and saves its own setting in place is fine.'
  - 'A `ToggleGroup` or filter chip group with an item that runs a command or opens another page, such as "Export tasks" or "Add a task".'
changelog:
  - version: "1.0.1"
    date: 2026-11-26
    note: Refers to ACT-009a and ACT-009b for whether to build a link or a button.
  - version: "1.0.0"
    date: 2026-11-25
    note: First version.
---

## Rule

A control that holds a choice, such as a select, radio group, checkbox, switch or filter chip, only records it and may update the view in place. Going to another page or step, sending a form or running a command takes a button, a link or a menu of actions, even with a notice.

## Why

A choice and an action are different promises. A select, a radio button or a checkbox says "choose, and nothing happens yet"; a button or a link says "press me and something happens". When a choice also sends, navigates or runs a command, people cannot look through the options without setting it off, and a keyboard user moving through a radio group with the arrow keys sets it off on the first press. [WCAG 2.2, 3.2.2 On Input](https://www.w3.org/TR/WCAG22/#on-input) allows such a control when a notice before it says what will happen; that floor is FRM-012a. This rule goes further, and the judges decide it, not WCAG: two of the three support it and Carbon opposes. That it holds even with a notice is our own reading.

A notice is easy to miss, and for a radio group it does not help the keyboard at all, which is why the Working Group notes that such a group probably still fails [2.1.1 Keyboard](https://www.w3.org/TR/WCAG22/#keyboard) ([F37](https://www.w3.org/WAI/WCAG22/Techniques/failures/F37)). The Working Group's own preferred ways to pass 3.2.2 point the same way: a submit button ([G80](https://www.w3.org/WAI/WCAG22/Techniques/general/G80)) or a button next to the select ([H84](https://www.w3.org/WAI/WCAG22/Techniques/html/H84)). Our own reading adds one point: a screen reader announces a link or a button as something that acts, and a select as something that holds a value, so a control that matches its job is heard for what it does.

## Do

- In a project tool, people move between workspaces with a `DropdownMenu` whose trigger shows the current one, *Workspace: Harbour team*. Each item is a link (`DropdownMenuItem asChild` with a `Link`), so choosing one is activation, and Enter or a click goes there.
- Offer the product's languages as a short list of links in the product's top bar, where ACT-003b puts it, each written in its own language and leading to that version of the page.
- The select *Rows per page* over the task table changes the table in place, and "Showing 50 tasks" is announced as FBK-004 asks. If a new page has to load from the server, put a *Show rows* button next to the select, or use a menu of links instead of the select.
- A plan picker is a `RadioGroup` with *Starter*, *Team* and *Business*. Choosing one only records it. The button *Continue to payment* after the group sends the choice, as ACT-004 and ACT-005 describe for the submit button.
- The checkbox *I accept the terms* only records the answer. *Create account* sends the form.
- In a settings form that is saved with *Save settings*, use checkboxes such as *Email me a weekly summary*. A switch tells people its setting applies at once; where a press on *Save settings* is still needed, it misleads. Or drop the button and let each switch apply and confirm in place.
- When turning something on needs more steps, such as choosing a card for automatic payments, use a button whose label starts with a verb, as ACT-001a asks: *Set up automatic payments* opens the dialog. Do not hide that dialog behind a switch.
- A `ToggleGroup` with `type="single"` switches the task view between *List* and *Board* in place. *Export tasks* is a separate button beside it, not a segment of the group.
- Filter chips such as *Assigned to me* and *Overdue* narrow the task list in place. A chip that runs something, such as *Add a task*, is a button and sits apart from the filter group.
- A `DropdownMenuRadioItem` for *Sort by* or a `DropdownMenuCheckboxItem` for *Show done tasks* records a value and may update the view in place. It does not also navigate.
- A `Command` palette whose items open a task or run a command is a menu of places and commands, and each item acts on Enter or a click. A combobox whose picked suggestion only fills the field is a choice. Results that update in place while the person types are allowed.

## Don't

- Build *Switch workspace* as a `Select` with `onValueChange={(v) => router.push(v)}`, even with a line above it saying that choosing one opens it.
- In an onboarding flow, move on to the next step as soon as *2 to 10 people* is chosen in the radio group *Team size*. Moving to another step is a button's job: put *Next* after the group.
- Use a `RadioGroup` whose `onValueChange` opens checkout. Radix checks a radio when an arrow key reaches it, so every arrow press would fire it.
- Give a `Checkbox` an `onCheckedChange` that calls `form.handleSubmit()`.
- Put a `Switch` in a form that only takes effect after *Save settings* is pressed.
- Mix segments that show a selection with a segment that runs a command in one `ToggleGroup`.
- Let a filter chip open another page.

## Exceptions

- **Updates in place.** Revealing fields, filtering or sorting a list in place, switching a view in place and applying a setting at once are what a choice may do. They are not actions in the sense of this rule.
- **Menus of commands and places.** A `DropdownMenu` whose items are commands or links is a menu of actions, not a control that holds a choice. This rule is about the role a control plays, not about a component's name.
- **Text fields.** Sending a field when it is full, such as a one-time code, is covered by FRM-012a. Asking for a button there instead of a notice is FRM-012a's own advice, not part of this rule.
- **Neighbouring rules.** The law's floor, where a notice before the control is enough, is FRM-012a. Which of a button and a link to build is the guidelines' own choice: a link for going somewhere (ACT-009a), a button for acting in place (ACT-009b). The button's label is ACT-001a, its place ACT-003b, and whether a submit button may be unavailable ACT-004 and ACT-005. Announcing updates in place is FBK-004.
