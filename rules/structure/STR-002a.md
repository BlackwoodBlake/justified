---
id: STR-002a
title: Mark text that heads a part of the view as a heading in code
short: Headings in code
area: structure
status: proposed
version: "1.0.0"
verdict: requirement
judges: { spoken: 3, agreeing: 3 }
law:
  - criterion: "1.3.1"
    name: Info and Relationships
    url: https://www.w3.org/TR/WCAG22/#info-and-relationships
    relation: requires
stances:
  material: { stance: supports, sources: [material-accessibility-structure] }
  apple:    { stance: supports, sources: [apple-voiceover] }
  carbon:   { stance: supports, sources: [carbon-global-header, carbon-accessibility-developers] }
  govuk:    { stance: supports, sources: [govuk-headings] }
  nngroup:  { stance: silent }
conflicts_checked: 2026-11-25
check: review
how_to_check:
  - 'A `p`, `div` or `span` with heading-like classes, such as `text-lg font-semibold` or `text-2xl font-bold`, as the first line of a section, card, panel or dialog. Does it head that part? Then it must be `h1` to `h6`, or `role="heading"` with `aria-level`.'
  - 'A shadcn `CardTitle` or `AlertTitle` whose text heads the card or alert, with no `h2` to `h6` inside it and its element unchanged; or a `SidebarGroupLabel` that heads a group of links without `asChild` and a heading inside.'
  - 'A `DialogTitle`, `SheetTitle`, `AlertDialogTitle` or `DrawerTitle` replaced by a styled `p` or `div`.'
  - 'Heading markup on text that heads nothing, such as a price on a plan card or the small caption under a number on a dashboard tile. A `label`, `legend` or table `caption` is not a heading and is left alone.'
changelog:
  - version: "1.0.0"
    date: 2026-11-25
    note: First version.
---

## Rule

When text heads a part of the view, such as a section, a card, a panel or a dialog, mark it as a heading in code, not only with bold or large type.

## Why

A sighted person finds their way down a page by the titles that stand out. A screen reader user does the same with a list of headings and a key that jumps from one to the next. That only works when the titles are headings in code. Text styled to look like a heading is, to a screen reader, one more line of text, so the page has no sections to jump between. The reverse misleads just as much: heading markup on a label or a number invents a section that is not there.

This is a requirement. [WCAG 2.2, 1.3.1 Info and Relationships](https://www.w3.org/TR/WCAG22/#info-and-relationships) asks that structure shown on screen can also be read from the code. The Working Group lists as a failure text that is styled to look like a heading but is marked up as ordinary text ([F2](https://www.w3.org/WAI/WCAG22/Techniques/failures/F2)), and its HTML technique is the `h1` to `h6` elements ([H42](https://www.w3.org/WAI/WCAG22/Techniques/html/H42)). The same criterion fails heading markup on text that heads nothing ([F43](https://www.w3.org/WAI/WCAG22/Techniques/failures/F43)). The criterion does not ask that a page have headings, or a certain number of them. It asks that what works as a heading is one. What the heading says is STR-002b, and its level is STR-003.

## Do

- In the project tool *Ridgeway*, the page *Project settings* has the sections *Members*, *Billing address* and *Delete project*. Each section title is a heading element, styled with classes.
- In shadcn, `CardTitle` and `AlertTitle` render a `div` and take no `asChild`. When the title heads what is in the card or the alert, put an `h2` or `h3` inside it, or change the element the component renders.
- `SidebarGroupLabel` also renders a `div`, but takes `asChild`. When it heads a group of links, write `<SidebarGroupLabel asChild><h2>Projects</h2></SidebarGroupLabel>`, which keeps its styling.
- Keep `DialogTitle`, `SheetTitle`, `AlertDialogTitle` and `DrawerTitle`. They render headings through Radix and also give the dialog its name.
- When a heading takes focus from script, as DLG-006 allows in one case, it stays a heading element with `tabindex="-1"`.
- Our own advice, not required: when a part is plain to sighted users from the layout but has no visible title, such as a list of search results, give it a heading with the `sr-only` class, such as "Search results".
- Our own choice: use the native `h1` to `h6` elements. `role="heading"` with `aria-level` also counts, as a fallback when the element cannot change.

## Don't

- Head the page with `<p className="text-2xl font-bold">Project settings</p>`.
- Build a section header as `<div className="text-lg font-semibold">Members</div>`.
- Replace `DialogTitle` with a styled `p`, so the dialog loses both its heading and its name.
- Mark the small grey text under a number on a dashboard tile, such as "Open tasks", as an `h4` because the tag fits. It heads nothing, which is the failure in F43.
- Make the price on a plan card, "€12 a month", an `h3` so it stands out. A price heads nothing.

## Exceptions

- **Labels of controls.** A field's `label` or a group's `legend` is not a heading. A label may sit inside a heading when the whole page asks one question, but that is a choice, not part of this rule.
- **Table captions.** A table's caption names the table and is not a heading. A word above a list can be one, when it heads that part.
- **Not covered here.** The heading's words are STR-002b and its level is STR-003. Where a heading sits in the code relative to its part is LAY-002. The page's `title` element is STR-001.
