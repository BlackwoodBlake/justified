---
id: NAV-002a
title: When a menu shows the current page, say so in the code on that item
short: Current page in code
area: navigation
status: proposed
version: "1.0.1"
verdict: requirement
judges: { spoken: 1, agreeing: 1 }
law:
  - criterion: "1.3.1"
    name: Info and Relationships
    url: https://www.w3.org/TR/WCAG22/#info-and-relationships
    relation: requires
  - criterion: "4.1.2"
    name: Name, Role, Value
    url: https://www.w3.org/TR/WCAG22/#name-role-value
    relation: supports
stances:
  material: { stance: silent }
  apple:    { stance: silent }
  carbon:   { stance: supports, sources: [carbon-ui-shell-left-panel-accessibility] }
  govuk:    { stance: silent }
  nngroup:  { stance: silent }
conflicts_checked: 2026-11-26
check: lint
how_to_check:
  - 'A shadcn `SidebarMenuButton` or `SidebarMenuSubButton` with `isActive` whose link has no `aria-current`, such as `<SidebarMenuButton asChild isActive={active}><Link href="/invoices">`, and no visually hidden text such as "(current page)" inside the link. React Router''s `NavLink` as the child sets it itself.'
  - 'A navigation link whose current state is only a class, such as `cn(active && "bg-accent font-semibold")` on a Next.js `Link`, with no `aria-current` set from the same condition and no visually hidden "(current page)" text.'
  - 'A Radix `NavigationMenu.Link` styled as current through a class but given no `active` prop.'
  - '`aria-current` on an `li`, `div` or other wrapper instead of the `a`, or `aria-selected` used on a menu link in its place.'
  - '`aria-current` set on every item of a menu, or `"page"` able to match two items in the same menu. On a page that is not in the menu, `aria-current="true"` on its section''s item is fine.'
changelog:
  - version: "1.0.1"
    date: 2026-11-26
    note: Points to STR-006a for the entries of a language picker.
  - version: "1.0.0"
    date: 2026-11-25
    note: First version.
---

## Rule

When a navigation menu shows which item is the page the person is on, the code or the text says so too, so a screen reader announces that item as the current page. The usual way is `aria-current="page"` on its link.

## Why

A highlighted menu item tells a sighted person where they are. A screen reader user who hears only "Invoices, link" gets none of that, and has to work out their place from the page itself. [WCAG 2.2, 1.3.1 Info and Relationships](https://www.w3.org/TR/WCAG22/#info-and-relationships) requires that what the presentation shows can also be found in code or in text. The criterion does not name any attribute. The Working Group lists `aria-current` as a sufficient way to expose the current item in a set of links ([ARIA26](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA26)); its techniques are how the Working Group reads the criterion, not the criterion's own words. Sufficient is not the only way. Text that says so, read out with the link, also meets the criterion, so the rule names `aria-current` as the usual means and accepts others that a screen reader announces just as clearly. The same technique is also listed under 2.4.8 Location, which is Level AAA and outside this rule. [4.1.2 Name, Role, Value](https://www.w3.org/TR/WCAG22/#name-role-value) points the same way but is written about states a person sets on a control, so this rule does not rest on it. Whether the menu should show a current item at all is NAV-002b.

## Do

- In the invoicing app *Tallowbrook*, the sidebar lists *Dashboard*, *Invoices*, *Clients* and *Reports*. On the invoice list, *Invoices* is highlighted, and its link has `aria-current="page"`. A screen reader reads it as "Invoices, current page, link".
- shadcn's `SidebarMenuButton` takes an `isActive` prop. In the current shadcn source (read on 25 November 2026) it sets only `data-active`, which the classes use for the highlight, and adds no `aria-current`. `SidebarMenuSubButton` does the same. Set it yourself: `<SidebarMenuButton asChild isActive={active}><Link href="/invoices" aria-current={active ? "page" : undefined}>Invoices</Link></SidebarMenuButton>`.
- Next.js `Link` does not set `aria-current` by itself, so pass it as above. React Router's `NavLink` sets `aria-current="page"` on its own when the route matches; keep it, and do not swap it for a plain `Link` with an active class. Radix `NavigationMenu.Link` sets it when you pass `active`, so pass `active` rather than only a class.
- Our own choice: put the mark on the element that is the link, the `a`, and on one item per menu.
- When the top bar and the sidebar each show a current item, each `nav` marks its own.
- Our own reading: on a single invoice, `/invoices/INV-0042`, the sidebar still highlights *Invoices* as the section the person is in, but that page is not in the menu. Mark *Invoices* with `aria-current="true"`, the current item in a set, rather than `"page"`.
- On a narrow screen the shadcn `Sidebar` moves into a sheet. Because the mark is on the link, it moves with it, as the links themselves must under LAY-001. A menu built from a second, hand-written list needs the same mark.
- shadcn's `BreadcrumbPage` already renders the last crumb with `aria-current="page"`. If you show the current page in a breadcrumb as a real link instead, give that link the mark.
- Another way that meets the criterion: visually hidden text such as "(current page)" inside the link. Use one way, not both, or the screen reader says it twice.
- Keep the current link focusable and in the tab order, as KBD-001 expects of links.

## Don't

- Set `isActive={pathname === item.url}` on `SidebarMenuButton` and stop there, so the highlight has no counterpart in code.
- Put `aria-current` on the `li` or on a wrapping `div` instead of the link.
- Use `aria-selected` on a menu link. It belongs to tabs, options and grid cells. It is not a supported state on a link, and most screen readers do not announce it there.
- Give every item `aria-current="true"`, or two items in the same menu `aria-current="page"`.
- Mark the current item only with a class such as `font-semibold` or `bg-accent`.

## Exceptions

- **A menu that shows no current item.** There is nothing to expose, so this rule asks nothing. Whether it should show one is NAV-002b.
- **Tabs.** shadcn `Tabs` switch a panel in place, and Radix already exposes the selected tab. This rule is for menus of links that go to pages.
- **Steps and result pages.** The same attribute takes the values `step` for the current step in a process and `page` for the current page of results in pagination. Those are outside this navigation rule.
- **Language pickers.** The current entry in a language picker is said in code the same way, for example with `aria-current`. The language of each entry is STR-006a.
- **Neighbouring rules.** The menu's `nav` and its name are STR-004. What the current item looks like is NAV-002b.
