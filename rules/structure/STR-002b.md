---
id: STR-002b
title: Word each heading so it says what the part below it holds
short: Headings that describe
area: structure
status: proposed
version: "1.0.0"
verdict: requirement
judges: { spoken: 2, agreeing: 2 }
law:
  - criterion: "2.4.6"
    name: Headings and Labels
    url: https://www.w3.org/TR/WCAG22/#headings-and-labels
    relation: requires
stances:
  material: { stance: supports, sources: [material-accessibility-structure] }
  apple:    { stance: supports, sources: [apple-voiceover] }
  carbon:   { stance: silent }
  govuk:    { stance: supports, sources: [govuk-writing-for-user-interfaces] }
  nngroup:  { stance: supports, sources: [nngroup-microcontent-headlines-page-titles] }
conflicts_checked: 2026-11-25
check: review
how_to_check:
  - 'Read the view''s headings as a list, without the content below them. Does each say what its part holds or is for, or would it fit any part of any page, such as "Details", "Info" or "Section 2"? One word that names the part, such as "Members", is fine.'
  - 'The same heading text on every card in a grid or every section of a view, such as each `CardTitle` reading "Details".'
  - 'A heading that is only a number or a clever line, such as "Section 1" or "The fun part", over content it does not name.'
  - 'A `DialogTitle` or `SheetTitle` whose words do not say what the dialog is for, such as "Dialog" or "Details".'
changelog:
  - version: "1.0.0"
    date: 2026-11-25
    note: First version.
---

## Rule

Word every heading so it says what the part below it holds or is for. A heading that would fit any part of any page, such as "Details" or "Section 2", does not.

## Why

People rarely read a page from the top. A sighted person scans the headings for the part they need, and a screen reader user often hears the headings as a list, each one without the content under it. A heading that names its part lets both decide at once whether to stop there. Three cards headed *Details*, *Info* and *Misc* make them open each one to find out.

This is a requirement. [WCAG 2.2, 2.4.6 Headings and Labels](https://www.w3.org/TR/WCAG22/#headings-and-labels) asks that headings describe their topic or purpose. It does not ask that a page have headings, and it does not decide whether text is marked as a heading; that is STR-002a. A short heading is fine. One word can describe its part well.

## Do

- In the project tool *Ridgeway*, the sections of *Project settings* are *Members*, *Billing address* and *Delete project*. Each names what is under it.
- On a project page, the three cards are headed *Dates*, *Owner* and *Tags*, after what each one holds.
- When a heading must stay short on screen but is vague out of context, add words for assistive technology inside it with a visually hidden `span`: the visible *Activity* is read as "Activity in Spring launch".
- Our own choice: put the word that tells parts apart first, so a list of headings can be scanned by its first words.
- The visible heading of a dialog says what the dialog is for, such as *Invite a member*. Its words are this rule; that it is a heading is STR-002a.

## Don't

- Head the list of people in a project with *Overview* when *Members* names it.
- Number sections, *Section 1*, *Section 2*, with nothing else in the heading.
- Head every card in a grid with the same word, so the list of headings repeats one word ten times.
- Use a clever line as a heading, such as *The fun part*, over the project's billing details.

## Exceptions

- **Not covered here.** Whether text is a heading in code is STR-002a, and its level is STR-003. Labels of form controls follow FRM-001 and FRM-010, and link text follows TXT-003.
