---
# Review of one rule. Written by a review agent that wrote neither the
# analysis nor the rule. Save it as .analysis/<RULE-ID>.review.md.
# Never commit it.
rule: ACT-000
rule_version: "1.0.0"
reviewed_on: 2026-11-21
result: changes-required     # approved | changes-required
---

## Checks

- [ ] `npm run similarity` passes for the rule
- [ ] `npm run similarity -- --rules .analysis` passes for the analysis
- [ ] `npm run check` passes
- [ ] Every link works and points to the current official page
- [ ] Every stance is backed by the excerpt it cites in `.sources-cache/`
- [ ] The text follows `WRITING.md` and `CONTENT.md`
- [ ] No conflict with a published rule, or the conflict is resolved
- [ ] Examples and Do/Don't cases are our own, not adapted from a source

## Changes required

One line per change, with the field or line it concerns.
