---
# Save as rules/<area>/<RULE-ID>.md. scripts/check-rules.ts checks every
# field and works out the verdict from the stances; never set it by hand.
id: ACT-000
title: Sentence case, says what to do
short: Two to four words      # for menus such as Storybook's; 30 characters at most, unique
area: actions                # actions | dialogs | destructive | feedback | forms | keyboard | layout | navigation | states | structure | tables | text | visual
status: proposed             # proposed | decided | stable
version: "1.0.0"
verdict: unanimous           # requirement | unanimous | majority | split | insufficient-evidence
judges: { spoken: 3, agreeing: 3 }
law:                         # [] when no criterion applies
  - criterion: "0.0.0"
    name: Criterion name
    url: https://www.w3.org/TR/WCAG22/#criterion-anchor
    relation: supports       # requires | supports
stances:                     # every judge and witness; silent when the source does not address the rule
  material: { stance: supports, sources: [material-page] }
  apple:    { stance: supports, sources: [apple-page] }
  carbon:   { stance: supports, sources: [carbon-page] }
  govuk:    { stance: silent }
  nngroup:  { stance: silent }
conflicts_checked: 2026-11-21
check: review                # lint | runtime | review | manual: how a break is found (see WRITING.md)
how_to_check:                # 1 to 5 things to look for, 50 words each at most; never stricter or looser than the rule
  - What in the code, or on the running page, shows that the rule may be broken.
changelog:
  - version: "1.0.0"
    date: 2026-11-21
    note: First version.
---

<!--
The page shows our rule, the verdict and each source's stance as a mark
and a link. It never reproduces or summarises what a source says.
Write in English, sentence case, plain words. Every example is in English.
-->

## Rule

One to three short sentences, 60 words at most, that a person or an agent can follow without interpretation.

## Why

What the rule protects, in our own words. One short paragraph.

## Do

- An example of our own that follows the rule.

## Don't

- An example of our own that breaks it.

## Exceptions

When the rule does not apply, if ever.
