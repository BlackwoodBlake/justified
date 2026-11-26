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
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: { parser: tseslint.parser },
  },
  { files: ["**/*.{js,jsx,ts,tsx}"], ...justified.configs.recommended },
];
```

Lint `.js` and `.ts` files too, not only `.jsx` and `.tsx`. Some rules read code that often sits in plain modules, such as Zod schemas, `useForm` options and keyboard shortcuts.

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
| `justified/no-generic-button-label` | [ACT-001a](https://blackwoodblake.com/design-system/patterns/act-001a/) | Rule | A button whose whole label is "Yes", "No" or "Submit", or "OK" next to another button outside a date or time picker, also beside an icon; "Confirm" alone in an alert dialog; and `<input type="submit">` with no `value`. |
| `justified/button-has-name` | [ACT-001b](https://blackwoodblake.com/design-system/patterns/act-001b/) | Rule | An icon-only or empty button with no `aria-label`, `aria-labelledby` or `title` (also when only a tooltip names it, and on the element base-ui's `render` prop gives it), an `aria-label` that leaves out the visible text, an icon button named after its picture or ending in "button", and an icon with its own label beside visible text. |
| `justified/one-emphasised-button` | [ACT-002a](https://blackwoodblake.com/design-system/patterns/act-002a/) | Rule | Two or more `Button`s or `AlertDialogAction`s with `variant="default"`, `"destructive"` or no variant in one row: a dialog, alert dialog, sheet, drawer or card footer, or a form's `div` of buttons. Branches of a condition are counted apart (options `emphasisedVariants`, `defaultVariant`). |
| `justified/confirm-button-last` | [ACT-003a](https://blackwoodblake.com/design-system/patterns/act-003a/) | Rule | In `DialogFooter` or `AlertDialogFooter`, a button after `AlertDialogAction`, or a Cancel that is the last button, as written or after `flex-row-reverse` or `order-*` at a width where the footer is a row. Stacked footers are left alone. |
| `justified/submit-stays-enabled` | [ACT-004](https://blackwoodblake.com/design-system/patterns/act-004/) | Guideline | A submit button whose `disabled` or `aria-disabled` reads `isValid`, in a `<form>` with at least five fields (option `minFields`). Off while sending, as with `isSubmitting`, is fine. |
| `justified/dnd-announcements` | [ACT-007b](https://blackwoodblake.com/design-system/patterns/act-007b/) | Guideline | A dnd-kit `DndContext` that allows keyboard moves (no `sensors`, or `KeyboardSensor` in them) with no `accessibility.announcements`, or without all of `onDragStart`, `onDragOver`, `onDragEnd` and `onDragCancel`. Also `aria-grabbed` and `aria-dropeffect` when the file announces nothing in words. |
| `justified/clickable-has-role` | [ACT-009](https://blackwoodblake.com/design-system/patterns/act-009/) | Rule | `onClick` with no `role` on a shadcn `Card`, `Badge`, `Avatar` or an icon component that holds no link or button; `PaginationLink`, `PaginationPrevious`, `PaginationNext` or `BreadcrumbLink` with `onClick` and no `href`; `Button variant="link"` or an underlined `button` whose click only navigates by script; a dialog, sheet, drawer, menu, popover or collapsible trigger with `asChild` around a `div`, `span`, `Avatar` or `Badge`. Native elements are left to eslint-plugin-jsx-a11y. |
| `justified/navigate-with-link` | [ACT-009a](https://blackwoodblake.com/design-system/patterns/act-009a/) | Guideline | A `Button` (not `variant="link"`, no `asChild`) or `button`, a `DropdownMenuItem` or a `SidebarMenuButton` whose click only goes to another address with `router.push`, `navigate()`, `window.open` or `window.location`, and `Tabs` whose change only goes to another path. Leaves alone buttons that save, sign out or send typed input first, and buttons in a form. |
| `justified/act-with-button` | [ACT-009b](https://blackwoodblake.com/design-system/patterns/act-009b/) | Guideline | An `<a>` or `Link` with `href="#"`, `""` or `javascript:` and an `onClick`; a link whose click always calls `preventDefault()` and then only sets state or toggles something in place; a dialog, sheet, drawer, menu, popover or collapsible trigger with `asChild` around an `<a>` or `Link`. |
| `justified/no-destructive-autofocus` | [DLG-004](https://blackwoodblake.com/design-system/patterns/dlg-004/) | Guideline | `autoFocus` or `data-autofocus` on the destructive button of an `AlertDialogContent` or `DialogContent` (also behind a condition, worked out per use when it reads props), an `onOpenAutoFocus` that focuses that button's ref, and a destructive `type="submit"` in a `<form>` inside `AlertDialogContent`. |
| `justified/destructive-confirm-style` | [DLG-005](https://blackwoodblake.com/design-system/patterns/dlg-005/) | Guideline | In an `AlertDialog`: a Delete, Remove, Erase, Revoke, Discard or Destroy button without `variant="destructive"`, the danger style on Cancel or on a safe action such as Save or Send, a filled Cancel beside a quiet destructive button, and `opacity-*` or `bg-destructive/*` on a destructive button that can be pressed. |
| `justified/toast-action-stays` | [FBK-005](https://blackwoodblake.com/design-system/patterns/fbk-005/) | Rule | A sonner toast with an `action` and no `duration: Infinity`, a `cancel` that does more than close it, or a `toast.custom` with two or more buttons besides the close control. Option `toasterDurationInfinity` for a global `<Toaster duration={Infinity}>`. |
| `justified/error-timing` | [FRM-002b](https://blackwoodblake.com/design-system/patterns/frm-002b/) | Rule | react-hook-form's `mode: "onChange"`, `"all"`, `"onBlur"` or `"onTouched"`, and `reValidateMode: "onBlur"` or `"onSubmit"`. A file with a new-password field gets no `mode` reports. An `onChange` on a text field that sets a new error message (an error `useState` setter, or react-hook-form's `setError`) guarded by nothing but a check of the value, not by an error already shown. |
| `justified/sign-in-allows-paste` | [FRM-008](https://blackwoodblake.com/design-system/patterns/frm-008/) | Rule | An `onPaste` that blocks paste on a sign-in field (`autoComplete` `username`, `current-password`, `one-time-code` or `webauthn`, or an `InputOTP` labelled for sign-in), and a sign-in code split into `maxLength={1}` boxes with no paste handling. Gift card and coupon codes are left to FRM-017. |
| `justified/control-has-name` | [FRM-010](https://blackwoodblake.com/design-system/patterns/frm-010/) | Rule | A form control or `role="combobox"` element with no `id`, `aria-label`, `aria-labelledby`, `title`, placeholder or label around it, an `aria-label` that leaves out the visible label (a label over a group of fields, such as Day, Month and Year, is not each field's label), and a `Switch` or `Checkbox` whose `aria-label` changes with `checked`. |
| `justified/choice-does-not-navigate` | [FRM-012b](https://blackwoodblake.com/design-system/patterns/frm-012b/) | Rule | A `Select`, `RadioGroup`, `Checkbox`, `Switch`, `ToggleGroup`, `DropdownMenuRadioGroup`, `DropdownMenuCheckboxItem`, native `select` or radio/checkbox `input` whose value change calls `router.push`/`replace`, `navigate()` from `useNavigate()`, `window.open` or `window.location`, or sends the form (`handleSubmit(...)()`, `requestSubmit()`). A `Switch`, `Checkbox`, `RadioGroup`, `ToggleGroup` or native radio/checkbox `input` whose value change opens a `Dialog`, `Sheet` or `Drawer` through its `open` state. Search-param changes on the same view, a `Switch` that saves itself, and an `AlertDialog` that asks to confirm are fine. |
| `justified/input-type-matches-value` | [FRM-014](https://blackwoodblake.com/design-system/patterns/frm-014/) | Guideline | An `Input` with no `type` or `type="text"` whose `autoComplete` is `email`, `tel`, `tel-national` or `url`, or whose label names only an email address, phone number or website; and `type="email"` on a field labelled for an email or user name. |
| `justified/digit-field-keypad` | [FRM-014a](https://blackwoodblake.com/design-system/patterns/frm-014a/) | Guideline | A text `Input` with `autoComplete="cc-number"` or `"cc-csc"`, or a digits-only or decimal `pattern` or Zod `.regex()`, and no `inputMode`; and `inputMode="numeric"` or `"decimal"` on a field whose pattern allows letters. Phone fields are left to FRM-014. |
| `justified/digit-string-not-number` | [FRM-014b](https://blackwoodblake.com/design-system/patterns/frm-014b/) | Guideline | `type="number"` on an `Input` whose `autoComplete` is a one-time code, card, phone or postcode value, or whose label names a code, PIN, card, account, member, customer, order or phone number or a postcode. Quantities are left alone. |
| `justified/enter-sends-form` | [FRM-015](https://blackwoodblake.com/design-system/patterns/frm-015/) | Rule | A react-hook-form `handleSubmit` on a button with no `<form>`; a form with a single-line field and no submit button whose main button is `type="button"` or a Justified `Button` with no type (it renders `type="button"`), unless the form has one such field and an `onSubmit`, since Enter then sends it anyway; an `onKeyDown` that only cancels Enter; a `button` or stock shadcn `Button` with no type before the `type="submit"` one (stock shadcn has no default type, so it is a submit button); a submit button in a `DialogFooter` or `SheetFooter` after the form with no `form` attribute. |
| `justified/option-text-toggles` | [FRM-016a](https://blackwoodblake.com/design-system/patterns/frm-016a/) | Rule | A `Checkbox`, `RadioGroupItem` or native checkbox/radio whose own text sits in a `span`, `p` or `div` tied to nothing; a `Label` beside it with no `htmlFor` or one that names nothing that can take a label; a hard-coded `id` in a `.map()` that a label points at; a bare `pointer-events-none` on the label of an enabled option; and a row `onClick` that toggles the same state. A control with no name at all is left to `control-has-name`. |
| `justified/switch-text-toggles` | [FRM-016b](https://blackwoodblake.com/design-system/patterns/frm-016b/) | Guideline | The same as `option-text-toggles`, for a `Switch` or an element with `role="switch"`. |
| `justified/fields-take-paste` | [FRM-017](https://blackwoodblake.com/design-system/patterns/frm-017/) | Guideline | An `onPaste` that cancels paste on a text field, text area or form, or a paste listener on the page that cancels it, outside sign-in (sign-in fields are FRM-008). |
| `justified/separators-accepted` | [FRM-017a](https://blackwoodblake.com/design-system/patterns/frm-017a/) | Guideline | For phone, card, account and reference values: a Zod `.regex()` or `.length()` with no cleaning first, a key handler that refuses every non-digit, `maxLength`, a digits-only `pattern` with the browser's check on, an `onChange` that rewrites a controlled value without restoring the caret, and a "(___) ___-____" placeholder. |
| `justified/limit-reached-in-words` | [FRM-017c](https://blackwoodblake.com/design-system/patterns/frm-017c/) | Guideline | `maxLength` on a text area, or an `onChange` that cuts it with `.slice(0, n)`, in a component with nothing that reads the length or shows a count, so text is stopped or cut in silence. |
| `justified/focus-stays-visible` | [KBD-001](https://blackwoodblake.com/design-system/patterns/kbd-001/) | Rule | `outline-none`, `outline-hidden`, `outline-0` or `outline: none` on a native focusable element or router `Link` with no other focus style on it, on its wrapper or through a `peer` or `group`. shadcn components, and elements with a class from your own stylesheet such as `focus-ring`, are left alone. |
| `justified/hover-controls-on-focus` | [KBD-001](https://blackwoodblake.com/design-system/patterns/kbd-001/) | Rule | Controls hidden with `opacity-0`, `hidden` or `invisible` and shown only by a hover class such as `group-hover:opacity-100`, with no focus class such as `group-focus-within:opacity-100`. |
| `justified/character-key-shortcuts` | [KBD-003](https://blackwoodblake.com/design-system/patterns/kbd-003/) | Rule | A page-wide `useHotkeys` (no kept ref, no `enabled`), `tinykeys` on `window` or `document`, `Mousetrap.bind`, or `keydown` listener on `document` or `window` that acts on a character key, plain or with Shift only, with nothing in the code to turn it off. A guard for text fields does not count. |
| `justified/modifier-by-default` | [KBD-003b](https://blackwoodblake.com/design-system/patterns/kbd-003b/) | Rule | A single-key shortcut setting whose starting value is `true`, such as `useState(true)` for `singleKeyShortcuts` or `useLocalStorage("single-key-shortcuts", true)`. A page-wide single-key binding that nothing turns on or off is reported by `character-key-shortcuts`. |
| `justified/zoom-not-blocked` | [LAY-003a](https://blackwoodblake.com/design-system/patterns/lay-003a/) | Rule | A viewport setting that turns zoom off or caps it below 2: `userScalable: false` or `maximumScale` below 2 in a Next.js viewport export, `metadata.viewport` or `generateViewport`, and `user-scalable=no`/`0` or `maximum-scale` below 2 in a viewport meta tag or content string. A fixed `h-*` or `max-h-*` with `overflow-hidden` on a box that holds a wrapping paragraph. |
| `justified/active-link-aria-current` | [NAV-002a](https://blackwoodblake.com/design-system/patterns/nav-002a/) | Rule | A `SidebarMenuButton` or `SidebarMenuSubButton` with `isActive` whose `a` or `Link` has no `aria-current` and no visually hidden "current" text, and `aria-current="page"` or `"true"` on an `li` or `SidebarMenuItem` instead of its link. `NavLink` and unknown link components are left alone. |
| `justified/meaningful-alt` | [STR-005](https://blackwoodblake.com/design-system/patterns/str-005/) | Rule | An image `alt` that only names the kind of picture (`"logo"`, `"Avatar"`, `"hero"`, `"decoration"`), is a file name (`"clock-red-2.svg"`), or reads a file name or address (`alt={file.name}`, `alt={src}`). Images in links and buttons are left to TXT-003 and ACT-001b. |
| `justified/svg-hidden-or-named` | [STR-005](https://blackwoodblake.com/design-system/patterns/str-005/) | Rule | An inline `svg` with no `aria-hidden`, no `aria-label` or `aria-labelledby`, and no `<title>`. Svgs that spread props, sit in a control or sit in a hidden element are left alone. |
| `justified/page-language` | [STR-006](https://blackwoodblake.com/design-system/patterns/str-006/) | Rule | An `html` element with no `lang` or `lang=""`; a `lang` on `html` that is not a valid language tag, such as `en_US`, `english` or `cn`; a written-out `lang` on `html` in a layout under `app/[locale]/`; and `lang` on a wrapper around `{children}` while `html` has none or another. next/document's `Html` without `lang` is left alone. |
| `justified/language-of-parts` | [STR-006a](https://blackwoodblake.com/design-system/patterns/str-006a/) | Rule | A `lang` on a native element that is not a valid language tag (a component's `lang`, as in `<CodeBlock lang="bash">`, is left alone), and a language picker mapped from a list in the same file whose labels are the languages' own names (such as *Polski*, *Português*) with no `lang` on the element that shows them. |
| `justified/sort-in-header-button` | [TBL-002](https://blackwoodblake.com/design-system/patterns/tbl-002/) | Rule | A click or pointer handler on a `TableHead` or `th` (or a `div` or `span` in it) with no button or link inside, `role="button"` or `tabIndex` of 0 or more on a header cell, `aria-sort` on a button or link, and a TanStack sort button in a table where no header cell sets `aria-sort`. |
| `justified/table-has-title` | [TBL-004](https://blackwoodblake.com/design-system/patterns/tbl-004/) | Guideline | A data table (one with a `TableHead` or `th`) with no `TableCaption` or `caption`, no `aria-labelledby` and no `aria-label`. Layout tables, names from expressions and tables with children the rule does not know are left alone. |
| `justified/colour-tokens-by-role` | [VIS-002](https://blackwoodblake.com/design-system/patterns/vis-002/) | Rule | Raw palette colours on text, edges, controls and states (`text-gray-500`, `border-gray-200`, a palette `bg-` on a `Button`, `bg-card dark:bg-zinc-900`, hex in `style`), a `*-foreground` on another token's fill, `border-border` on a field, and `ring-ring` or `border-ring` for a selected state. Illustrations, icons, photos with white or black text on a scrim, shadcn's own `bg-destructive text-white`, and arbitrary values that read a token, such as `text-[hsl(var(--muted-foreground))]`, are left alone. |
| `justified/underline-links-in-text` | [VIS-003b](https://blackwoodblake.com/design-system/patterns/vis-003b/) | Rule | A link in a paragraph, description or table cell beside other words whose fixed classes give no underline, `border-b` or font weight at rest, including `hover:underline` only and `no-underline`. Also an MDX or Markdown `a` mapping without one. Links with no `className` only with `flagUnstyled`. Links drawn as buttons, and links under a parent that underlines them (`prose`, `[&_a]:underline`), are left alone. |
| `justified/hover-and-press-looks` | [VIS-008](https://blackwoodblake.com/design-system/patterns/vis-008/) | Rule | A clickable `Card`, `li`, `tr` or marked `div` (also a `Card` in or under a link, and a `relative cursor-pointer` `div` or `li` with a link stretched over it), or a native `button` the code gives a fill or border, with no `hover:` or `active:` look, `hover:bg-transparent` or a removed menu highlight with nothing in its place, and `hover:` or `active:` looks on an `aria-disabled` element without `not-aria-disabled:`. |
| `justified/state-in-code` | [VIS-008a](https://blackwoodblake.com/design-system/patterns/vis-008a/) | Rule | A look switched by a state on a clickable element with no `aria-pressed`, `aria-selected`, `aria-checked`, `aria-expanded` or `data-state`, a control faded under a condition but not `disabled` or `aria-disabled`, a fixed or misplaced state, and `aria-disabled` on a handler that runs with no guard. |

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
