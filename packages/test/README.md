# @blackwoodblake/justified-test

Playwright helpers that check, in the running app, behaviour that may break a rule of Justified by Blackwood & Blake. They cover rules that lint cannot see because they show only when the page runs: where focus goes, what Escape does, what is announced, what moves. Each finding names the rule by id, with its level and verdict, says what happened and how to fix it, and links to the rule's page.

A helper checks only what its rule and the rule's exceptions say. Where a case takes judgement, such as whether a title names the view well, it stays quiet. For those, use the `justified-review` skill from `@blackwoodblake/justified-agents`.

This package is not on npm yet. It is marked `"private": true`, so the Publish workflow skips it until it is released.

## Install

```sh
npm install --save-dev @blackwoodblake/justified-test
```

It needs `@playwright/test` 1.51 or later. The helpers run in any browser Playwright drives; the tests here use Chromium.

## Use

```js
// dialogs.spec.js
import { test } from "@playwright/test";
import { expectEscapeCloses, expectFocusInside, expectFocusReturns } from "@blackwoodblake/justified-test";

test("the new customer dialog", async ({ page }) => {
  await page.goto("/customers");
  const trigger = page.getByRole("button", { name: "New customer" });

  // Opens the dialog with Enter, closes it with Escape, and checks focus both ways.
  await expectFocusReturns(trigger);
  await expectFocusReturns(trigger, { close: (dialog) => dialog.getByRole("button", { name: "Cancel" }).click() });

  await trigger.click();
  await expectFocusInside(page.getByRole("dialog"));

  await expectEscapeCloses(page, {
    setup: async () => {
      await page.goto("/customers");
      await page.getByRole("button", { name: "New customer" }).click();
      await page.getByLabel("Name").fill("Maya Ortiz");
    },
  });
});
```

A helper throws a `JustifiedFinding` when the page may break its rule, so the test fails with the finding as its message:

```text
May break DLG-006 (rule, Requirement): after the dialog closed, focus was on nothing (the page itself), not on button "New customer", which opened it. Return focus to the control that opened the dialog. https://blackwoodblake.com/design-system/patterns/dlg-006/
```

A `JustifiedUsageError` means the helper could not check, such as a dialog that never opened. It is not a finding.

More helpers:

```js
import {
  expectAnnounced,
  expectNoContextChangeOnInput,
  expectReducedMotion,
  expectTitleChangesOnNavigate,
} from "@blackwoodblake/justified-test";

await expectTitleChangesOnNavigate(page, [
  () => page.getByRole("link", { name: "Invoices" }).click(),
  () => page.getByRole("link", { name: "Customers" }).click(),
], { appName: "Fernhill" });

await expectAnnounced(page, "Draft saved", { action: () => page.getByLabel("Notes").fill("Hall booked") });

await expectNoContextChangeOnInput(page.getByLabel("Sort by"));
// A code that is sent on its sixth digit, with a notice before the field:
await expectNoContextChangeOnInput(page.getByLabel("Code"), {
  change: (field) => field.pressSequentially("123456"),
  notice: page.getByText("We check the code as soon as all six digits are in."),
});

await expectReducedMotion(page, { action: () => page.getByRole("button", { name: "Filters" }).click() });
```

## Helpers

| Helper | Justified id | Level | What it checks |
| --- | --- | --- | --- |
| `expectEscapeCloses(page, { setup, cancel? })` | [DLG-001](https://blackwoodblake.com/design-system/patterns/dlg-001/) | Rule | Runs `setup` twice from a fresh page, such as the dialog open with something typed, and presses Escape once and Cancel (or Close) once. Both must end the same way: the same dialogs open with the same text, and the same `snapshot` if you give one. Leave out dialogs where every button commits something, and the moment while a dialog shows that it is sending. |
| `expectFocusReturns(trigger, { open?, close? })` | [DLG-006](https://blackwoodblake.com/design-system/patterns/dlg-006/) | Rule | Opens the dialog from `trigger` (Enter by default) and checks that focus is inside it at once, then closes it (Escape by default) and checks that focus is back on `trigger`. If the close removed `trigger`, focus must be on another element in the page, not on the page itself. A close that goes to another address is left alone. |
| `expectFocusInside(dialog)` | [DLG-007](https://blackwoodblake.com/design-system/patterns/dlg-007/) | Rule | With the modal open, presses Tab past its last control and Shift+Tab past its first: focus must never reach the page behind (the browser's own controls do not count). Controls behind must not take a click, and must be hidden from assistive technology by `aria-modal="true"`, `inert` or `aria-hidden`. |
| `expectAnnounced(page, text, { action? })` | [FBK-004](https://blackwoodblake.com/design-system/patterns/fbk-004/) | Rule | Runs the action, waits for new text matching `text`, and checks that it sits in `role="status"`, `"alert"` or `"log"`, an `aria-live` region or an `output`. A message reached by moving focus, such as in a dialog that takes focus, is not a status message and is left alone. |
| `expectNoContextChangeOnInput(control, { change?, notice? })` | [FRM-012a](https://blackwoodblake.com/design-system/patterns/frm-012a/) | Rule | Focuses the control and changes its value from the keyboard. Reports another address, a new window, a sent form, a dialog that takes focus, a view replaced around the control, and focus moved away. Changes in place with focus kept are fine. With `notice`, a change of context is allowed when that text is shown before the control, not only in a tooltip; whether its words tell people enough is for you to judge. |
| `expectTitleChangesOnNavigate(page, navigations, { appName? })` | [STR-001](https://blackwoodblake.com/design-system/patterns/str-001/) | Rule | Runs each navigation and reads the title while the view loads and after. Reports a title that stays the same when the view changes, an empty or starter title such as "Vite + React + TS" or "App", a title that is only `appName`, and a value that is not there yet, such as "undefined – Fernhill". Pass only real route changes, not dialogs or tabs without their own route. |
| `expectReducedMotion(page, { action?, scope?, ignore? })` | [VIS-006](https://blackwoodblake.com/design-system/patterns/vis-006/) | Rule | Turns on `prefers-reduced-motion: reduce`, runs the action and watches until the page is still. Reports an animation or transition that slides, zooms, scales or turns, an element moved by script, and content left at opacity 0 waiting for an animation. Fades and instant changes are fine. Leave out motion that is the content, or that the person drives, with `ignore`. |

The helpers are tried against the live examples in this repository: every Do must pass and every Don't must be caught (`npm run test:runtime`). One Don't is left alone on purpose: an email address in the title of STR-001 goes against our own advice, not the rule.

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

[MIT](LICENSE). The rule texts the findings link to are on the website under CC BY 4.0. Part of [Justified by Blackwood & Blake](https://blackwoodblake.com/design-system/), developed at [github.com/blackwoodblake/justified](https://github.com/blackwoodblake/justified).
