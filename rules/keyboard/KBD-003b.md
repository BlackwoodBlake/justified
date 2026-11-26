---
id: KBD-003b
title: Build a shortcut on a modifier key by default
short: Modifier by default
area: keyboard
status: proposed
version: "1.0.0"
verdict: unanimous
judges: { spoken: 2, agreeing: 2 }
law:
  - criterion: "2.1.4"
    name: Character Key Shortcuts
    url: https://www.w3.org/TR/WCAG22/#character-key-shortcuts
    relation: supports
stances:
  material: { stance: supports, sources: [material-accessibility-flow] }
  apple:    { stance: supports, sources: [apple-keyboards] }
  carbon:   { stance: silent }
  govuk:    { stance: silent }
  nngroup:  { stance: silent }
conflicts_checked: 2026-11-26
check: lint
how_to_check:
  - '`useHotkeys` or `tinykeys` bound to the whole page, not to an element through the hook''s ref or a target element, with a single letter, digit, punctuation mark or symbol and no modifier or Shift, such as `"n"` or `"/"`, active before the person has turned single-key shortcuts on.'
  - 'A `keydown` listener on `document` or `window` that acts on a single character (`e.key.length === 1`) without requiring `e.ctrlKey`, `e.altKey`, `e.metaKey` or `e.shiftKey`, active before the person has turned anything on. Escape that closes an overlay does not match (see Exceptions).'
  - 'A setting for single-key shortcuts whose starting value is on.'
changelog:
  - version: "1.0.0"
    date: 2026-11-26
    note: First version.
---

## Rule

A keyboard shortcut the product adds includes a modifier key (Ctrl, Alt or Cmd) or Shift by default. A single key, such as `n` or `/`, works as a shortcut only after the person turns such shortcuts on, or only while its own control has focus.

## Why

A key that types a character also arrives when someone types in the wrong place, brushes the keyboard or speaks to some speech input programs, which turn words into key presses. A shortcut that needs Ctrl, Alt or Cmd cannot fire that way, so it is safe from the start, without asking anyone to find a setting first. [WCAG 2.2, 2.1.4 Character Key Shortcuts](https://www.w3.org/TR/WCAG22/#character-key-shortcuts) asks less: it allows a single-key shortcut on from the start, if it can be turned off, changed or is bound to focus. That floor is KBD-003, a Requirement. This rule raises it, on the judges' verdict, not the law's. The two never pull apart: a product that follows this rule follows KBD-003 too, provided the single-key shortcuts a person turned on can be turned off again, as KBD-003 asks. A product that meets only KBD-003, with single keys on by default and a switch to turn them off, meets the law but not this rule. Shift is not a modifier in these texts. Shift alone meets this rule's default, but Shift+N still types a character, so KBD-003 asks for a way out: a switch, a remap or focus binding. Where both apply, KBD-003 comes first.

## Do

- In an invoicing app, Cmd+K or Ctrl+K opens the command menu, bound with `useHotkeys("mod+k", …)` or `(e.metaKey || e.ctrlKey) && e.key === "k"`. The button *Search* in the header opens it too (KBD-001).
- Give *New invoice* Alt+Shift+N beside its button. Match Alt and Option shortcuts on `e.code` (`KeyN`), because Option plus a letter types a special character on a Mac and `e.key` is no longer `n`.
- Offer single keys as a choice: *Settings > Keyboard shortcuts* has a switch *Use single-key shortcuts*, off at first. Once turned on, `n` starts a new invoice and `/` focuses search. The same switch turns them off again, which is what KBD-003 needs.
- Bind both platforms. Libraries' `mod` and `$mod` mean Cmd on a Mac and Ctrl elsewhere; `e.metaKey` alone does nothing on Windows.
- Our own advice: leave the browser's own combinations alone, such as Ctrl or Cmd with F, L, T, W or P, and Ctrl+Tab. A page that saves its own documents may use Ctrl or Cmd+S for *Save*, since that keeps its usual meaning.
- Our own choice: prefer Ctrl, Alt or Cmd to Shift alone, so the shortcut needs none of KBD-003's ways out.
- Give a Shift-only shortcut, such as Shift+N, one of KBD-003's ways out.
- Show the keys you chose, as KBD-003a asks.

## Don't

- Ship `useHotkeys("n", newInvoice)` on from the start, even with a switch to turn it off. It meets KBD-003 but not this rule.
- Bind only `e.metaKey`, so the shortcut does nothing for people on Windows.
- Call `preventDefault()` on Ctrl+F, so people lose find in page.

## Exceptions

- **Keys bound to focus.** Typeahead in a `Select` or listbox, letter keys in an open `DropdownMenu`, `j` and `k` on a list's own `onKeyDown` or on a `useHotkeys` whose ref is attached to the list, `tinykeys` bound to an element rather than `window` or `document`, and single-key tools on a drawing canvas that has focus are not page-wide shortcuts. They are outside this rule, as they are outside KBD-003's demand for a way out.
- **The standard keys of a control.** Escape in a dialog or an open overlay, the arrow keys in a menu and Enter in a form come with the control and are not shortcuts the product adds.
- **Neighbouring rules.** The legal floor for character keys is KBD-003, the visible control beside every shortcut is KBD-001, and making shortcuts findable is KBD-003a.
