# Justified by Blackwood & Blake

An open design system on top of shadcn. Behaviour rules come first; components and adapters follow. The site will be published at blackwoodblake.com/design-system.

## Read first

- `WRITING.md`: how rule texts are written from sources. Required before writing or changing any rule.
- `CONTENT.md`: what we may claim and how the project is presented. Required before writing any text on the site, in the README or in release notes.
- Maintainer notes kept outside this repository, if you have them. Read them, but never copy their content into this repository, not as files, excerpts or quotes. Write what is needed here in your own words.

## The court method

Each rule is tried like a case:

- **The law** is WCAG 2.2 Level AA. We interpret it and never claim to extend it.
- **The judges** are Material, Apple and Carbon. Their stances decide the verdict.
- **The expert witnesses** are GOV.UK and NN/g. They inform the verdict but do not vote.

Verdicts are exactly: Requirement, Unanimous, Majority, Split, Insufficient evidence. Always show how many judges spoke, for example "Unanimous (2 of 2)". The court is a way of working, never a visual style.

Each published text is a rule or a guideline. A rule is decided by the law or the judges (Requirement, Unanimous, Majority). A guideline is our own choice (Split, or Insufficient evidence with at least one supporting source) and is always shown as that. The level follows from the verdict (`scripts/level.ts`) and is never set by hand.

Only the judges decide the verdict; a witness who disagrees is shown as a dissenting opinion. Never set a verdict by hand: `npm run check` (`scripts/check-rules.ts`) works it out from the stances and checks `sources/sources.yaml` and every rule's frontmatter.

## What each agent hands over

The analysing, writing and review agents each leave fixed files, described in `WRITING.md` with templates in `templates/`. The source register and the rules are committed. Excerpts (`.sources-cache/`), analyses and review reports (`.analysis/`) describe what sources say and are never committed.

## No copied source text

- Never copy or lightly rework a sentence from a source, and never follow a source's structure, headings, order, images or examples.
- A rule page shows our own rule, the verdict and each source's stance as a mark and a link. It never reproduces or summarises what a source says.
- Source excerpts go only in `.sources-cache/`, which is never committed.
- `npm run similarity` must pass for every text that draws on sources, `npm run similarity -- --rules .analysis` for every analysis, and `npm run similarity -- --rules examples/rules` for the live examples. Exit code 0 = clean, 1 = overlap found, 2 = setup error.

## Repository

- English, sentence case, plain words.
- npm workspaces: `packages/tokens`, `packages/patterns`, `adapters/shadcn` and `examples` (Storybook). `rules/` holds the rules, one folder per area, `sources/sources.yaml` the pages they rest on, and `adapters/agents/` builds the agent files from the rules.
- Run `npm ci` once. `npm test` checks token contrast in both themes; change a colour only if it still passes.
- The website is not in this repository. It lives in a separate private repository, is built on these packages and is published at blackwoodblake.com/design-system. Nothing here may depend on the website.
- `packages/tokens`, `packages/patterns` and `adapters/agents` are published to npm. `adapters/shadcn` and `examples` stay `"private": true`. To release: bump the version in a pull request (and the package's README if what it holds changed), merge it, then the maintainer runs the Publish workflow (`.github/workflows/publish.yml`), which stages every version not on npm yet with trusted publishing and provenance. A staged version goes live only when the maintainer approves it on npmjs.com with two-factor authentication. Never publish from a local machine.
- Never claim "compliant", "certified", "approved" or "guarantees" (see `CONTENT.md`).
- The repository is public. `npm run check` includes `scripts/check-public.ts`, which fails on absolute paths, pointers to notes outside the repository, Swedish text, private email addresses and private working words. Fix the line; allow it in `scripts/public-allow.txt` only with a reason.
- Ask the maintainer before pushing, publishing to npm or deploying.

## Changes go through pull requests

`main` only takes changes through a pull request, and the `check` job in `.github/workflows/check.yml` must pass. No approval is needed, so a pull request merges by itself once the check is green:

1. Create a branch from an up-to-date `main`, commit, and run `npm run check` locally.
2. Once the maintainer has said yes to pushing, push the branch and open a pull request with `gh pr create --fill`.
3. Run `gh pr merge --auto --squash --delete-branch`. GitHub merges it when the check passes.
4. If the check fails, fix it on the same branch and push again. Never push to `main` directly.

Pull requests from people outside the project are closed with a pointer to `CONTRIBUTING.md`.
