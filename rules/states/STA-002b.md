---
id: STA-002b
title: Never say a space is empty while its content is still loading
short: Loading is not empty
area: states
status: proposed
version: "1.0.0"
verdict: unanimous
judges: { spoken: 2, agreeing: 2 }
law:
  - criterion: "4.1.3"
    name: Status Messages
    url: https://www.w3.org/TR/WCAG22/#status-messages
    relation: supports
stances:
  material: { stance: silent }
  apple:    { stance: supports, sources: [apple-loading] }
  carbon:   { stance: supports, sources: [carbon-empty-states-pattern, carbon-search-pattern, carbon-loading-pattern] }
  govuk:    { stance: silent }
  nngroup:  { stance: supports, sources: [nngroup-empty-state-interface-design] }
conflicts_checked: 2026-11-25
check: review
how_to_check:
  - 'A list kept as `useState([])`, filled by a fetch in `useEffect`, that renders the empty state on `items.length === 0` with no separate loading state. Leave it alone when the items come with the page and nothing is fetched.'
  - '`data ?? []` or `data || []` from TanStack Query, SWR or similar passed to a table, a list or a `.length === 0` check, with no earlier branch for `isPending` or `isLoading`.'
  - '`catch { setItems([]) }`, or an `isError` that falls through to the empty state, so a failed fetch reads as an empty list.'
  - 'A Suspense boundary around fetched content with `fallback={null}`, or `CommandEmpty` in a command menu that searches the server, shown while the request is still running.'
  - 'Rows that go empty when a filter or the query key changes, with no `placeholderData: keepPreviousData` and no loading branch, so the empty row shows during the request.'
changelog:
  - version: "1.0.0"
    date: 2026-11-25
    note: First version.
---

## Rule

While a list, table or panel is still fetching its content, show that it is loading, never that it is empty. Show the message that there is nothing only after the fetch has finished and returned no items.

## Why

A message that says there is nothing is an answer, and people act on it. If it shows while the content is still on its way, some leave and never see their data, and those who wait and see it fill in learn not to trust what the app tells them. A blank space during the fetch does harm too, since it looks the same as an empty one. The space has to say "on its way" until the reply is there, and "nothing" only after. How and where the wait is drawn is STA-001. What the empty space then says is STA-002a, or the guideline STA-003 after a search or filter. No WCAG criterion says which of the two to show. When the line changes in place while focus stays elsewhere, both "Loading orders" and "No orders yet" are status messages under [WCAG 2.2, 4.1.3 Status Messages](https://www.w3.org/TR/WCAG22/#status-messages), announced as FBK-004 says.

## Do

- Give the component at least three states, not two: loading, empty and ready, and a fourth for a failure. A plain `useState([])` cannot tell "not fetched yet" from "fetched, nothing there".
- With TanStack Query, show the wait while `isPending` is true. Show the empty state only when `isSuccess` is true and the data is an empty array. Never treat `data` that is still `undefined` as empty. A query with `enabled: false`, such as a search before anything is typed, stays pending without fetching: show neither the wait nor the empty state then, only the prompt to type.
- A dashboard card *Overdue invoices* fetches on its own. Until the reply it shows a small indicator named "Loading overdue invoices", as STA-001 asks. Then it shows the invoices, or the empty state STA-002a describes.
- A table refetches after the person changes a filter. Keep the old rows, dimmed, with an indicator, as STA-001 says, until the new rows or the no-match message from STA-003 arrive. With TanStack Query, set `placeholderData: keepPreviousData` so the old rows stay while the new query key loads, and dim them while `isPlaceholderData` is true.
- A command menu searches the server as the person types. While the request runs, the list says "Searching customers …". Only after the reply does it show the matches, or the no-match line.
- Give a Suspense boundary a `fallback` with a skeleton or an indicator.
- When the fetch fails, the space shows a failure, not an empty state. FBK-002 says where it goes and how long it stays, and TXT-001a what it says, with a way to try again. It may use the same place as the empty state, but it is a failure message.
- Whether to show a wait at all for a very quick reply is STA-001's own choice of about half a second. Applied here: for that half second the space shows neither the wait nor the empty state.
- The line that changes from "Loading invoices" to "No overdue invoices" or to "12 overdue invoices" is announced as FBK-004 says. The rows themselves are not a status message.

## Don't

- Write `const [items, setItems] = useState([])` and render `items.length === 0 ? <Empty /> : <List />`, so "No invoices yet" flashes on the first render before the effect has fetched anything.
- Write `catch { setItems([]) }`, or pass `data ?? []` to the shadcn data table, so a server error or a dropped connection shows the table's "No results." row.
- Clear the rows as soon as a filter changes, so the empty row shows for as long as the request takes.
- Use `fallback={null}` on a Suspense boundary, so the area is blank while it loads.
- Show `CommandEmpty` with "No results found." after the first keystroke while the request is still running.

## Exceptions

- **Content already on the page.** A list that is rendered with the page, with nothing to fetch, has no loading state. Show the items or the empty state at once.
- **What the wait looks like.** A spinner, a skeleton or dimmed old rows all fit this rule. STA-001 decides which and where.
