---
id: ACT-003b
title: Put a page's buttons in the part they act on and keep them in the same place
short: Buttons on pages
area: actions
status: decided
version: "1.0.2"
verdict: unanimous
judges: { spoken: 3, agreeing: 3 }
law:
  - criterion: "3.2.3"
    name: Consistent Navigation
    url: https://www.w3.org/TR/WCAG22/#consistent-navigation
    relation: supports
  - criterion: "3.2.4"
    name: Consistent Identification
    url: https://www.w3.org/TR/WCAG22/#consistent-identification
    relation: supports
stances:
  material: { stance: supports, sources: [material-buttons, material-app-bars, material-toolbars, material-fab, material-extended-fab] }
  apple:    { stance: supports, sources: [apple-toolbars, apple-buttons, apple-layout] }
  carbon:   { stance: supports, sources: [carbon-forms, carbon-button, carbon-data-table, carbon-ui-shell-header, carbon-global-header, carbon-common-actions] }
  govuk:    { stance: supports, sources: [govuk-button, govuk-question-pages, govuk-page-template] }
  nngroup:  { stance: supports, sources: [nngroup-ok-cancel] }
conflicts_checked: 2026-11-24
check: review
how_to_check:
  - 'A button that acts on one card, row, photo or form placed outside that part, such as "Delete photo" in the page header, or a single "Save" on a page with several separate forms. Dialogs, sheets and side panels are outside the rule.'
  - 'A button that acts on the whole page, such as "New booking", rendered inside the first card or row of a list instead of the page header, action bar or floating button.'
  - 'Compare pages of the same kind at the same window size: does each task, such as "Add stop", sit in the same area and position on every one? A move at a very different window size is fine.'
  - 'Product-wide controls, such as a language picker or "Contact support", rendered in one page''s own header instead of the top bar shown on every page.'
changelog:
  - version: "1.0.2"
    date: 2026-11-27
    note: Leaves the order in the code to LAY-002 instead of listing it as a Don't.
  - version: "1.0.1"
    date: 2026-11-24
    note: Names the part of the rule the top bar follows.
  - version: "1.0.0"
    date: 2026-11-22
    note: First version.
---

## Rule

On a page, put a button that acts on one part inside that part, and a button that acts on the whole page in the page's own header, action bar or floating button. Give the same task the same area and position on every page at a given window size.

## Why

People read a button through what surrounds it. A button inside a card is taken to act on that card, and one beside the page title is taken to act on the page. When a button sits somewhere else, people have to guess what it will change, and a wrong guess can save, send or remove the wrong thing. Keeping a task in one place also lets people stop searching: after a few pages, they reach for it without looking. The same holds for keyboard and screen reader users, as long as a button that looks inside a part is also inside it in the code, which LAY-002 asks for. [WCAG 2.2, 3.2.3 Consistent Navigation](https://www.w3.org/TR/WCAG22/#consistent-navigation) and [WCAG 2.2, 3.2.4 Consistent Identification](https://www.w3.org/TR/WCAG22/#consistent-identification) point the same way, but they cover repeated navigation and how components are named, not where ordinary buttons sit. This rule covers more than either and is our choice, not something WCAG requires.

## Do

- A recipe page shows a card for each recipe. *Save recipe* and *Print* sit inside each card, so it is plain which recipe they act on.
- A bike repair shop's booking page has *Book a repair* in the page header, next to the title *Repairs*, because it starts something for the whole page.
- A school timetable page has a table of lessons. *Add lesson* sits in the table's own toolbar, and *Swap lesson* sits in the row of the lesson it changes.
- When a teacher ticks several lessons, *Cancel lessons* appears with the selection and acts only on the ticked rows.
- An account page holds two small forms, *Delivery address* and *Newsletter*. Each has its own *Save address* or *Save preferences* at the end of its own fields.
- *Add stop* sits in the header beside the title on every route page of a delivery planner. On a phone it moves into a bar at the bottom of the screen, and it is in that same bar on every route page.
- At 320 pixels, a route page puts *Optimise route*, *Reverse order* and *Clear stops* in a menu button labelled *Route actions* in its header. All three are still there, as LAY-001 asks, and the menu holds them in the same order on every route page.
- A page bar that stays on screen while the page scrolls never completely covers the focused field or button, as KBD-002 asks.

## Don't

- Put *Delete photo* in the page header of a gallery, far from the photo it removes. Put it on the photo's card or in its row.
- Place a single *Save* at the top of a page with three separate forms, so no one knows which one it saves.
- Put *New booking*, which acts on the whole page, inside the first card of a list of bookings.
- Put *Order parts* in the header on one product page and at the bottom of the description on the next.
- Put the language picker or *Contact support* in one page's own header. They belong to the product's top bar, which is shown on every page.

## Exceptions

- **Dialogs, sheets and side panels.** This rule does not apply to them. ACT-003a covers the order of a dialog's action buttons.
- **A page that is one whole form.** This rule does not decide whether its sending button comes after the last field or sits in the page's header or bar.
- **Different window sizes.** A task may move to another area when the window gets much smaller or larger, as long as it is in the same place on every page at that size.
- **Sides.** This rule says nothing about left, right, leading or trailing on a page.
- **The product's top bar.** Controls for the whole product, such as the language picker and *Contact support*, sit in the bar that is shown on every page, not in one page's header. There they follow the last part of this rule: the same place on every page.
