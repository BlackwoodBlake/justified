# Content rules

Rules for all text on the website, in the README, in articles and in
release notes. They apply to people and agents alike. `WRITING.md` covers
how rule texts are written from sources; this file covers what we may
claim and how we present the project.

## Accessibility claims

Justified supports work toward WCAG 2.2 Level AA. It takes no
responsibility for whether a product is accessible or compliant.

- Say "helps you work toward WCAG 2.2 AA", "supports", "follows".
- Never say "compliant", "certified", "WCAG-approved", "guarantees" or
  "makes your app accessible" about Justified or about products built
  with it. This applies to headings, metadata, alt text, badges and
  social posts too.
- WCAG is the law book: we interpret it, we never claim to extend it.
  Always cite a criterion by number and name with a link, for example
  "WCAG 2.2, 3.3.1 Error Identification".
- The accessibility disclaimer (below) appears in full in the README and
  on the method page, and in short form on the start page, below the
  first screen.

```markdown
## Accessibility

Justified helps you build interfaces that work toward WCAG 2.2
Level AA. It does not make your product compliant on its own,
and it is not a certification. Compliance depends on how your
product is built and tested: content, colours, flows and the
components you use.

You remain responsible for testing your product and for any
accessibility statement your organisation must publish. Justified
is provided as is, without warranty, under its licences.
```

Short form: "Helps you work toward WCAG 2.2 AA. Not a certification."
with a link to the full text.

## Independence and trademarks

- The independence statement appears in the README, the site footer
  (short form) and the method page:

  > Justified is an independent project and has not been authorized,
  > sponsored, or otherwise approved by Apple Inc., Google, IBM, the UK
  > Government Digital Service, Nielsen Norman Group or W3C.

- Site footer trademark line: "Apple is a trademark of Apple Inc.,
  registered in the U.S. and other countries and regions." No ® or ™.
- Name sources only to refer to them. Write "Apple" and "Apple Human
  Interface Guidelines" in full; never "HIG" and never a possessive or
  plural of a trademark.
- No logos, icons or screenshots of any source. No imitation of their
  visual style.
- Never "Material-approved", "Apple-compatible" or anything that implies
  a partnership, even as a joke in a heading.
- NN/g links name the company and the article's author.

## The project's name

- Always "Justified by Blackwood & Blake" on first mention on a page and
  in titles and metadata. "Justified" alone is fine in running text after
  that.
- Never create domains, accounts or handles named only "justified".
- The name is a working name. Keep it in one place in the site config so
  it can change.

## Describing the method

- The process works like a court; the site does not look like one. Use
  the vocabulary in text, never in visual design.
- Fixed terms: the law (WCAG), the judges (Material, Apple, Carbon), the
  expert witnesses (GOV.UK, NN/g), verdict, reasons, dissenting opinion,
  appeal, precedent.
- Levels are exactly: rule and guideline. A rule is decided by the law
  or the judges. A guideline is our choice, where the judges are split
  or fewer than two have spoken; always say so, and never present a
  guideline as something the sources agree on.
- Count them apart: "40 rules and 6 guidelines", never "46 rules".
- Verdicts are exactly: Requirement, Unanimous, Majority, Split,
  Insufficient evidence. Always show how many judges spoke, for example
  "Unanimous (2 of 2)": how many agreed of those who spoke. Insufficient
  evidence counts the judges who spoke out of all three, for example
  "Insufficient evidence (1 of 3 judges spoke)".
- A rule page never reproduces or summarises what a source says. It
  shows our own rule, the verdict and each source's stance with a link.
- Never claim the sources agree more than the verdict table shows.
- State plainly that no sponsor, donor or client can influence a verdict.

## Start page

- Understood in 5 seconds: headline, one sentence, the court in one row,
  one button. At most about 25 words before scrolling.
- Everything else goes below the first screen.

## Facts and numbers

- No number, date or claim about a source without a link to the current
  official page that supports it.
- No invented statistics, testimonials or user counts.
- Dates in ISO format (2026-11-19) in metadata; written out in prose.

## Voice

- English, sentence case, plain words, short sentences.
- Specific over impressive: "13 rules, each tested against 6 sources",
  not "the definitive design system".
- No hype words: revolutionary, ultimate, best-in-class, definitive.

## Before publishing

- [ ] No forbidden claim words (compliant, certified, approved,
      guarantees)
- [ ] Disclaimers present where required
- [ ] Every source link points to the current official page
- [ ] Trademarks written in full, no logos
- [ ] Similarity check passes (`scripts/similarity.ts`) for any text
      that draws on sources
