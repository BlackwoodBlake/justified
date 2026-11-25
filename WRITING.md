# Writing rules

Every text in this repository is our own. These rules apply to everyone
who writes rule texts, people and agents alike. `CONTENT.md` covers what
we may claim on the website; this file covers how rules are written from
sources.

## Process
1. Read every source listed for the rule in a real browser (Material 3
   needs JavaScript): the law (WCAG), the judges (Material, Apple, Carbon)
   and the expert witnesses (GOV.UK, NN/g).
2. Record each source's stance in the rule's frontmatter and in
   `sources/sources.yaml` (URL, version, date read). Only the current
   official page counts: no older versions, previews or quotes elsewhere.
3. Close the sources. Write the rule from your own understanding of where
   they agree and disagree.
4. Write the examples and Do/Don't cases yourself. Never adapt a source's
   example. Examples are in English, like the rest of the rule: button
   labels, messages, field names and every other quoted UI text.
5. Run the similarity check, the rule check and the conflict check
   (compare with every published rule) before opening a pull request.

## Three agents
- The analysing agent reads the sources, saves excerpts to
  `.sources-cache/` and writes an analysis of stances.
- The writing agent sees only the analysis, never the source text, and
  writes the rule.
- A separate review agent, which wrote neither, checks the result.

## What each agent hands over

| Agent | Output | Path | Committed |
| --- | --- | --- | --- |
| Analysing | Source register entries | `sources/sources.yaml` | yes |
| Analysing | Source excerpts | `.sources-cache/<source-id>.md` | never |
| Analysing | Analysis | `.analysis/<RULE-ID>.md` | never |
| Writing | Rule | `rules/<area>/<RULE-ID>.md` | yes |
| Review | Review report | `.analysis/<RULE-ID>.review.md` | never |

Templates for each file are in `templates/`.

- **Source register.** One entry per source page, shared by every rule
  that cites it. NN/g entries name the article's author. Apple entries
  name the platform, so that a difference from the web can be noted.
- **Excerpts.** The passages the analysis relies on, word for word, one
  file per source page, named after its id in the register. They are
  other people's text and stay on the computer that made them.
- **Analysis.** The only thing the writing agent sees. One entry per
  judge and witness, also when a source is silent, with the stance, where
  it holds and the source's own position if it disagrees. Everything is in
  the analysing agent's own words, with no quotes. It describes what
  sources say, so it is never committed, and it passes the similarity
  check before it is handed over.
- **Rule.** Frontmatter holds everything a script can check: id, area,
  status, version, verdict, the WCAG criteria, every stance with the
  sources it cites, the date of the last conflict check and a changelog.
  It also holds a short name of two to four words for menus, for example
  "Visible label"; the rule's stories in Storybook use it in their title.
  The body holds the rule in one to three short sentences (60 words at
  most; `npm run check` warns above that). A rule that applies only in a
  certain situation opens with it, such as "When a navigation menu
  shows ..." or "In a dialog that ...", so a person or an agent can tell
  first whether the rule applies at all. The body goes on with why it
  matters, Do and Don't cases and exceptions.
- **How to check.** Two frontmatter fields say how to find a break of
  the rule. `how_to_check` lists one to five things to look for, such as
  `mode: "onChange"` in react-hook-form or a submit button with
  `disabled={!isValid}`. It is written from the rule, never from a
  source, and is neither stricter nor looser than the rule: a hit means
  the rule may be broken, and code that follows the rule never matches.
  `check` names the one layer that finds a break without false hits:
  - `lint`: the common break shows for certain in the code (JSX, class
    names, props, form settings).
  - `runtime`: it shows only when the page runs, such as where focus
    goes, what is announced or what the title becomes.
  - `review`: someone has to judge it, such as whether a heading says
    what its part holds.
  - `manual`: it takes a person or assistive technology, such as how a
    screen reader reads the page.
- **Review report.** Approved, or a list of changes, after the checks
  under *Check before merging*.

## Verdicts

A verdict is never set by hand. `scripts/check-rules.ts` works it out from
the stances and stops a rule whose frontmatter says something else.

- **Requirement:** a WCAG criterion requires the behaviour.
- Only the judges count. The expert witnesses are recorded and shown with
  the verdict, and a witness who disagrees is shown as a dissenting
  opinion, but witnesses do not change the verdict.
- **Insufficient evidence:** fewer than 2 judges have spoken. A silent
  judge is not a vote against. Such a text is published only as a
  guideline (see *Rules and guidelines*).
- **Unanimous:** every judge who spoke supports the rule.
- **Majority:** more judges support the rule than oppose it.
- **Split:** as many judges support it as oppose it. We choose and give
  our reasons.
- When more judges oppose the rule than support it, the rule is not
  published. Look for what the judges agree on instead and try that as a
  new rule.

## Rules and guidelines

The level is never set by hand either. `scripts/level.ts` works it out
from the verdict.

- **Rule:** the law or the judges decide. Requirement, Unanimous or
  Majority.
- **Guideline:** we decide. Split, or Insufficient evidence. A guideline
  is shown as our choice and never as a verdict of support.
- A guideline has an "Our reasons" section. One with Insufficient
  evidence also needs at least one judge or witness who supports it;
  nothing is published on our word alone.
- A Requirement's rule sentence holds only what the criterion requires.
  Anything we add is marked as our own, in the sentence or under Do.
- When a rule covers both something a criterion requires and something
  the judges decide, split it, so neither part borrows the other's
  verdict.
- When two apply, a Requirement comes before other rules, a narrower
  rule before a wider one, and any rule before a guideline. A guideline
  may never contradict a rule.

A stance can be "partial" in an analysis, but never in a rule. Narrow or
split the rule until each judge either supports or opposes it. Keep the
rule's purpose: narrowing it must not water it down until it says
nothing.

## Never
- Copy or lightly rework a sentence from a source.
- Follow a source's structure, headings or order.
- Use a source's images, illustrations or examples.
- Reproduce or summarise what a source says on the rule page. Stances
  belong in the verdict table, as a mark and a link.

## Allowed
- WCAG success criterion numbers and names, always with a link.
- Product and system names, to refer to a source. Apple is always
  "Apple", never "HIG".
- Common UI terms ("primary button", "toast").

## Check before merging
- Every source in the verdict table is linked, current and dated.
- The rule passes `npm run similarity`, and the analysis passes
  `npm run similarity -- --rules .analysis`.
- `npm run check` passes.
- No conflict with a published rule, or the conflict is resolved.
- The review agent has approved.
