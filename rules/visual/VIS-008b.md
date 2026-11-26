---
id: VIS-008b
title: Keep a selected or on state visible while the item is hovered, focused or pressed
short: Selected look kept
area: visual
status: proposed
version: "1.0.0"
verdict: unanimous
judges: { spoken: 3, agreeing: 3 }
law:
  - criterion: "1.4.11"
    name: Non-text Contrast
    url: https://www.w3.org/TR/WCAG22/#non-text-contrast
    relation: supports
  - criterion: "1.4.1"
    name: Use of Color
    url: https://www.w3.org/TR/WCAG22/#use-of-color
    relation: supports
stances:
  material: { stance: supports, sources: [material-states, material-lists, material-lists-accessibility] }
  apple:    { stance: supports, sources: [apple-focus-and-selection, apple-toggles] }
  carbon:   { stance: supports, sources: [carbon-color-overview, carbon-tile] }
  govuk:    { stance: silent }
  nngroup:  { stance: supports, sources: [nngroup-button-states-communicate-interaction] }
conflicts_checked: 2026-11-26
check: review
how_to_check:
  - 'A `hover:bg-*` or `hover:text-*` class on an item whose selected or on state is drawn only by `bg-*` and `text-*` classes, with no variant that keeps the hover off the selected item and no icon, bar or text for the state.'
  - 'The same classes under `hover:`, `focus:` or `active:` as under `data-[state=on]:`, `aria-selected:`, `aria-pressed:` or the conditional selected class, when the state has no other cue.'
  - 'The focus look''s own classes, such as `ring-ring` or `outline-ring`, used to show a selected, checked or on state.'
  - 'A check icon, bar or badge for the state hidden on hover or focus, such as `group-hover:hidden`.'
changelog:
  - version: "1.0.0"
    date: 2026-11-26
    note: First version.
---

## Rule

A state that lasts, such as selected, checked, on or current, stays visible while the same item is also hovered, focused or pressed. The look of hover, focus or press is never the same as the look of a state that lasts.

## Why

Hover, focus and press come and go with the pointer, the keyboard and the finger. Selected, checked, on and current stay until the person changes them. If the passing look wipes out the lasting one, the selected item turns into any other hovered item the moment the person points at it, which is exactly when they are checking what they chose. If the two looks are the same, the person cannot tell the item they chose from the item under the pointer, or from where the keyboard is. They may leave believing the wrong plan is chosen, or press a toggle again because it seemed already on. No WCAG criterion asks that states combine or differ from each other. [WCAG 2.2, 1.4.11 Non-text Contrast](https://www.w3.org/TR/WCAG22/#non-text-contrast) only adds that a hover must not make the cue for focus or selection lose contrast, which VIS-004 carries, and [1.4.1 Use of Color](https://www.w3.org/TR/WCAG22/#use-of-color) supports keeping a cue that does not rest on a tint. The rule rests on the judges.

## Do

- Let the looks add up. In a toolbar's `ToggleGroup` for *Bold*, *Italic* and *Underline*, an item that is on keeps its on look while hovered: scope the hover to items that are off, as in `data-[state=off]:hover:bg-muted`, or give the on state a hover of its own, such as `data-[state=on]:hover:bg-primary/90` where on is `bg-primary`.
- On a pricing page, the chosen plan card carries a check icon and the text "Selected", as VIS-003a asks. Hover changes only the card's fill, so the check and the word are still there under the pointer.
- When the same token draws hover and selected, which VIS-002 allows for `bg-accent`, give the selected item a cue the hover does not use, such as a check, a bar beside it or heavier text. VIS-002 picks the token, VIS-003a asks for the second cue, and this rule keeps the two looks apart and the lasting one in place.
- In a data table with selectable rows, keep the checkbox column. A selected row in `bg-muted` and a hovered row in `bg-muted/50` differ only slightly, and the checked box is what shows the selection under the pointer.
- A selected item that gets focus shows both: the focus indicator that KBD-001 describes and its selected look.
- In `Select`, `Command` and menus, the highlighted row under the pointer or keyboard gets `bg-accent`, and the chosen value shows a check. Keep it that way. The highlight moves; the chosen value must not depend on it.
- In a sidebar, hovering the current page's item does not remove its mark. shadcn's `SidebarMenuButton` draws both `data-[active=true]:` and `hover:` with `bg-sidebar-accent`, so under the pointer any item looks current unless the current one keeps another mark, such as its `font-medium` or a bar beside it. The mark itself is NAV-002b.
- Style the lasting state from the state in code, as in `aria-pressed:` or `data-[state=on]:`. That is VIS-008a's own advice, and it also keeps the selected look from drifting when the hover classes change.

## Don't

- Give the selected item `bg-primary text-primary-foreground` and every item `hover:bg-accent hover:text-accent-foreground`, so the selected item looks like any other once the pointer is on it.
- Mark a chosen card with `ring-2 ring-ring`, the look of focus. VIS-002 keeps `ring` for focus.
- Draw focus as `focus:bg-accent` on items whose selected look is also only `bg-accent`.
- Give *Undo* in a toolbar the same `active:` fill that *Bold* uses for on, so a press on *Undo* looks like a toggle switching on.
- Hide the check on the chosen option with `group-hover:hidden` and show an arrow in its place.

## Exceptions

- **The change itself.** When a press switches a toggle on or off, the lasting look changes, as it should. The rule asks only that hover, focus and press do not hide or imitate it.
- **How far apart.** How much the looks must differ is not set here. A state told by colour alone is VIS-003a, and the contrast of a state mark, also while hovered, is VIS-004.
- **Neighbouring rules.** Whether hover and press looks exist at all is VIS-008. The focus look is KBD-001. The current page's mark is NAV-002b. The state in code is VIS-008a.
