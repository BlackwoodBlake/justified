---
id: STA-002a
title: Say what will appear in a space that holds nothing yet, and offer the first step
short: Nothing here yet
area: states
status: proposed
version: "1.0.0"
verdict: unanimous
judges: { spoken: 2, agreeing: 2 }
law:
  - criterion: "2.4.3"
    name: Focus Order
    url: https://www.w3.org/TR/WCAG22/#focus-order
    relation: supports
stances:
  material: { stance: silent }
  apple:    { stance: supports, sources: [apple-writing] }
  carbon:   { stance: supports, sources: [carbon-empty-states-pattern] }
  govuk:    { stance: silent }
  nngroup:  { stance: supports, sources: [nngroup-empty-state-interface-design] }
conflicts_checked: 2026-11-25
check: review
how_to_check:
  - 'The shadcn data table''s default empty row, a `TableCell colSpan={columns.length}` reading "No results.", on a list that is empty because nothing has been added yet.'
  - '`items.map(...)` with no branch for an empty array, so once loading has finished the heading sits over blank space.'
  - 'An empty message such as "No data" or "Nothing here". Read it and ask: does it say what will appear in this space?'
  - 'An empty space where the person can add the first item but no button or link offers it. Leave it alone when the person cannot add items, items arrive on their own, or the line points to the same action already in the page header.'
  - 'An empty message shown in a toast or a page-wide banner instead of inside the list, table, card or panel it is about.'
changelog:
  - version: "1.0.0"
    date: 2026-11-25
    note: First version.
---

## Rule

When a list, table, panel or page has finished loading and holds nothing yet, show a short message in that space that says what will appear there. When the person can add the first item, offer that action as one button or link with the message.

## Why

A space with nothing in it tells the person nothing. They cannot tell whether it is still working, has broken or was set up wrong, and they have to guess how to fill it. A line that names what belongs there, with the step that puts it there, turns a dead end into a start. No WCAG criterion asks for an empty state. The rule rests on the judges. [WCAG 2.2, 2.4.3 Focus Order](https://www.w3.org/TR/WCAG22/#focus-order) bears only on where focus goes when the last item is removed, as described under Do. This rule covers the case where loading is over and there is truly nothing: a first visit, or a list the person has emptied. While the content is still on its way, STA-002b applies. When a search or a filter found nothing, the guideline STA-003 applies.

## Do

- A bike repair workshop opens its new app for the first time. The page *Repair jobs* holds no jobs. Where the list would be, a heading reads "No repair jobs yet", the line below says "Jobs you add will show here, with the bike, the customer and the due date.", and one button reads *Add repair job*. It is the page's main task, so it may have the `default` style, as ACT-002b allows. If the page header already has an *Add repair job* button in `default` style, the empty state does not add a second one: give its button `variant="outline"`, or point to the header button in the line.
- Name the action with a verb and the item, as ACT-001a asks. Our own choice: a second route may follow as a quiet text link below the main button, never as a second button, with text that says where it goes, such as "Import jobs from a spreadsheet", as TXT-003 asks.
- Put the message where the items would be: inside the card, the panel or the table's area. Not in a toast, and not in a page-wide banner far from the space.
- A start page has three cards, *Parts on order*, *Open quotes* and *Bikes ready for collection*, and all are empty. *Parts on order* and *Open quotes* each give one button with `variant="outline"`, *Order parts* and *Write a quote*, so the page does not end up with three primary buttons (ACT-002a, ACT-002b).
- *Bikes ready for collection* fills on its own, when a mechanic marks a job done. It has no button. Its line says "Bikes show here when a mechanic marks the repair as done."
- A person whose role cannot create jobs sees "Repair jobs added by the workshop manager will show here." and no button. Say how the items arrive, if the product knows.
- Our own choice for a table: replace the whole table, header row included, with the message. A screen reader user then does not pass a row of column headers before learning that there are no rows. The table's title stays as the heading above the message, so the space keeps its name (TBL-004). If that title is a `TableCaption` inside the table, move it out as a heading when the table is replaced, or the name goes with the table.
- If the header row has to stay, for instance because column settings live there, put the message as text outside the table body, under the table, not as a fake data row.
- A list with groups, where one group is empty, shows a short line in that group, such as "No jobs this week", not a full empty state.
- An icon or image in the empty state only decorates: `alt=""` on an `img`, or `aria-hidden="true"` on an inline SVG, as STR-005 says. Our own choice: use it sparingly, or not at all.
- The person deletes the last job in *Today's jobs*. The empty state appears in that place. Our own choice, resting on 2.4.3: focus moves to its heading (with `tabindex="-1"`) or to its button, so it is never lost and stays visible (KBD-001). When the delete ran through a confirmation dialog, the row's delete button that opened it is gone when it closes, so the fallback DLG-006 asks for, set in `onCloseAutoFocus`, points at the empty state. If *Undo* brings the job back, as DST-001a offers, the list returns and the empty state goes.
- An empty state that is there when the page loads is page content, not a status message. One that appears in place after the person's action, while focus stays put, is announced as FBK-004 says. The empty state component is usually mounted together with its text, so write the line into a polite live region that was already in the page. For example, *Delete selected* in a toolbar removes the last rows while focus stays on the toolbar, and the region says "No repair jobs left".

## Don't

- Keep the shadcn data table's last row as it comes, one `TableCell colSpan={columns.length}` reading "No results.", on a list that is empty because nothing has been added. Nobody searched, so "No results." is wrong, and it offers no way forward.
- Map over an empty array and render nothing, so *Repair jobs* is a heading over white space.
- Write "No data" or "Nothing here" with no noun and no next step.
- Fill the space with a large illustration and a joke, and no button.
- Offer *Add repair job*, *Import jobs*, *Invite a mechanic* and *Watch the tour* as four buttons of equal weight.
- Put something the person must keep, such as a setup code or a deadline, only in the empty state. It disappears once the first item exists.

## Exceptions

- **Still loading or failed.** While the content is on its way, show the wait (STA-001, STA-002b). A load that failed is a failure, shown as FBK-002 and TXT-001a say, never as an empty space.
- **No matches.** A search or filter that found nothing is the guideline STA-003. Its way out is to change the query, not to create an item.
