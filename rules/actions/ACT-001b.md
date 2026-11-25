---
id: ACT-001b
title: Give every button an accessible name that says what it does and contains its visible text
short: Button names
area: actions
status: decided
version: "1.0.1"
verdict: requirement
judges: { spoken: 1, agreeing: 1 }
law:
  - criterion: "1.1.1"
    name: Non-text Content
    url: https://www.w3.org/TR/WCAG22/#non-text-content
    relation: requires
  - criterion: "2.5.3"
    name: Label in Name
    url: https://www.w3.org/TR/WCAG22/#label-in-name
    relation: requires
  - criterion: "4.1.2"
    name: Name, Role, Value
    url: https://www.w3.org/TR/WCAG22/#name-role-value
    relation: requires
stances:
  material: { stance: supports, sources: [material-accessibility-elements, material-buttons-accessibility] }
  apple:    { stance: silent }
  carbon:   { stance: silent }
  govuk:    { stance: silent }
  nngroup:  { stance: silent }
conflicts_checked: 2026-11-21
check: lint
how_to_check:
  - 'A `Button size="icon"`, or a `button` whose only child is an icon such as a lucide-react component, with no `aria-label`, `aria-labelledby` or `title` and no visually hidden text such as `<span className="sr-only">` inside it.'
  - 'A button with visible text and an `aria-label` that does not contain that text in the same order, such as `aria-label="Go to payment"` on a button showing "Continue". Leave alone text that stands for a function, such as "A+" (see Exceptions).'
  - 'An icon button named after its picture, such as "Gear", "Bin" or "Three dots", or with the role in its name, such as "Remove attachment button", instead of what pressing it does.'
  - 'An icon button whose only name comes from a wrapping `Tooltip` or its `TooltipContent`, with nothing set on the button itself.'
  - 'An icon beside visible text that carries its own `aria-label` or `<title>` and has no `aria-hidden="true"`, so its words join the button''s name.'
changelog:
  - version: "1.0.1"
    date: 2026-11-21
    note: Examples in English.
  - version: "1.0.0"
    date: 2026-11-21
    note: First version.
---

## Rule

Give a button that shows no text an accessible name that says what pressing it does, not what its icon pictures. Give a button that shows text an accessible name that contains the visible words in the same order; case and punctuation may differ. Starting the name with the visible text is our advice, not a requirement.

## Why

A screen reader reads the name, not the picture. An icon of a bin, a gear or three dots means nothing unless the name says what happens: "Remove attachment" tells the person what they are about to do, while "Bin" only describes a drawing. People who use speech control do the opposite. They say the word they see on the screen, and the button only answers if its name contains that word. A name that differs from the visible text breaks this, which often happens when an `aria-label` replaces the text on screen.

These are requirements. [WCAG 2.2, 1.1.1 Non-text Content](https://www.w3.org/TR/WCAG22/#non-text-content) asks that a control shown without text gets a name telling what it is for. [2.5.3 Label in Name](https://www.w3.org/TR/WCAG22/#label-in-name) asks that a control whose label includes text has that text in its name. Case and most punctuation do not count. [4.1.2 Name, Role, Value](https://www.w3.org/TR/WCAG22/#name-role-value) asks that every button has a name that software can read. Putting the visible text first is advice: it makes speech commands and the screen reader's version match from the first word.

## Do

- An icon button with a bin on an attachment row has the name "Remove attachment".
- An icon button with three dots on a project card has the name "More actions for Spring Fair".
- A button that shows *Archive* on each row of an invoice list has the name "Archive Invoice 1042". The visible word comes first, and the name adds the row.
- A button that shows *Try again* after a failed upload keeps that text as its name, or starts with it: "Try again, upload contract.pdf".
- A button that shows the letters *A+* to make the text larger has the name "Larger text", because the letters stand for a function, not a word.
- In shadcn, give an icon-only `Button` an `aria-label`, or put the name in a visually hidden `span` inside it. Leave the visible text as the name for a button that has one.

## Don't

- Name an icon button after its picture, such as "Gear" for a button that opens account settings.
- Leave an icon button with no name, so a screen reader says only "button".
- Give a button that shows *Continue* the `aria-label` "Go to payment", so the word on screen is not in the name and a speech command for it does nothing.
- Count on a tooltip to give the name. A tooltip may help sighted users, but whether it is read as the name depends on how it is built. Set the name on the button itself.
- Add the role to the name, such as "Remove attachment button". The screen reader already says it is a button.

## Exceptions

- **Text used as a symbol.** When the visible characters stand for a function rather than spell a word, such as *A+* or an *@* that is named "Mention a colleague", name the function. 2.5.3 does not treat such text as a label.
- **Decorative icons beside text.** An icon next to a visible word adds nothing to the name. Hide it from assistive technology, and let the word be the name.
