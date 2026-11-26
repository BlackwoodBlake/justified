---
id: VIS-008a
title: Set every state a control shows in code on the control, and change it whenever the look changes
short: State in code
area: visual
status: proposed
version: "1.0.0"
verdict: requirement
judges: { spoken: 2, agreeing: 2 }
law:
  - criterion: "4.1.2"
    name: Name, Role, Value
    url: https://www.w3.org/TR/WCAG22/#name-role-value
    relation: requires
  - criterion: "1.3.1"
    name: Info and Relationships
    url: https://www.w3.org/TR/WCAG22/#info-and-relationships
    relation: supports
stances:
  material: { stance: supports, sources: [material-lists-accessibility, material-states] }
  apple:    { stance: silent }
  carbon:   { stance: supports, sources: [carbon-button-accessibility, carbon-disabled-states, carbon-tile-accessibility] }
  govuk:    { stance: silent }
  nngroup:  { stance: supports, sources: [nngroup-button-states-communicate-interaction] }
conflicts_checked: 2026-11-26
check: lint
how_to_check:
  - 'A class switched by a boolean such as `selected`, `active`, `checked` or `open`, as in `cn(…, selected && "bg-accent")`, on an element with `onClick` and no matching `aria-pressed`, `aria-selected`, `aria-checked`, `aria-expanded`, `aria-current`, `aria-sort` on its header cell, or Radix or cmdk `data-state`.'
  - '`opacity-50`, `pointer-events-none` or `cursor-not-allowed` applied by a condition to a button, link or field that gets neither `disabled` nor `aria-disabled` under the same condition.'
  - 'A literal state that never changes, such as `aria-pressed="true"` or `aria-expanded={true}`, or a state set on a wrapping `li` or `div` instead of the element with the role.'
  - '`aria-disabled="true"` on a control whose handler still runs its action.'
changelog:
  - version: "1.0.0"
    date: 2026-11-26
    note: First version.
---

## Rule

When a control shows a state, such as on or off, selected, checked, expanded or unavailable, that state is also set in code on the control itself. Whenever the look changes, the state in code changes with it.

## Why

A screen reader and speech control do not see a filled icon, a coloured border or a rotated chevron. They read the state the control carries in code. A *Mute* button drawn as on but silent in code is announced as an ordinary button, and the person cannot tell whether they are heard. A card drawn as chosen is announced as nothing at all. A state that is set once and never updated is worse: it tells the opposite of what the screen shows. [WCAG 2.2, 4.1.2 Name, Role, Value](https://www.w3.org/TR/WCAG22/#name-role-value) requires that states the person can change can also be set by software, and that changes are passed on to assistive technology. Its explanation adds that states can be read by software, and names checked, selected and expanded among those states, and custom toggles and disclosures among the controls. [1.3.1 Info and Relationships](https://www.w3.org/TR/WCAG22/#info-and-relationships) supports it: what the look tells must also be in the code. The criterion does not say which element or attribute to use.

## Do

- Use the components that set the state for you: shadcn's `Toggle`, `ToggleGroup`, `Checkbox`, `RadioGroup`, `Switch`, `Tabs`, `Accordion`, `Collapsible`, `Select`, `DropdownMenuCheckboxItem` and `DropdownMenuRadioItem`. Each exposes its state in code and as `data-state` for styling.
- In a video call's toolbar, *Mute* is a `Toggle` with the fixed name "Mute", so a screen reader announces it as pressed when it is on. A *Favourite* star built from a `Button` gets `aria-pressed={isFavourite}` and keeps its name.
- Or let the name follow the state instead, as a *Play* button that becomes *Pause*. Use one way or the other, not both: a name that changes and `aria-pressed` together report the state twice.
- On a checkout page, the delivery options *Standard* and *Next day* are cards. Build them as a `RadioGroup` with a `RadioGroupItem` and a `Label` in each card, so the chosen card is checked in code. Reaching them by keyboard is KBD-001.
- In a list of options with `role="listbox"`, put `aria-selected` on the chosen `role="option"` element. In a menu, a checkable item is `menuitemcheckbox` or `menuitemradio` with `aria-checked`.
- In shadcn's `Command`, `aria-selected` marks the option under the cursor, not the chosen value. In a combobox with one choice, the trigger's text names the chosen value; if the open list also marks it with a check, give that option its own state, such as `aria-checked`, or hidden text. In a list where several values can be chosen, every chosen option needs that state.
- The button *Show filters* carries `aria-expanded={open}`, and the value changes every time the panel opens or closes.
- A control that is off is off in code: `disabled`, or `aria-disabled="true"` with a guard that ignores the press. When a control may be off at all is ACT-004, ACT-005 and STA-005b.
- Our own advice: style the state from the attribute, as in `aria-pressed:bg-accent` or `data-[state=on]:bg-accent`, so the look cannot drift from the code.
- Our own advice: use a native element where one exists, such as a checkbox or a `button` with `aria-expanded`, and ARIA only when there is none.

## Don't

- Draw *Bold* as on with `className={bold ? "bg-accent" : ""}` on a plain `Button` and leave `aria-pressed` out.
- Build the delivery cards as `<Card onClick>` with `border-primary` on the chosen one and no checked state.
- Rotate the chevron on *Show filters* and never set `aria-expanded`, or set it on first render and never update it.
- Fade a button with `opacity-50 pointer-events-none` while it is still enabled in code, so Enter runs it and a screen reader calls it an ordinary button.
- Put `aria-disabled="true"` on a control that still looks usable and still does its job when pressed.
- Hard-code `aria-pressed={true}`, or put `aria-selected` on the `li` around a button instead of on the element with the role.

## Exceptions

- **Focus.** Focus is a state too, but the browser sets it. Its visible look is KBD-001.
- **The visible side.** How a state looks is VIS-003a (more than colour), VIS-004 (3:1) and VIS-008b (a lasting state kept visible under hover, focus and press).
- **Narrower rules come first.** The current page in a menu is NAV-002a, which uses `aria-current`, never `aria-selected`, on a link. The sort order of a column sits on its header cell as `aria-sort`, not on the sort button, as TBL-002 says.
- **Neighbouring rules.** A control's role is ACT-009, its name ACT-001b and FRM-010. That a choice control only records the choice is FRM-012b.
