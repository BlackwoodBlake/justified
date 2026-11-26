---
id: NAV-002b
title: Mark the current page in a repeated menu with a cue that is not colour alone
short: Current page visible
area: navigation
status: proposed
version: "1.0.1"
verdict: unanimous
judges: { spoken: 2, agreeing: 2 }
law:
  - criterion: "1.4.1"
    name: Use of Color
    url: https://www.w3.org/TR/WCAG22/#use-of-color
    relation: supports
stances:
  material: { stance: supports, sources: [material-navigation-rail, material-navigation-rail-accessibility, material-navigation-bar, material-navigation-bar-accessibility, material-navigation-drawer] }
  apple:    { stance: silent }
  carbon:   { stance: supports, sources: [carbon-ui-shell-left-panel-accessibility] }
  govuk:    { stance: silent }
  nngroup:  { stance: supports, sources: [nngroup-navigation-you-are-here] }
conflicts_checked: 2026-11-26
check: review
how_to_check:
  - 'The classes for the current item, such as `data-[active=true]:` styles or an `active &&` branch. Do they change only colour, such as `text-foreground` against `text-muted-foreground`, or a faint tint? Look for heavier text, a filled icon, a shape behind the item that meets VIS-004, or a bar beside it.'
  - 'A shadcn `SidebarMenuSubButton` with `isActive` and only its default classes, which change colour only.'
  - 'Whether the current style matches the hover style, so the item under the pointer looks current too. In shadcn''s `SidebarMenuButton`, only `font-medium` tells them apart.'
  - 'How the current item is chosen: from the route, such as `usePathname()` or `useLocation()`, not from state set on click; and so that only one item matches, with `/` matched exactly rather than by `pathname.startsWith`.'
  - 'Collapse the sidebar to icons with `collapsible="icon"` and see whether the current item still has a cue that is not colour alone, such as a filled icon or a border.'
changelog:
  - version: "1.0.1"
    date: 2026-11-26
    note: Points to VIS-008b for keeping the current mark apart from hover.
  - version: "1.0.0"
    date: 2026-11-25
    note: First version.
---

## Rule

A navigation menu that repeats across pages marks the item for the page or section the person is in, and only that item. The mark does not rest on colour alone: use heavier text, a filled icon, a shape behind the item or a bar beside it.

## Why

A mark on one menu item tells the person where they are at a glance; a mark on two items, or one that looks like hover, answers it wrongly. A mark made of colour alone is lost on people who do not see that colour difference, and in forced-colours mode. No WCAG criterion at Level AA asks a menu to show the current item; 2.4.8 Location asks for it, but that is Level AAA. [WCAG 2.2, 1.4.1 Use of Color](https://www.w3.org/TR/WCAG22/#use-of-color) sets a lower floor than this rule: it accepts a colour change that also differs enough in lightness, and a swap of foreground and background. So a colour-only mark does not always fail WCAG. Asking for a cue that is not colour at all is the judges' level, not the law's. This rule sits on two Requirements and sets no contrast figure of its own. When the mark uses colour, VIS-003a sets the lightness difference the law asks as a minimum. When a bar, a border or a shape behind the item is how people see the mark, VIS-004 sets the contrast that indicator needs. Saying the same thing in code is NAV-002a.

## Do

- In the invoicing app *Tallowbrook*, the sidebar lists *Dashboard*, *Invoices*, *Clients* and *Reports*. On the invoice list, *Invoices* has semibold text, a filled icon and a bar on its leading edge. The other items have regular text and outlined icons.
- Know what shadcn gives you. In the current source (read on 25 November 2026), an active `SidebarMenuButton` gets `bg-sidebar-accent`, `text-sidebar-accent-foreground` and `font-medium`, and hover uses the same background and text colour. Only the weight tells the current item from the hovered one. An active `SidebarMenuSubButton` changes colour only. Add a cue of your own, such as `data-[active=true]:font-semibold` with a left border.
- Keep the current mark and the hover style different, so the person can tell the page they are on from the item under the pointer. VIS-008b asks this of every state that lasts.
- Take the mark from the route, not from a click handler, so it is right after a reload, a back press or a link from elsewhere.
- Match routes so that one item wins. `pathname.startsWith("/")` is true everywhere, so *Dashboard* at `/` matches only exactly.
- Our own reading: on a single invoice, `/invoices/INV-0042`, which is not in the menu, mark *Invoices*, the section the person is in.
- In a nested group, the child item gets the mark. The parent may show that it holds the current page, for example by staying expanded, but not with the same mark.
- Keep a cue that survives the collapsed sidebar (`collapsible="icon"`), where the label is gone: a filled icon, or a border or shape behind the icon that meets the contrast VIS-004 asks for against the bar behind it. A shape that falls short of that does not count as the cue.
- On a narrow screen the menu moves into a sheet (LAY-001). The current item keeps its mark there.
- Our own advice: forced-colours mode (Windows high contrast) drops background colours, so a mark made only of a background pill, or a bar drawn with a background, disappears. Weight, a border and an icon change survive.
- Make the mark look nothing like the focus ring, which KBD-001 owns. Both can show on the same item at once.

## Don't

- Mark *Invoices* with `text-foreground` while the rest are `text-muted-foreground`, and nothing else.
- Use the hover classes for the current item, so moving the pointer over *Clients* makes two items look current.
- Highlight *Dashboard* and *Reports* together on the reports page because of a prefix match.
- Set the active item in state on click, so nothing is marked after a reload.
- Leave only a faint tint behind the icon when the sidebar collapses to icons.

## Exceptions

- **No item matches.** On a page reached from the account menu, such as *Profile*, which the sidebar does not list, mark nothing rather than the nearest item.
- **Menus that are not about place.** An account menu or a menu of actions has no current page and needs no mark.
- **Tabs.** Tabs that switch a panel in place show a selected tab; this rule is for menus of links that go to pages.
