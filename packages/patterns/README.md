# @blackwoodblake/justified-patterns

The behaviour rules and guidelines of Justified by Blackwood & Blake as data: how forms, buttons, dialogs, messages and other parts of an interface should behave. Each text comes with its verdict, the WCAG 2.2 criteria it rests on and the stance of every source that was weighed.

## Install

```sh
npm install @blackwoodblake/justified-patterns
```

## Use

```js
import rules from "@blackwoodblake/justified-patterns/rules.json" with { type: "json" };

const forms = rules.filter((rule) => rule.area === "forms");
```

`rules.json` is an array with one object per text. The main fields:

| Field | What it holds |
| --- | --- |
| `id` | The id, such as `FRM-002a`. It never changes. |
| `title`, `short` | The text as one sentence, and a short name of at most 30 characters |
| `area` | The area, such as `forms` or `dialogs` |
| `level` | `rule` (decided by WCAG or the judges) or `guideline` (our own choice) |
| `verdict`, `judges` | The verdict, and how many judges spoke and agreed |
| `status`, `version`, `changelog` | `decided` or `proposed`, the version and its history |
| `law`, `stances`, `sources` | The WCAG criteria, and each source's stance with the pages it rests on |
| `check`, `how_to_check` | How a break is found (`lint`, `runtime`, `review` or `manual`), and what to look for in code or on the running page. A hit means the text may be broken, never that it is. |
| `body` | The full text in Markdown: Why, Do, Don't and Exceptions |

Every text also has its own page under [blackwoodblake.com/design-system/patterns](https://blackwoodblake.com/design-system/patterns/), with live examples. The same data is served as [rules.json](https://blackwoodblake.com/design-system/patterns/rules.json) if you would rather not install anything.

Texts marked `proposed` are complete but may still change. A `decided` text is not expected to change what it asks, though its wording may be made clearer. Any change comes in a new version of this package.

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

The rule texts are licensed under [CC BY 4.0](LICENSE-docs): credit "Justified by Blackwood & Blake" with a link to [blackwoodblake.com/design-system](https://blackwoodblake.com/design-system/). The code is licensed under [MIT](LICENSE). Developed at [github.com/blackwoodblake/justified](https://github.com/blackwoodblake/justified).
