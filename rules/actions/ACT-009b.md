---
id: ACT-009b
title: Build a control that acts where the person is as a button, also when it looks like a link
short: Buttons to act
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
  - criterion: "2.1.1"
    name: Keyboard
    url: https://www.w3.org/TR/WCAG22/#keyboard
    relation: supports
stances:
  material: { stance: silent }
  apple:    { stance: silent }
  carbon:   { stance: supports, sources: [carbon-link, carbon-button-accessibility] }
  govuk:    { stance: silent }
  nngroup:  { stance: supports, sources: [nngroup-buttons-vs-links] }
conflicts_checked: 2026-11-26
check: lint
how_to_check:
  - 'An `<a>` or `Link` with `href="#"`, `href=""` or `href="javascript:void(0)"` and an `onClick`. Leave alone `href="#section"` that jumps to a part of the page, and `href="#"` or `href="#top"` whose handler only scrolls to the top.'
  - 'An `onClick` on an `<a href>` or `Link` that calls `preventDefault()` and then acts in place instead of going to the address. Leave alone a handler that then goes to the same address, such as `router.push(href)`, a modifier-key check, or a smooth scroll to the `#section` it links to.'
  - 'A `DialogTrigger`, `AlertDialogTrigger`, `SheetTrigger`, `DropdownMenuTrigger`, `PopoverTrigger` or `CollapsibleTrigger` with `asChild` around an `<a>` or `Link`.'
changelog:
  - version: "1.0.0"
    date: 2026-11-26
    note: First version.
---

## Rule

A control that acts where the person is, such as saving, deleting, switching something or opening a dialog or menu, is a button in code, also when it is styled as a link. Do not build it as an `<a>` with `href="#"` or `javascript:void(0)`, or as a link whose click is cancelled by script.

## Why

A screen reader says "link" for an `<a href="#">`, so people expect to leave the page, and the control turns up in the list of links though it goes nowhere. A button says what it is, takes Enter and Space, and can carry the states a menu, a toggle or a disclosure needs. [WCAG 2.2, 4.1.2 Name, Role, Value](https://www.w3.org/TR/WCAG22/#name-role-value) asks that a control's role can be read, and its Understanding text says an element given a job other than its usual one needs extra care. [2.1.1 Keyboard](https://www.w3.org/TR/WCAG22/#keyboard) is met by the anchor's Enter alone; it supports this guideline only in that a button also takes Space, the key people expect, which is our advice. Neither names a failure for a link that acts, so this is a guideline. An `<a>` with no `href` at all is ACT-009, a requirement.

## Our reasons

Fewer than two judges have spoken about links that act, so the verdict is Insufficient evidence (1 of 3 judges spoke) and this guideline is our choice. Carbon supports it, and so does NN/g, an expert witness who does not vote. We choose a button for four reasons.

- **The role sets the expectation.** "Link" promises a new place. A dialog that opens instead surprises the person who heard it.
- **A fake link breaks what links do.** `href="#"` puts `#` in the address and jumps to the top of the page if the script fails or `preventDefault` is missing. A middle click opens a useless tab, and *Copy link* copies nothing worth having.
- **A button carries the state.** `aria-expanded`, `aria-pressed`, `aria-haspopup` and `aria-disabled` belong on buttons; that each state is set and kept in step is VIS-008a. Radix and shadcn triggers render a `<button>` and set them for you, and wrapping an `<a>` in them with `asChild` throws that away.
- **The look stays free.** `Button variant="link"` looks like a link and is a `<button>`.

## Do

- In a podcast app, each episode row has *Mark as played* styled as a text link: `<Button variant="link" onClick={markPlayed}>Mark as played</Button>`. It renders a `<button>`. The adapter's `Button` sets `type="button"` by default, so it never submits a form around it.
- *Show episode notes* opens the notes below the row with `CollapsibleTrigger`, which renders a button and sets `aria-expanded`.
- *Share episode* opens a dialog: `<DialogTrigger asChild><Button variant="link">Share episode</Button></DialogTrigger>`. Focus goes into the dialog and back to the button, as DLG-006 says.
- *Load more episodes* at the end of the list is a button. Page numbers with an address each are links, as ACT-009a says.
- *Copy feed address*, *Print transcript* and *Remove from queue* are buttons.
- Our own advice: a button inside running text may look like the links around it, but people may then expect it to go somewhere, so name the action plainly, as ACT-001a asks.
- The label of each button follows ACT-001a and its name ACT-001b.

## Don't

- Write `<a href="#" onClick={(e) => { e.preventDefault(); setShareOpen(true) }}>Share episode</a>`.
- Use Next.js `<Link href="#" onClick={markPlayed}>` for *Mark as played*.
- Give *Remove from queue* `href="javascript:void(0)"`.
- Put `<a href="#">` inside `DropdownMenuTrigger asChild` for the menu *Episode options*.
- Keep the anchor and add `role="button"` and a Space handler. That can meet 4.1.2, but it is the hand-built way ACT-009 calls worse; use a `<button>`.

## Exceptions

- **A real link that also does something.** A link with a real address that records the click, prefetches its page, or opens another program, such as a `tel:` address, still goes somewhere. Leave it a link.
- **A jump on the same page.** `href="#transcript"` that moves to a part of the page is a link, not the `href="#"` this guideline is about.
- **Form controls.** Switching something with a checkbox, a switch or a select keeps that control's own role; FRM-012b covers them.
- **Menus and tabs.** Items inside a menu keep the menu item role, and Radix `Tabs` keep the tab role. Tabs that are routes are ACT-009a.
- **No `href` at all.** An `<a>` with only a click handler has no role, which ACT-009 requires to fix.
- **A product that chooses otherwise.** This is a guideline. A product that keeps such a link still gives it a name and keyboard use (ACT-001b, KBD-001).
