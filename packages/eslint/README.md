# @blackwoodblake/justified-eslint

ESLint rules that flag code in shadcn and React apps that may break a behaviour rule of Justified by Blackwood & Blake. Each report names the rule by id, with its level and verdict, says what is wrong and how to fix it, and links to the rule's page.

The rules report only what they can see for certain in the code. Where a case takes judgement, or shows only when the page runs, they stay quiet. For those, use the `justified-review` skill from `@blackwoodblake/justified-agents` and test the running app.

## Install

```sh
npm install --save-dev @blackwoodblake/justified-eslint
```

It needs ESLint 9 or later with a flat config, and a parser that reads JSX. For TypeScript, use `typescript-eslint`.

## Use

```js
// eslint.config.js
import justified from "@blackwoodblake/justified-eslint";
import tseslint from "typescript-eslint";

export default [
  {
    files: ["**/*.{jsx,tsx}"],
    languageOptions: { parser: tseslint.parser },
  },
  { files: ["**/*.{jsx,tsx}"], ...justified.configs.recommended },
];
```

`recommended` turns on every rule. A rule is an `"error"`. A guideline is a `"warn"`: it is our own choice, where the design systems we weigh are divided, so keep your project's own convention where it has one. To turn on single rules instead, add the plugin as `plugins: { justified }` and list the rules you want.

## Rules

| Rule | Justified id | Level | What it flags |
| --- | --- | --- | --- |
| `justified/error-timing` | [FRM-002b](https://blackwoodblake.com/design-system/patterns/frm-002b/) | Rule | react-hook-form's `mode: "onChange"`, `"all"`, `"onBlur"` or `"onTouched"`, and `reValidateMode: "onBlur"` or `"onSubmit"`. A file with a new-password field gets no `mode` reports. |
| `justified/submit-stays-enabled` | [ACT-004](https://blackwoodblake.com/design-system/patterns/act-004/) | Guideline | A submit button whose `disabled` or `aria-disabled` reads `isValid`, in a `<form>` with at least five fields (option `minFields`). Off while sending, as with `isSubmitting`, is fine. |

Automated checks find some problems, not all. Test with real people and assistive technology.

## Accessibility

Justified helps you build interfaces that work toward WCAG 2.2
Level AA. It does not make your product compliant on its own,
and it is not a certification. Compliance depends on how your
product is built and tested: content, colours, flows and the
components you use.

You remain responsible for testing your product and for any
accessibility statement your organisation must publish. Justified
is provided as is, without warranty, under its licences.

## Licence

[MIT](LICENSE). The rule texts the messages link to are on the website under CC BY 4.0. Part of [Justified by Blackwood & Blake](https://blackwoodblake.com/design-system/), developed at [github.com/blackwoodblake/justified](https://github.com/blackwoodblake/justified).
