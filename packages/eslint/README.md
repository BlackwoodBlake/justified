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

### Use it with jsx-a11y

These rules add what is specific to shadcn components and patterns. For plain HTML elements, also turn on `eslint-plugin-jsx-a11y`, and tell it which of your components draw which element, so its checks reach them too. Set `no-autofocus` to ignore components, since a dialog may move focus on purpose and `justified/no-destructive-autofocus` covers the case that matters there.

```js
// eslint.config.js
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  // ...the config above
  {
    ...jsxA11y.flatConfigs.recommended,
    settings: {
      "jsx-a11y": {
        components: { Button: "button", Input: "input", Textarea: "textarea", Label: "label" },
      },
    },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      "jsx-a11y/no-autofocus": ["error", { ignoreNonDOM: true }],
    },
  },
];
```

## Rules

| Rule | Justified id | Level | What it flags |
| --- | --- | --- | --- |
| `justified/no-generic-button-label` | [ACT-001a](https://blackwoodblake.com/design-system/patterns/act-001a/) | Rule | A button whose whole label is "Yes", "No" or "Submit", or "OK" next to another button outside a date or time picker; "Confirm" alone in an alert dialog; and `<input type="submit">` with no `value`. |
| `justified/button-has-name` | [ACT-001b](https://blackwoodblake.com/design-system/patterns/act-001b/) | Rule | An icon-only or empty button with no `aria-label`, `aria-labelledby` or `title` (also when only a tooltip names it), an `aria-label` that leaves out the visible text, an icon button named after its picture or ending in "button", and an icon with its own label beside visible text. |
| `justified/one-emphasised-button` | [ACT-002a](https://blackwoodblake.com/design-system/patterns/act-002a/) | Rule | Two or more `Button`s or `AlertDialogAction`s with `variant="default"`, `"destructive"` or no variant in one row: a dialog, alert dialog, sheet, drawer or card footer, or a form's `div` of buttons. Branches of a condition are counted apart (options `emphasisedVariants`, `defaultVariant`). |
| `justified/confirm-button-last` | [ACT-003a](https://blackwoodblake.com/design-system/patterns/act-003a/) | Rule | In `DialogFooter` or `AlertDialogFooter`, a button after `AlertDialogAction`, or a Cancel that is the last button, as written or after `flex-row-reverse` or `order-*` at a width where the footer is a row. Stacked footers are left alone. |
| `justified/submit-stays-enabled` | [ACT-004](https://blackwoodblake.com/design-system/patterns/act-004/) | Guideline | A submit button whose `disabled` or `aria-disabled` reads `isValid`, in a `<form>` with at least five fields (option `minFields`). Off while sending, as with `isSubmitting`, is fine. |
| `justified/dnd-announcements` | [ACT-007b](https://blackwoodblake.com/design-system/patterns/act-007b/) | Guideline | A dnd-kit `DndContext` that allows keyboard moves (no `sensors`, or `KeyboardSensor` in them) with no `accessibility.announcements`, or without all of `onDragStart`, `onDragOver`, `onDragEnd` and `onDragCancel`. Also `aria-grabbed` and `aria-dropeffect` when the file announces nothing in words. |
| `justified/no-destructive-autofocus` | [DLG-004](https://blackwoodblake.com/design-system/patterns/dlg-004/) | Guideline | `autoFocus` or `data-autofocus` on the destructive button of an `AlertDialogContent` or `DialogContent` (also behind a condition, worked out per use when it reads props), an `onOpenAutoFocus` that focuses that button's ref, and a destructive `type="submit"` in a `<form>` inside `AlertDialogContent`. |
| `justified/destructive-confirm-style` | [DLG-005](https://blackwoodblake.com/design-system/patterns/dlg-005/) | Guideline | In an `AlertDialog`: a Delete, Remove, Erase, Revoke, Discard or Destroy button without `variant="destructive"`, the danger style on Cancel or on a safe action such as Save or Send, a filled Cancel beside a quiet destructive button, and `opacity-*` or `bg-destructive/*` on a destructive button that can be pressed. |
| `justified/toast-action-stays` | [FBK-005](https://blackwoodblake.com/design-system/patterns/fbk-005/) | Rule | A sonner toast with an `action` and no `duration: Infinity`, a `cancel` that does more than close it, or a `toast.custom` with two or more buttons besides the close control. Option `toasterDurationInfinity` for a global `<Toaster duration={Infinity}>`. |
| `justified/error-timing` | [FRM-002b](https://blackwoodblake.com/design-system/patterns/frm-002b/) | Rule | react-hook-form's `mode: "onChange"`, `"all"`, `"onBlur"` or `"onTouched"`, and `reValidateMode: "onBlur"` or `"onSubmit"`. A file with a new-password field gets no `mode` reports. |
| `justified/sign-in-allows-paste` | [FRM-008](https://blackwoodblake.com/design-system/patterns/frm-008/) | Rule | An `onPaste` that blocks paste on a sign-in field (`autoComplete` `username`, `current-password`, `one-time-code` or `webauthn`), and a code split into `maxLength={1}` boxes with no paste handling. |
| `justified/control-has-name` | [FRM-010](https://blackwoodblake.com/design-system/patterns/frm-010/) | Rule | A form control or `role="combobox"` element with no `id`, `aria-label`, `aria-labelledby`, `title`, placeholder or label around it, an `aria-label` that leaves out the visible label, and a `Switch` or `Checkbox` whose `aria-label` changes with `checked`. |
| `justified/choice-does-not-navigate` | [FRM-012b](https://blackwoodblake.com/design-system/patterns/frm-012b/) | Rule | A `Select`, `RadioGroup`, `Checkbox`, `Switch`, `ToggleGroup`, `DropdownMenuRadioGroup`, `DropdownMenuCheckboxItem`, native `select` or radio/checkbox `input` whose value change calls `router.push`/`replace`, `navigate()` from `useNavigate()`, `window.open` or `window.location`, or sends the form (`handleSubmit(...)()`, `requestSubmit()`). Search-param changes on the same view, and a `Switch` that saves itself, are fine. |
| `justified/focus-stays-visible` | [KBD-001](https://blackwoodblake.com/design-system/patterns/kbd-001/) | Rule | `outline-none`, `outline-hidden`, `outline-0` or `outline: none` on a native focusable element or router `Link` with no other focus style on it, on its wrapper or through a `peer` or `group`. shadcn components are left alone. |
| `justified/hover-controls-on-focus` | [KBD-001](https://blackwoodblake.com/design-system/patterns/kbd-001/) | Rule | Controls hidden with `opacity-0`, `hidden` or `invisible` and shown only by a hover class such as `group-hover:opacity-100`, with no focus class such as `group-focus-within:opacity-100`. |
| `justified/active-link-aria-current` | [NAV-002a](https://blackwoodblake.com/design-system/patterns/nav-002a/) | Rule | A `SidebarMenuButton` or `SidebarMenuSubButton` with `isActive` whose `a` or `Link` has no `aria-current` and no visually hidden "current" text, and `aria-current="page"` or `"true"` on an `li` or `SidebarMenuItem` instead of its link. `NavLink` and unknown link components are left alone. |
| `justified/meaningful-alt` | [STR-005](https://blackwoodblake.com/design-system/patterns/str-005/) | Rule | An image `alt` that only names the kind of picture (`"logo"`, `"Avatar"`, `"hero"`, `"decoration"`), is a file name (`"clock-red-2.svg"`), or reads a file name or address (`alt={file.name}`, `alt={src}`). Images in links and buttons are left to TXT-003 and ACT-001b. |
| `justified/svg-hidden-or-named` | [STR-005](https://blackwoodblake.com/design-system/patterns/str-005/) | Rule | An inline `svg` with no `aria-hidden`, no `aria-label` or `aria-labelledby`, and no `<title>`. Svgs that spread props, sit in a control or sit in a hidden element are left alone. |
| `justified/sort-in-header-button` | [TBL-002](https://blackwoodblake.com/design-system/patterns/tbl-002/) | Rule | A click or pointer handler on a `TableHead` or `th` (or a `div` or `span` in it) with no button or link inside, `role="button"` or `tabIndex` of 0 or more on a header cell, `aria-sort` on a button or link, and a TanStack sort button in a table where no header cell sets `aria-sort`. |
| `justified/table-has-title` | [TBL-004](https://blackwoodblake.com/design-system/patterns/tbl-004/) | Guideline | A data table (one with a `TableHead` or `th`) with no `TableCaption` or `caption`, no `aria-labelledby` and no `aria-label`. Layout tables, names from expressions and tables with children the rule does not know are left alone. |
| `justified/colour-tokens-by-role` | [VIS-002](https://blackwoodblake.com/design-system/patterns/vis-002/) | Rule | Raw palette colours on text, edges, controls and states (`text-gray-500`, `border-gray-200`, a palette `bg-` on a `Button`, `bg-card dark:bg-zinc-900`, hex in `style`), a `*-foreground` on another token's fill, `border-border` on a field, and `ring-ring` or `border-ring` for a selected state. Illustrations, photos and icons are left alone. |
| `justified/underline-links-in-text` | [VIS-003b](https://blackwoodblake.com/design-system/patterns/vis-003b/) | Rule | A link in a paragraph, description or table cell beside other words whose fixed classes give no underline, `border-b` or font weight at rest, including `hover:underline` only and `no-underline`. Also an MDX or Markdown `a` mapping without one. Links with no `className` only with `flagUnstyled`. |

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
