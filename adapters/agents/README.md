# @blackwoodblake/justified-agents

The behaviour rules of Justified by Blackwood & Blake as instructions for AI coding agents: a skill for Claude Code, a second skill that reviews code against the rules, and an `AGENTS.md` for any agent that reads an instructions file. With them, an agent builds and reviews interface code by the rules and names each one by its id, such as FRM-002a.

## Install

```sh
npm install --save-dev @blackwoodblake/justified-agents
```

The package holds files only, no code.

| File | For |
| --- | --- |
| `dist/skills/justified/` | Claude Code: `SKILL.md`, one line per rule, with every full rule in `rules/` |
| `dist/skills/justified-review/` | Claude Code: a review of changed code against every rule, with `checks/<area>.md` and every full rule |
| `dist/AGENTS.md` | Any agent that reads an instructions file |
| `dist/AGENTS-full.md` | An agent that cannot open links: every rule in full, in one file |
| `dist/rules/<id>.md` | One full rule per file: Why, Do, Don't and Exceptions |

The skill's `SKILL.md` has one line per rule: its id, short name and the rule in brief. Before the agent writes or reviews code that a line covers, it opens the full rule in `rules/<id>.md`. `AGENTS.md` gives every rule as one full sentence.

## Use

Copy the skill into your project, so Claude Code loads it when you work on interface code:

```sh
mkdir -p .claude/skills
cp -R node_modules/@blackwoodblake/justified-agents/dist/skills/justified .claude/skills/
cp -R node_modules/@blackwoodblake/justified-agents/dist/skills/justified-review .claude/skills/
```

## Review

With the review skill installed, run `/justified-review` in Claude Code. It reviews your uncommitted changes, or the current branch if there are none; name files, a folder or a branch to review those instead. The report lists each place that may break a rule, by file, line and rule id, with the verdict, what is wrong, how to fix it and a link to the rule. What it can only see in a running app it lists for you to check there.

A review finds some problems, not all. "No problems found against Justified's rules" does not mean a product is accessible; test with real people and assistive technology. Each full rule also ends with *How to check*: what to look for in code.

For another agent, copy `dist/AGENTS.md` to where it looks for instructions, for example `AGENTS.md` in the project root.

Commit the copied files, so everyone on the project, and their agents, gets the same rules. To update, update the package and copy again. The full guide, with prompts for building and reviewing, is [Use with an AI agent](https://blackwoodblake.com/design-system/get-started/ai-agents/).

The files tell the agent how firmly to hold each text. A rule is followed. A guideline, which is our own choice, gives way to a convention your project already has. When you ask for something a rule advises against, the agent does what you ask and says which rule it departs from.

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

## Licence

The rule texts are licensed under [CC BY 4.0](LICENSE-docs): credit "Justified by Blackwood & Blake" with a link to [blackwoodblake.com/design-system](https://blackwoodblake.com/design-system/). The build script is licensed under [MIT](LICENSE). Developed at [github.com/blackwoodblake/justified](https://github.com/blackwoodblake/justified).
