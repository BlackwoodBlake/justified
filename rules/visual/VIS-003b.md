---
id: VIS-003b
title: Make a link in running text stand out from the words around it by more than colour
short: Links in text
area: visual
status: proposed
version: "1.0.0"
verdict: requirement
judges: { spoken: 2, agreeing: 2 }
law:
  - criterion: "1.4.1"
    name: Use of Color
    url: https://www.w3.org/TR/WCAG22/#use-of-color
    relation: requires
  - criterion: "1.4.3"
    name: Contrast (Minimum)
    url: https://www.w3.org/TR/WCAG22/#contrast-minimum
    relation: supports
stances:
  material: { stance: silent }
  apple:    { stance: supports, sources: [apple-color] }
  carbon:   { stance: supports, sources: [carbon-link, carbon-link-accessibility] }
  govuk:    { stance: supports, sources: [govuk-links] }
  nngroup:  { stance: supports, sources: [nngroup-guidelines-for-visualizing-links] }
conflicts_checked: 2026-11-25
check: lint
how_to_check:
  - 'An `<a>` or router `Link` inside a `<p>`, `FormDescription`, `AlertDescription`, `DialogDescription` or a table cell beside plain text, with no `underline` or other cue beyond colour, such as `font-semibold`. Leave alone links styled as buttons, lists of links (see Exceptions) and `prose` text that underlines links.'
  - 'A link in running text with `hover:underline` or `focus:underline` but no `underline` at rest, or with `no-underline`.'
  - 'The `a` mapping passed to an MDX or Markdown renderer (such as `components={{ a: ... }}`) that does not add `underline`.'
changelog:
  - version: "1.0.0"
    date: 2026-11-25
    note: First version.
---

## Rule

A link in running text stands out from the words around it at rest, not only on hover or focus: by a cue that is not colour, such as an underline, or by 3:1 lightness against the surrounding text. Justified's tokens close the 3:1 route, so a cue is needed; our own choice is an underline.

## Why

A link that differs from its sentence only by hue is invisible to many people who see colours differently, and hard to find for anyone on a dim or glaring screen. They read past it and never learn it was there. [WCAG 2.2, 1.4.1 Use of Color](https://www.w3.org/TR/WCAG22/#use-of-color) covers it, because "this word is a link" is information. The Working Group's failure [F73](https://www.w3.org/WAI/WCAG22/Techniques/failures/F73) fails a link in text that only its colour sets apart, even if an underline appears on hover or focus, since nobody hovers over words they cannot find. Its technique [G183](https://www.w3.org/WAI/WCAG22/Techniques/general/G183) shows the other route: 3:1 in lightness between the link and the text around it, while each still reaches 4.5:1 against the page under [1.4.3 Contrast (Minimum)](https://www.w3.org/TR/WCAG22/#contrast-minimum). In Justified that route is closed. `primary`, the link colour, measures about 2.2:1 against `foreground` in the light theme and 2.1:1 in the dark one, and even less against `muted-foreground`. We measure in both themes, as VIS-001 explains. So a link in Justified's body text meets the criterion only with a cue that is not colour, and the underline is the plain one.

## Do

- Underline every link in a sentence or paragraph. On a course platform's lesson page, "Download the worksheet for this lesson" sits in a paragraph as `<a className="text-primary underline underline-offset-4">`. Justified's `Button variant="link"` already has the underline.
- Underline links in help text as well. Under the field *Display name* on a learner's settings page, the `text-muted-foreground` line "Shown on certificates. Read how we use your name." has its last sentence as an underlined link.
- Put the underline in the shared mapping when Markdown or MDX renders the content, so every link in an article gets it, and not in each page by hand.
- Give a Next.js or React Router `Link` inside text the same classes as any other link in text. The router does not add an underline.
- Use a bottom border or a thicker underline if the design wants one, as long as it is visible at rest and is not only a change of colour.
- Add a change on hover and focus, such as `hover:decoration-2`, as an extra. A link that already stands out at rest does not need it to meet the criterion, but it helps people see what they are about to press.
- A product with its own link colour that differs from its text by 3:1 or more in lightness, with both at 4.5:1 on the page, meets the criterion without an underline. We still recommend one, because an underline does not depend on how well someone sees lightness. This is our own advice.
- Bold also passes the criterion, as weight is not colour. We prefer the underline, since bold is also used for emphasis; our own choice.

## Don't

- Style a link in a paragraph, a `FormDescription`, an `AlertDescription` or a dialog's text with `text-primary` alone. Tailwind's base styles remove the underline from every `a`, so a bare link in text has none.
- Use `text-primary hover:underline` in running text. The underline appears only for people who already found the link.
- Copy `no-underline` from a navigation pattern into an article.
- Rely on the focus ring (KBD-001) to show that a word is a link. It shows where focus is, not what is a link at rest.

## Exceptions

- **Links the setting shows.** A menu, a footer list, a table of contents, a list where every item is a link, or a card that is a link as a whole need no underline, though one is allowed. What a current-page marker in a menu needs is NAV-002b. A link that sits in the middle of other words, such as in a table cell next to plain text, counts as running text.
- **Visited links.** A visited link may differ from an unvisited one by colour alone. Each colour still needs 4.5:1 against the page (VIS-001).
- **Links styled as buttons.** A link drawn as a button is a button to the eye and is outside this rule.
- **Neighbouring rules.** What a link says is TXT-003. Colour as the only sign elsewhere is VIS-003a, the wider rule; this narrower one comes first for links in text.
