---
id: STR-006a
title: Mark text in another language than the text around it with its own lang attribute
short: Language of parts
area: structure
status: proposed
version: "1.0.0"
verdict: requirement
judges: { spoken: 0, agreeing: 0 }
law:
  - criterion: "3.1.2"
    name: Language of Parts
    url: https://www.w3.org/TR/WCAG22/#language-of-parts
    relation: requires
  - criterion: "3.1.1"
    name: Language of Page
    url: https://www.w3.org/TR/WCAG22/#language-of-page
    relation: supports
stances:
  material: { stance: silent }
  apple:    { stance: silent }
  carbon:   { stance: silent }
  govuk:    { stance: supports, sources: [govuk-language-navigation] }
  nngroup:  { stance: silent }
conflicts_checked: 2026-11-26
check: lint
how_to_check:
  - 'A language picker built from a list such as `{ code, label }` whose `DropdownMenuItem`, `SelectItem`, `CommandItem` or link renders `label` with no `lang` taken from the entry''s code, while the labels are written in their own languages.'
  - 'Content that can be shown in another language than the page''s, rendered with no `lang` from the language its data records: fallback text shown when a translation is missing, user content in mixed languages, or a translation shown beside its original.'
  - 'A `lang` value that is not a valid language tag, such as `en_US` or `cn`.'
  - 'A `lang` set only on a section wrapper whose menus or dialogs render in a portal outside it, while that portalled content is in the wrapper''s language and has no `lang` of its own.'
changelog:
  - version: "1.0.0"
    date: 2026-11-26
    note: First version.
---

## Rule

When a passage, phrase or word is in another language than the text around it, put `lang` with that language's tag on the element that holds it, such as language picker entries written in their own languages. Proper names, technical terms, words of unclear language and words the surrounding language has taken in need none.

## Why

A screen reader reads everything in the page's language unless the code says otherwise. In an English page, an unmarked "Português" is read with English sounds, and a quoted paragraph in Spanish comes out as a string of wrong syllables. The person may not even notice that the language changed, only that the text makes no sense. Browsers use the same marking to choose glyphs: Chinese, Japanese and Korean characters take different shapes depending on the declared language.

This is a requirement. [WCAG 2.2, 3.1.2 Language of Parts](https://www.w3.org/TR/WCAG22/#language-of-parts) asks that software can tell the language of each passage or phrase, with the four exceptions this rule names ([Understanding 3.1.2](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html)). The Working Group's technique is `lang` on the element whose content is in the other language, with a valid tag ([H58](https://www.w3.org/WAI/WCAG22/Techniques/html/H58)). Text with no marking takes its language from the elements around it and, in the end, from `html` (STR-006), so a page in one language meets this rule with no extra work. *Café* on an English menu is English, and so is *déjà vu* in an English review; only a deliberate switch to French is marked.

## Do

- The booking app *Larkspur* is in English and offers Polish, Portuguese and Korean. Its language picker is a shadcn `DropdownMenu` built from `{ code, label }` entries. Each `DropdownMenuItem` reads *Polski*, *Português* or *한국어* and has `lang={code}`. Where an item is a link to that language's version, it also has `hreflang={code}`.
- Mark the current language's entry and the picker's trigger too, whenever they show a language name that is not the page's own. In the English view, *English* needs nothing; in the Polish view, it gets `lang="en"`.
- When the whole label is in that language, put `lang` on the element that holds it, such as the `a` or the `DropdownMenuItem`, not on a `span` inside it. A screen reader that reads a control's name may lose a language change inside it.
- In an item that mixes two languages, such as *Polski (Polish)* in an English page, mark only the part that differs: `<span lang="pl">Polski</span> (Polish)`. A label in one language is simpler.
- On the page *Reviews*, a guest's review in Spanish sits in a `blockquote lang="es"`. An English phrase inside it switches back with its own `lang="en"`.
- When content comes from data that records its language, such as a product description shown in French because no English translation exists yet, put that language on the element that shows it. If the language is not known, do not guess; leave the text unmarked.
- When a part is marked with `lang` and its menus or dialogs render in a portal, put `lang` on the portalled content as well, or on the text itself.
- Our own advice, not part of 3.1.2: write each entry in the language picker in its own language, *Polski* and not *Polish*, so a person who cannot read the current interface still finds theirs. Also our own advice: a flag may sit beside the name, never replace it. A flag that carries meaning needs a text alternative (STR-005).
- Our own advice: keep an `aria-label` in the same language as its element. Its text cannot carry a language of its own, so a name in another language goes in visible text marked with `lang`.
- Our own advice: mark a name or borrowed word when a screen reader would mangle it badly, especially one from another writing system.

## Don't

- Render the picker's entries *Polski*, *Português* and *한국어* in an English page with no `lang` on any of them.
- Rely on `hreflang` alone. It names the language of the page the link leads to, not of the link's own text.
- Use a country code as a language: `se` for Swedish, `uk` for British English or `cn` for Chinese. Swedish is `sv`, British English is `en-GB` and Chinese is `zh`.
- Show an untranslated French description in an English page without marking it.
- Wrap every brand name, product name or code identifier in a `lang` span.

## Exceptions

- **The four in the criterion.** Proper names of people, places, brands and products; technical terms; words whose language cannot be told; and words that have become part of the surrounding language, such as borrowed words found in its dictionaries.
- **The page's main language.** The language of the whole page is set on `html`, as STR-006 says.
- **Neighbouring rules.** The accessible name of a picker's trigger still contains its visible text (ACT-001b). A flag used as the only label needs a text alternative (STR-005). When the picker shows which language is current, say so in code too, for example with `aria-current` on that entry; NAV-002a covers the current page in navigation.
