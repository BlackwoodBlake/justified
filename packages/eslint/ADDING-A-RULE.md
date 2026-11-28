# Adding a lint rule

How to add one rule to `@blackwoodblake/justified-eslint`. Written so that several people or agents can each add a rule at the same time without editing the same lines. `justified/submit-stays-enabled` (ACT-004) and `justified/error-timing` (FRM-002b) are the patterns to copy.

## Before you write code

1. Read the rule file `rules/<area>/<ID>.md` in full: the rule sentence, Exceptions, `check` and `how_to_check`.
2. Base the lint rule on `how_to_check` and the rule sentence with its Exceptions. Never on the Do advice. The lint rule must be no stricter and no looser than the rule.
3. A lint rule belongs to exactly one id and tests only that id's own text. When the code also breaks a neighbouring rule, leave that report to the neighbour's lint rule or to the review, even where the rule file refers to it.
4. Report only what the code shows for certain. A wrong report costs more than a missed one. If a case needs judgement, or shows only when the page runs, leave it out and say so in the rule file's header comment. The `justified-review` skill covers what lint cannot.
5. Look at `examples/rules/<ID>.tsx`. Its Don't examples write the mistake out in the code, and the rule must catch each of them. A Don't that cannot be written out (the real code would change the page it is shown on) or that the rule leaves alone on purpose carries `notLinted` with the reason. Its Do examples must never be reported.

## The files you add

Each rule is two new files and one new line in the README.

| File | What |
| --- | --- |
| `rules/<name>.js` | The rule. The file name is the rule name: `rules/submit-stays-enabled.js` is `justified/submit-stays-enabled`. Use a readable name, in kebab-case with at least two words, never the id. |
| `test/rules/<name>.test.js` | Its tests. |
| `README.md` | One row in the *Rules* table: rule, id with a link, level (`Rule` or `Guideline`), what it flags. |

Then run:

```sh
npm run index --workspace packages/eslint
```

This writes `rules/index.js` from the files in `rules/`. Commit the result. Never edit `rules/index.js` by hand. If two branches both changed it, take either side and run the command again. For the README table, keep both rows, in id order.

## Do not edit

These files are shared. Leave them alone in a rule's branch, and propose a change to them on its own:

- `index.js`, `index.d.ts`, `package.json`
- everything in `lib/`: `define-rule.js`, `jsx.js` and the helpers that several rules share (`button-label-helpers.js`, `button-row-helpers.js`, `class-token-helpers.js`, `name-helpers.js`)
- `test/helpers.js`, `test/setup.js`, `test/shadcn.js`, `test/plugin.test.js`, `test/examples.test.js`, `test/example-map.js`
- `scripts/`, and anything outside `packages/eslint`

If you need a helper, write it in your rule file, or import one of the shared helpers in `lib/`. If it proves useful to several rules, it can move into `lib/` later.

## The rule file

```js
import { defineRule } from "../lib/define-rule.js";
import { attributeValue, elementName, getAttribute } from "../lib/jsx.js";

export default defineRule({
  id: "ACT-004",
  level: "guideline",          // from the verdict: Split or Insufficient evidence is a guideline
  verdict: "Split (1 of 2)",   // as the site shows it
  description: "What the rule flags, in one line.",
  messages: {
    someProblem: "what is wrong, in plain words. How to fix it, in one or two short sentences.",
  },
  create(context) {
    return { JSXOpeningElement(node) { /* ... */ } };
  },
});
```

- **Level and verdict.** Copy them from the rule file. `Requirement` stands alone. Insufficient evidence is written `Insufficient evidence (1 of 3 judges spoke)`. The others are `<Verdict> (<agreeing> of <spoken>)`, such as `Unanimous (2 of 2)`. The tests read the rule file and fail if these differ, so a later change of verdict shows up.
- **Messages.** `defineRule` puts `May break <ID> (<level>, <verdict>): ` before each message, and adds a line to a guideline's messages saying it is our choice. Write the rest in lower case after the colon: what is wrong, then how to fix it. Follow `CONTENT.md`: never "violates", "fails WCAG", "not accessible", "compliant" or "certified". Messages whose key starts with `suggest` are suggestion labels and get no prefix.
- **Fixes.** Add `fixable: "code"` only for a fix that is certainly safe and keeps the meaning. Otherwise offer a suggestion (`hasSuggestions: true`), or nothing.
- **Options.** Give options a `schema` and read them with a default in `create`. Keep them few.
- **Parsers.** Use only ESTree and JSX nodes, and `unwrap()` from `lib/jsx.js` around expressions, so TypeScript's `as`, `satisfies` and `!` do not hide a value. The rule must work with any parser that gives JSX nodes. Use `context.sourceCode`, not the older `context.getSourceCode()`.
- **Header comment.** Say what the rule flags, what it leaves out and why.

## The test file

```js
import rule from "../../rules/<name>.js";
import { run } from "../helpers.js";

run("<name>", rule, {
  valid: [/* code that follows the rule, including every Exception */],
  invalid: [{ code: "...", errors: [{ messageId: "someProblem" }] }],
});
```

- `run` parses every case as TSX and adds the shared shadcn code in `test/shadcn.js` to `valid`. If your rule reports that code, your rule is probably too strict. If the shared code really breaks your rule, say so and propose a fix to `test/shadcn.js` on its own.
- Cover each Exception with a valid case, and the near misses you deliberately leave out.
- Cover each `how_to_check` item you implement with an invalid case. Add a case that copies the Don't example's code.
- Check suggestions with their `output`.

## What the shared tests check

`npm test --workspace packages/eslint` runs everything. Beyond your own tests:

- `test/plugin.test.js`: the rule's id, level and verdict match the rule file; every message starts with the right prefix and avoids words we never use; `recommended` sets the rule to `"error"` for a rule and `"warn"` for a guideline; the rule has a test file and a README row; `rules/index.js` is up to date.
- `test/examples.test.js`: lints every file in `examples/rules/` and `adapters/shadcn/src` with `recommended`. It fails on any report in code a Do example renders, in helper files or in the reference components. It also fails when a Don't in a file whose rule has a lint rule is not caught by it and gives no `notLinted` reason, or is caught but still gives one. It prints, per lint rule, how many of its own rule's Don't examples it catches. Report that number when you hand over. When a new lint rule leaves a Don't uncaught, write the Don't's code out the way someone would really write it, or give the reason; never bend the example to fit the rule.
- `test/espree.test.js`: the rules also work with ESLint's own parser.
- `npm run corpus --workspace packages/eslint` (also run by the `check` workflow): lints shadcn's own v4 app and registry code (`apps/v4`: the site, the examples for every base and every registry), fetched at a pinned commit, and compares the reports with the reviewed list in `test/shadcn-corpus.txt`. A new report there is most often a wrong one. Read each change, and only when every one is right, run it again with `-- --update` and commit the list. It needs network access to GitHub.

The repository root uses TypeScript 7, which the TypeScript parser cannot load, so this package installs TypeScript 5 for its tests and `test/setup.js` points the tests at it. You do not need to do anything about it.

Before you hand over, run `npm run check` and `npm test` from the repository root. Both must pass.
