---
id: KBD-003a
title: Show every shortcut the product adds, beside its command or in one list
short: Findable shortcuts
area: keyboard
status: proposed
version: "1.0.0"
verdict: unanimous
judges: { spoken: 2, agreeing: 2 }
law:
  - criterion: "2.1.1"
    name: Keyboard
    url: https://www.w3.org/TR/WCAG22/#keyboard
    relation: supports
  - criterion: "2.1.4"
    name: Character Key Shortcuts
    url: https://www.w3.org/TR/WCAG22/#character-key-shortcuts
    relation: supports
stances:
  material: { stance: supports, sources: [material-accessibility-flow, material-snackbar-accessibility] }
  apple:    { stance: supports, sources: [apple-the-menu-bar, apple-menus] }
  carbon:   { stance: silent }
  govuk:    { stance: silent }
  nngroup:  { stance: supports, sources: [nngroup-ui-copy, nngroup-user-control-and-freedom] }
conflicts_checked: 2026-11-26
check: review
how_to_check:
  - 'A shortcut bound with `useHotkeys`, `tinykeys` or a `keydown` listener whose keys appear in no `Kbd`, `CommandShortcut`, `DropdownMenuShortcut`, `ContextMenuShortcut` or tooltip, and in no shortcuts list. The list may live in a help page, so look before calling it a break.'
  - 'A shortcuts list that opens only by its own key, such as `?`, with no menu item, button or link that opens it.'
  - 'Keys given only in `aria-keyshortcuts` or a `title` attribute, with nothing on screen that shows them.'
changelog:
  - version: "1.0.0"
    date: 2026-11-26
    note: First version.
---

## Rule

Every keyboard shortcut the product adds can be found inside the product: shown beside the command it triggers, such as in a menu item or tooltip, or listed with the others in one place, such as a shortcuts dialog or help page.

## Why

A shortcut nobody knows about helps nobody. The interface has little room to teach keys, so people learn them where the command lives or in one list they can return to. That matters most to the people who lean on the keyboard all day, and to anyone who needs to know which keys the page has taken before turning some of them off. No Level A or AA criterion asks that shortcuts be made known. [WCAG 2.2, 2.1.1 Keyboard](https://www.w3.org/TR/WCAG22/#keyboard) is met by the visible control that KBD-001 asks for, and [2.1.4 Character Key Shortcuts](https://www.w3.org/TR/WCAG22/#character-key-shortcuts) only needs a way out to exist. Both are better served when people can see the shortcuts, but neither requires it, so this rule rests on the judges.

## Do

- In a photo library, the menu item *Add to album* shows Alt+A at its end in a `DropdownMenuShortcut`, and the command menu shows the same keys beside *Add to album*. That span sits inside the item, so its text joins the item's name; give it `aria-hidden` and put the keys in `aria-keyshortcuts` on the item. Match Alt shortcuts on `e.code`, as KBD-003b says, so they work with Option on a Mac.
- Give an icon button a tooltip with its name and keys, such as "Rotate left (Alt+L)", and show it on keyboard focus as well as on hover. The name itself is set on the button, as ACT-001b asks; the tooltip only shows it with the keys.
- Or gather them: a dialog *Keyboard shortcuts*, opened from *Help* in the user menu, lists every shortcut grouped by area, such as *Library*, *Album* and *Editor*. Once single-key shortcuts are turned on (KBD-003b), `?` may open it too, but the menu item must, or only people who already know the key find the list. `?` is a character key, so KBD-003 applies to it.
- Shortcuts that act only inside one component, such as `j` and `k` in the photo grid, count too. Give the grid a short hint or list them under their own heading in the dialog.
- Put the switch that turns single-key shortcuts off, which KBD-003 asks for, in or next to the list, so people find both in one place.
- Keep the keys out of the control's name. Show them in a separate element, for example inside `aria-hidden` text next to the label, and give them to screen readers with `aria-keyshortcuts`. This is our own advice.
- Show Cmd on a Mac and Ctrl on Windows and Linux, read from `navigator.userAgentData?.platform` or `navigator.platform`. This is our own advice.
- Our own advice: show only keys that work. `CommandShortcut`, `DropdownMenuShortcut`, `ContextMenuShortcut` and `Kbd` in shadcn only draw text; bind the keys they show.

## Don't

- Bind Alt+A with `useHotkeys` and show it nowhere, so people only learn of it by accident.
- Open the list of shortcuts only by `?`, with no link to it anywhere on screen.
- Put the keys only in a `title` attribute, which shows on mouse hover and never on keyboard focus, or only in `aria-keyshortcuts`, which reaches screen readers and nobody else.
- Name a button "Search Ctrl K", so a voice control user must say the keys to press it.
- Show ⌘S beside *Save* to everyone, so people on Windows press a key their keyboard does not have.

## Exceptions

- **Keys that are not the product's.** The browser's, the operating system's and the screen reader's own keys need no listing.
- **The standard keys of a control.** Arrow keys in a menu, Escape in a dialog, Enter in a form and typeahead in a listbox come with the control and are not shortcuts the product adds.
- **Neighbouring rules.** A shortcut is always an extra beside a visible control (KBD-001). Listing a single-key shortcut does not make it acceptable; it still needs a way out (KBD-003). Which keys to choose is KBD-003b.
