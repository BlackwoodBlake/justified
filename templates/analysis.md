---
# Analysis of one rule. Written by the analysing agent, read by the writing
# agent. Save it as .analysis/<RULE-ID>.md. Never commit it.
#
# Write everything in your own words. No quotes, no source headings, no
# source examples. Run the similarity check on .analysis/ before handing over.
rule: ACT-000
claim: One sentence stating what the rule asks for.
read_on: 2026-11-21
stances:
  # One entry per judge and witness, also when the source is silent.
  - source: carbon-button     # id in sources/sources.yaml; null when silent
    system: carbon
    stance: partial           # supports | opposes | partial | silent
    scope: Where the stance holds, for example "dialogs only".
    alternative: null         # the source's own position when it opposes, for a reverse trial
    anchor: null              # section link on the page, for example "#alignment"
    confidence: high          # high | medium | low
    platform_note: null       # Apple: say when web differs from Apple's platforms
  - source: null
    system: material
    stance: silent
    scope: null
    alternative: null
    anchor: null
    confidence: high
    platform_note: null
  # apple, govuk, nngroup ...
law:
  - criterion: "0.0.0"
    name: Criterion name
    relation: supports        # requires | supports
synthesis: Where the judges meet and where they part, in one or two sentences.
suggested_scope: How to narrow the rule so that no judge is partial.
suggested_verdict: unanimous (3 of 3) if narrowed; split otherwise
conflicts: []                 # ids of published rules this one may clash with
---

## Notes for the writer

Anything the writer needs that does not fit above, in your own words:
which situations the rule must cover, edge cases the sources disagree on,
and what the rule must not say.
