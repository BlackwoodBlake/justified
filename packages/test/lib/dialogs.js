/**
 * dialogs.js: the dialog helpers.
 *
 *   - expectFocusReturns (DLG-006): focus moves into a modal dialog when it
 *     opens, and back to its opener when it closes, or to a place in the page
 *     when the opener is gone.
 *   - expectFocusInside (DLG-007): while a modal dialog is open, Tab and
 *     Shift+Tab stay in it and the page behind cannot be used.
 *   - expectEscapeCloses (DLG-001): Escape ends the same way as Cancel.
 *
 * They are for modal dialogs. A panel people work beside is outside these
 * rules, so do not run them on one.
 */
import { DIALOGS, install } from "./page.js";
import { JustifiedFinding, JustifiedUsageError, quote } from "./report.js";

/** @typedef {import("@playwright/test").Page} Page */
/** @typedef {import("@playwright/test").Locator} Locator */

const WAIT = 1000;

/** The dialog that is open last, or the one given. @param {Page} page @param {Locator} [given] */
const openDialog = (page, given) => given ?? page.locator(DIALOGS).filter({ visible: true }).last();

/**
 * Waits until `test` is true in the page, or the time is up.
 * @param {() => Promise<boolean>} test
 */
async function within(test, ms = WAIT) {
  const end = Date.now() + ms;
  for (;;) {
    if (await test()) return true;
    if (Date.now() > end) return false;
    await new Promise((r) => setTimeout(r, 25));
  }
}

/** @param {Page} page */
const focusText = (page) => page.evaluate(() => globalThis.__justifiedTest.describe(globalThis.__justifiedTest.active()));

/**
 * DLG-006. Opens the dialog from `trigger`, checks that focus is inside it,
 * closes it and checks that focus is back on `trigger`. If the close removed
 * `trigger` from the page, focus must be on another element in the page, not
 * on the page itself. If the close moved to another address, the helper
 * stops there: the rule leaves the new page's focus alone.
 *
 * @param {Locator} trigger
 * @param {{
 *   open?: (trigger: Locator) => Promise<void>,
 *   close?: (dialog: Locator) => Promise<void>,
 *   dialog?: Locator,
 *   timeout?: number,
 * }} [options]
 */
export async function expectFocusReturns(trigger, options = {}) {
  const page = trigger.page();
  const timeout = options.timeout ?? WAIT;
  await install(page);
  const opener = await trigger.elementHandle();
  if (!opener) throw new JustifiedUsageError("the trigger is not in the page.");

  if (options.open) await options.open(trigger);
  else {
    await trigger.focus();
    await page.keyboard.press("Enter");
  }

  const dialog = openDialog(page, options.dialog);
  try {
    await dialog.waitFor({ state: "visible", timeout: timeout * 2 });
  } catch {
    throw new JustifiedUsageError("no dialog opened from the trigger. Pass `open` or `dialog`.");
  }
  const box = await dialog.elementHandle();

  const inside = await within(
    () => /** @type {any} */ (box).evaluate((d) => d.contains(globalThis.__justifiedTest.active())),
    timeout,
  );
  if (!inside) {
    const where = await focusText(page);
    throw new JustifiedFinding(
      "DLG-006",
      `after the dialog opened, focus was on ${where}, outside the dialog. Move focus into the dialog when it opens, to its first field or its first control.`,
    );
  }

  const address = page.url();
  if (options.close) await options.close(dialog);
  else await page.keyboard.press("Escape");
  const closed = await within(async () => !(await box?.evaluate((d) => d.isConnected && globalThis.__justifiedTest.shown(d)).catch(() => false)), timeout * 2);
  if (!closed) throw new JustifiedUsageError("the dialog did not close. Pass `close` with the action that closes it.");

  // The closing action went to another page: the rule leaves that page's focus alone.
  if (page.url() !== address) return;
  await install(page);

  const stillThere = await opener.evaluate((el) => el.isConnected);
  if (stillThere) {
    const back = await within(() => opener.evaluate((el) => globalThis.__justifiedTest.active() === el), timeout);
    if (!back) {
      const where = await focusText(page);
      const name = await opener.evaluate((el) => globalThis.__justifiedTest.describe(el));
      throw new JustifiedFinding(
        "DLG-006",
        `after the dialog closed, focus was on ${where}, not on ${name}, which opened it. Return focus to the control that opened the dialog.`,
      );
    }
    return;
  }

  const somewhere = await within(() => page.evaluate(() => !globalThis.__justifiedTest.onNothing()), timeout);
  if (!somewhere) {
    throw new JustifiedFinding(
      "DLG-006",
      "the control that opened the dialog is gone, and after the dialog closed focus was on nothing, so the next Tab starts again from the top. Move focus to a logical place nearby, such as the next item or the list's heading.",
    );
  }
}

/**
 * DLG-007. With the dialog open, presses Tab past its last control and
 * Shift+Tab past its first, and checks that focus never reaches the page
 * behind. Focus leaving the page for the browser's own controls does not
 * count. Then checks that the controls behind cannot be clicked, and that
 * they are hidden from assistive technology (the dialog has
 * `aria-modal="true"`, or the page behind is `inert` or `aria-hidden`).
 *
 * If focus is not in the dialog when it starts, it begins at the dialog's
 * first control.
 *
 * @param {Locator} dialog
 * @param {{ presses?: number }} [options]
 */
export async function expectFocusInside(dialog, options = {}) {
  const page = dialog.page();
  await install(page);
  try {
    await dialog.waitFor({ state: "visible", timeout: WAIT * 2 });
  } catch {
    throw new JustifiedUsageError("the dialog is not open.");
  }
  const box = await dialog.elementHandle();
  if (!box) throw new JustifiedUsageError("the dialog is not open.");

  const count = await box.evaluate((d) => {
    const t = globalThis.__justifiedTest;
    const inside = t.tabbables(d);
    if (!d.contains(t.active())) inside[0]?.focus();
    return inside.length;
  });
  if (count === 0) throw new JustifiedUsageError("the dialog has no control that Tab can reach.");

  const presses = options.presses ?? count + 2;
  for (const key of ["Tab", "Shift+Tab"]) {
    for (let i = 0; i < presses; i += 1) {
      await page.keyboard.press(key);
      const outside = await box.evaluate((d) => {
        const t = globalThis.__justifiedTest;
        if (t.onNothing()) return null;
        const el = t.active();
        return d.contains(el) ? null : t.describe(el);
      });
      if (outside) {
        throw new JustifiedFinding(
          "DLG-007",
          `${key} moved focus to ${outside}, behind the open dialog. Keep Tab and Shift+Tab inside a modal dialog, and make the page behind it inert until it closes.`,
        );
      }
    }
  }

  const reachable = await box.evaluate((d) => {
    const t = globalThis.__justifiedTest;
    const modal = d.getAttribute("aria-modal") === "true" || (d instanceof HTMLDialogElement && d.matches(":modal"));
    const behind = t.tabbables(document).filter((el) => !d.contains(el) && !el.contains(d)).slice(0, 50);
    for (const el of behind) {
      const box = el.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;
      if (x >= 0 && y >= 0 && x < innerWidth && y < innerHeight) {
        const hit = document.elementFromPoint(x, y);
        if (hit && (hit === el || el.contains(hit))) return { how: "click", what: t.describe(el) };
      }
      if (!modal && !el.closest('[aria-hidden="true"]')) return { how: "read", what: t.describe(el) };
    }
    return null;
  });
  if (reachable?.how === "click") {
    throw new JustifiedFinding(
      "DLG-007",
      `${reachable.what}, behind the open dialog, can still be clicked. Cover the page behind a modal dialog, or make it inert, until the dialog closes.`,
    );
  }
  if (reachable?.how === "read") {
    throw new JustifiedFinding(
      "DLG-007",
      `${reachable.what}, behind the open dialog, can still be reached by a screen reader: the dialog has no aria-modal="true" and the page behind is neither inert nor aria-hidden. Mark the dialog as modal, or make the page behind inert.`,
    );
  }
}

/**
 * DLG-001. Brings the page to the same state twice with `setup`, such as a
 * dialog open with something typed: once it presses Escape, once `cancel`.
 * Both must end the same way: the same dialogs open with the same text, and
 * the same `snapshot` if one is given. `setup` must start from a fresh page
 * each time, for example with `page.goto`.
 *
 * Leave alone a dialog with no Cancel, Close or close icon, where every
 * button commits something, and a dialog while it shows that it is sending.
 *
 * @param {Page} page
 * @param {{
 *   setup: () => Promise<void>,
 *   cancel?: (dialog: Locator) => Promise<void>,
 *   dialog?: Locator,
 *   snapshot?: (page: Page) => Promise<unknown>,
 *   settle?: number,
 * }} options
 */
export async function expectEscapeCloses(page, options) {
  if (!options?.setup) throw new JustifiedUsageError("expectEscapeCloses needs `setup`, which opens the dialog on a fresh page.");
  const settle = options.settle ?? 300;

  const end = async () => {
    await page.waitForTimeout(settle);
    const dialogs = await page
      .locator(DIALOGS)
      .filter({ visible: true })
      .evaluateAll((all) => all.map((d) => (d instanceof HTMLElement ? d.innerText : d.textContent ?? "").replace(/\s+/g, " ").trim()));
    const extra = options.snapshot ? await options.snapshot(page) : undefined;
    return { dialogs, extra: JSON.stringify(extra ?? null) };
  };
  const say = (/** @type {{ dialogs: string[] }} */ e) =>
    e.dialogs.length === 0 ? "the dialog closed" : `the dialog showed ${e.dialogs.map((d) => quote(d)).join(" and ")}`;

  await options.setup();
  const first = openDialog(page, options.dialog);
  await first.waitFor({ state: "visible", timeout: WAIT * 2 });
  await page.keyboard.press("Escape");
  const escape = await end();

  await options.setup();
  const dialog = openDialog(page, options.dialog);
  await dialog.waitFor({ state: "visible", timeout: WAIT * 2 });
  if (options.cancel) await options.cancel(dialog);
  else {
    const cancel = dialog.getByRole("button", { name: "Cancel", exact: true });
    const close = dialog.getByRole("button", { name: "Close", exact: true });
    const target = (await cancel.count()) > 0 ? cancel.last() : close.last();
    if ((await target.count()) === 0) throw new JustifiedUsageError("the dialog has no Cancel or Close button. Pass `cancel`.");
    await target.click();
  }
  const cancelled = await end();

  if (escape.dialogs.join("\n") !== cancelled.dialogs.join("\n")) {
    throw new JustifiedFinding(
      "DLG-001",
      `Escape and Cancel end differently: after Escape ${say(escape)}, after Cancel ${say(cancelled)}. Make Escape do exactly what Cancel does, including any question before typed input is thrown away.`,
    );
  }
  if (escape.extra !== cancelled.extra) {
    throw new JustifiedFinding(
      "DLG-001",
      `Escape and Cancel leave the page in different states: after Escape ${escape.extra}, after Cancel ${cancelled.extra}. Make Escape do exactly what Cancel does, and never save, send or delete.`,
    );
  }
}
