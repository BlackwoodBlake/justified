# Justified by Blackwood & Blake

[![check](https://github.com/blackwoodblake/justified/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/blackwoodblake/justified/actions/workflows/check.yml)

An open design system on top of shadcn that starts with behaviour rules, each one tested against WCAG 2.2 and weighed by established design systems.

**Website:** [blackwoodblake.com/design-system](https://blackwoodblake.com/design-system/), with every rule, its verdict and live Do and Don't examples.

## Why behaviour rules

shadcn and Radix give you well-built parts: a dialog that traps focus, a button with the right role. They do not decide how the parts should behave in your product: whether a send button may be disabled, which button goes last in a dialog, when an error appears. Those decisions are where interfaces, and AI coding agents, most often go wrong. Justified writes them down as short rules with ids, such as FRM-002a, so people and agents can build and review by them.

## How a rule is decided

Each rule is tried like a case:

- **The law** is WCAG 2.2 Level AA. We interpret it and never claim to extend it.
- **The judges** are Material, the Apple Human Interface Guidelines and Carbon. Their stances decide the verdict.
- **The expert witnesses** are GOV.UK and Nielsen Norman Group. They inform the verdict but do not vote.

The verdict is Requirement, Unanimous, Majority, Split or Insufficient evidence, always with how many judges spoke, for example "Unanimous (3 of 3)". A text decided by the law or the judges is a rule. Where the judges are split or too few have spoken, the text is a guideline: our own choice, always shown as that. Every stance links to the page it rests on, and `npm run check` works the verdict out from the stances, so it is never set by hand.

## Use it

- **With shadcn:** add the theme and components from the registry, for example `npx shadcn@latest add https://blackwoodblake.com/design-system/r/justified-theme.json`. See [Use with shadcn](https://blackwoodblake.com/design-system/get-started/shadcn/).
- **With an AI coding agent:** add the Claude Code skill or `AGENTS.md`. See [Use with an AI agent](https://blackwoodblake.com/design-system/get-started/ai-agents/).
- **From npm:** `npm install @blackwoodblake/justified-tokens` for the theme as CSS variables, `@blackwoodblake/justified-patterns` for the rules as data and `@blackwoodblake/justified-agents` for the agent files.
- **As data:** every rule is in [rules.json](https://blackwoodblake.com/design-system/patterns/rules.json) and in [llms.txt](https://blackwoodblake.com/design-system/llms.txt).

## Accessibility

Justified helps you build interfaces that work toward WCAG 2.2
Level AA. It does not make your product compliant on its own,
and it is not a certification. Compliance depends on how your
product is built and tested: content, colours, flows and the
components you use.

You remain responsible for testing your product and for any
accessibility statement your organisation must publish. Justified
is provided as is, without warranty, under its licences.

## Independence

> Justified is an independent project and has not been authorized,
> sponsored, or otherwise approved by Apple Inc., Google, IBM, the UK
> Government Digital Service, Nielsen Norman Group or W3C.

## Contributing

Justified is open source, but it does not accept pull requests. Issues are welcome, especially objections to a verdict. See [CONTRIBUTING.md](CONTRIBUTING.md).

## What is in the repository

| Path | What it is |
| --- | --- |
| `rules/` | One Markdown file per rule, with its verdict and source stances |
| `sources/sources.yaml` | Every source page a stance links to, with the date it was read |
| `packages/patterns` | `@blackwoodblake/justified-patterns`: the rules as data |
| `packages/tokens` | `@blackwoodblake/justified-tokens`: colour and radius tokens, checked for contrast |
| `adapters/shadcn` | `@blackwoodblake/justified-shadcn`: reference components for shadcn apps |
| `adapters/agents` | `@blackwoodblake/justified-agents`: the rules as a Claude Code skill and an AGENTS.md |
| `examples` | Storybook with Do and Don't stories, and the live examples on the rule pages |
| `scripts/` | The checks: verdicts from stances (`check-rules.ts`), copied wording (`similarity.ts`) and private text that must not be published (`check-public.ts`) |
| `WRITING.md`, `CONTENT.md` | How rule texts are written from sources, and what we may claim |

`justified-tokens`, `justified-patterns` and `justified-agents` are published on npm under the `@blackwoodblake` scope, each with its own README. `justified-shadcn` is not published: add its components with the shadcn CLI instead.

## Building locally

You need Node.js 22.22 or later.

```sh
npm ci
npm run check            # source register, rule frontmatter and nothing private in tracked files
npm test                 # token contrast in light and dark themes
npm run build            # rules to packages/patterns/dist/rules.json
npm run storybook        # the workshop on http://localhost:6006
```

## Licence

Code is licensed under the [MIT License](LICENSE). Documentation and rule texts are licensed under [CC BY 4.0](LICENSE-docs).
