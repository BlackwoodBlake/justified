# @blackwoodblake/justified-tokens

The design tokens of Justified by Blackwood & Blake as CSS custom properties: colour, typography, space, shape, focus, target size and motion, in a light and a dark theme.

The colour names follow shadcn's theme variables, so shadcn components pick them up without changes. A fixed list of colour pairs, for text, input borders and the focus ring, is measured against WCAG 2.2 in both themes before a release ([1.4.3 Contrast (Minimum)](https://www.w3.org/TR/WCAG22/#contrast-minimum) and [1.4.11 Non-text Contrast](https://www.w3.org/TR/WCAG22/#non-text-contrast)). Every colour token is in at least one of those pairs, except `--border` for dividers and card edges and `--overlay` for the scrim behind a dialog, which carry no text or control of their own. The test fails if a colour token is added without a pair or a reason.

## Install

```sh
npm install @blackwoodblake/justified-tokens
```

## Use

With Tailwind CSS v4, import both files in your main CSS file, tokens first:

```css
@import "tailwindcss";
@import "@blackwoodblake/justified-tokens/tokens.css";
@import "@blackwoodblake/justified-tokens/theme.css";
```

`tokens.css` sets the variables. `theme.css` maps them to Tailwind theme names, so classes such as `bg-primary` and `text-muted-foreground` use them. Without Tailwind, import `tokens.css` alone and read the variables, for example `var(--primary)`.

Dark mode applies with a `.dark` class or `data-theme="dark"` on an ancestor.

The motion durations stay the same when someone asks their system for less motion. Since 0.2.0 the tokens no longer shorten them, because that also removed the short fades people can still use. Turn off movement in each component with Tailwind's `motion-reduce:` variant and keep its fades, as [VIS-006](https://blackwoodblake.com/design-system/patterns/vis-006/) describes.

If you use the shadcn CLI, you can add the theme from the registry instead, which copies the values into your own CSS: [Use with shadcn](https://blackwoodblake.com/design-system/get-started/shadcn/). To use your own colours, see [Change the theme](https://blackwoodblake.com/design-system/get-started/theming/).

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

[MIT](LICENSE). Part of [Justified by Blackwood & Blake](https://blackwoodblake.com/design-system/), developed at [github.com/blackwoodblake/justified](https://github.com/blackwoodblake/justified).
