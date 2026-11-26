---
id: ACT-009a
title: Build a control that only takes people somewhere as a link, also when it looks like a button
short: Links to go somewhere
area: actions
status: proposed
version: "1.0.0"
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
  carbon:   { stance: supports, sources: [carbon-button, carbon-link] }
  govuk:    { stance: supports, sources: [govuk-button] }
  nngroup:  { stance: supports, sources: [nngroup-command-links, nngroup-buttons-vs-links] }
conflicts_checked: 2026-11-26
check: lint
how_to_check:
  - 'A `Button` without `asChild` and not `variant="link"`, or a `<button>`, whose `onClick` does nothing but call `router.push`, `navigate()`, `window.open` or set `window.location`. Leave alone one whose job is to save, send, delete or sign out, or send typed input such as *Search*, before it moves on.'
  - 'A `DropdownMenuItem` or `SidebarMenuButton` without `asChild` whose `onSelect` or `onClick` only goes to another page.'
  - 'Pagination, breadcrumb or route tab controls not shown as links, built as buttons that change the address by script, where each page has an address of its own. Leave alone Radix `Tabs` whose `onValueChange` only mirrors the open tab in a search param of the same page.'
changelog:
  - version: "1.0.0"
    date: 2026-11-26
    note: First version.
---

## Rule

When a control not shown as a link only takes people to another address, such as a page or a spot on a page, build it as a link in code, not as a button that changes the address by script. A control that acts and then moves on stays a button.

## Why

A link and a button are announced differently, and people act on what they hear: a link takes them away, a button does something where they are. A link also brings what the browser gives every link: open in a new tab, copy the address, see where it goes before going, and appear in a screen reader's list of links. A button that calls `router.push` has none of that, though it looks the same. [WCAG 2.2, 4.1.2 Name, Role, Value](https://www.w3.org/TR/WCAG22/#name-role-value) asks that a control's role can be read, and its Understanding text says an element made to do something other than its usual job needs extra care. It names no failure for a button that navigates, so this is a guideline. Something shown as a link that navigates is ACT-009, a requirement.

## Our reasons

Fewer than two judges have spoken about which element should take people somewhere, so the verdict is Insufficient evidence (1 of 3 judges spoke) and this guideline is our choice. Carbon supports it. So do GOV.UK and NN/g, expert witnesses who do not vote. We choose a link for four reasons.

- **The role sets the expectation.** "Button" tells a screen reader user that something will happen here. When the page changes instead, they have to work out where they are.
- **People keep what links give them.** Opening a page in a new tab, copying its address or seeing it in the status bar is how many people work. A scripted button takes it away for no gain.
- **The look stays free.** `Button asChild` gives the link any button style, so the design loses nothing.
- **Our own advice:** search engines and prefetching follow `href`, not click handlers.

## Do

- In a vet clinic's portal for pet owners, the dashboard has *View appointments* styled as a primary button: `<Button asChild><Link href="/appointments">View appointments</Link></Button>`. It renders an `<a href>` with button styling. The adapter's `Button` leaves `type` off when `asChild` is used.
- A link styled as a button names where it goes, as TXT-003 asks for every link. ACT-001a covers buttons that perform, confirm or commit an action, so its verb-first form is not required here. *View appointments* and *Appointments* both work.
- If the page guards unsaved changes, keep the guard on link clicks too once `router.push` becomes a `Link`, as FRM-004c asks.
- *Open pharmacy site* goes to another site: `<Button variant="outline" asChild><a href="https://pharmacy.example.com">`. Whether it opens a new tab is outside this guideline.
- The menu *My pets* lists each pet as `DropdownMenuItem asChild` with a `Link` inside. Inside a menu the item is announced as a menu item, not a link, and that is right; the `<a href>` still keeps the address and open in a new tab.
- Sidebar items are `SidebarMenuButton asChild` with a `Link`, and NAV-002a says how to mark the current one. Pagination with an address per page, breadcrumbs and tabs that are routes are links too.
- *Book appointment* saves the booking and then shows it. Its job is the booking, so it is a button, and the page that follows is the result. The same goes for *Next* on a step of a form that checks or saves the step, and for *Sign out*.
- *Next: aftercare* at the foot of a read-only care guide only shows the next page, so it is a link.
- Our own choice for *Back*: link to the parent page where there is one, such as *Back to Bella's records*. Use a button that calls `router.back()` only when going back in history is truly the job.
- A jump to a part of the same page, such as `href="#vaccinations"`, is a link.
- A download is a link to the file, `<a href download>`. When the file is made by script on request, it is a button.
- Our own choice: a route shown as a dialog, with an address that also opens on its own, is a link. A dialog, sheet or menu with no address of its own opens from a button, as ACT-009b says.

## Don't

- Write `<Button onClick={() => router.push("/appointments")}>View appointments</Button>`.
- Open the pharmacy site with `onClick={() => window.open("https://pharmacy.example.com")}` on a `Button`.
- Fill *My pets* with `DropdownMenuItem onSelect={() => router.push("/pets/bella")}`, so no item can be opened in a new tab.
- Build the page numbers under *Past visits* as buttons that call `router.push("?page=3")`.

## Exceptions

- **Shown as a link.** A control that looks like a link and navigates is ACT-009's requirement, not this guideline.
- **Act, then move.** A control whose job is to save, send, delete or sign out, or send typed input such as *Search*, is a button even when a new page follows, also when the result has an address.
- **Menus and tabs.** A menu item keeps the menu item role and tabs inside one page keep the tab role. What matters here is that a menu item that goes somewhere wraps a real link.
- **A product that chooses otherwise.** This is a guideline. A product that keeps a button for navigation still gives it a role, a name and keyboard use (ACT-009, ACT-001b, KBD-001). FRM-012b's own wording allows a button, a link or a menu for going to another page; this guideline picks the link.
