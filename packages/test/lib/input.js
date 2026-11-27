/**
 * input.js: expectNoContextChangeOnInput (FRM-012a).
 *
 * Focuses the control, changes its value from the keyboard and checks that
 * nothing changed the context: no other address, no new window, no form
 * sent, no dialog that took focus, the control still in the page (the view
 * around it was not replaced) and focus still on it.
 *
 * Changes in place are fine: a list that filters, fields that appear, a
 * setting saved in the background, all with focus kept.
 *
 * The rule allows a change of context when text before the control tells
 * people it will happen. The helper cannot read what text means, so you
 * point it at that notice with `notice`; it then checks that the notice is
 * shown and comes before the control in reading order, and not only in a
 * tooltip or placeholder.
 */
import { DIALOGS, install } from "./page.js";
import { JustifiedFinding, JustifiedUsageError } from "./report.js";

/** @typedef {import("@playwright/test").Page} Page */
/** @typedef {import("@playwright/test").Locator} Locator */

/**
 * The default change: another option in a select, Space on a checkbox,
 * radio or switch, and one typed character in a text field.
 * @param {Locator} control
 */
async function defaultChange(control) {
  const kind = await control.evaluate((el) => {
    const role = el.getAttribute("role");
    if (el instanceof HTMLSelectElement) {
      const next = [...el.options].find((o) => !o.disabled && !o.selected);
      return { kind: "select", value: next?.value ?? null };
    }
    if (el instanceof HTMLInputElement && ["checkbox", "radio"].includes(el.type)) return { kind: "toggle" };
    if (role && ["checkbox", "radio", "switch", "menuitemcheckbox", "menuitemradio"].includes(role)) return { kind: "toggle" };
    return { kind: "type" };
  });
  if (kind.kind === "select") {
    if (kind.value === null) throw new JustifiedUsageError("the select has no other option to choose. Pass `change`.");
    await control.selectOption(kind.value);
  } else if (kind.kind === "toggle") await control.press("Space");
  else await control.pressSequentially("a");
}

/**
 * @param {Locator} control
 * @param {{ change?: (control: Locator) => Promise<void>, notice?: Locator, settle?: number }} [options]
 */
export async function expectNoContextChangeOnInput(control, options = {}) {
  const page = control.page();
  const settle = options.settle ?? 300;
  await install(page);
  const el = await control.elementHandle();
  if (!el) throw new JustifiedUsageError("the control is not in the page.");

  // Where the notice stands, read before the change, which may remove the control.
  let told = false;
  if (options.notice) {
    const notice = await options.notice.elementHandle().catch(() => null);
    if (!notice) throw new JustifiedUsageError("the notice is not in the page.");
    const place = await notice.evaluate((n, c) => {
      if (!globalThis.__justifiedTest.shown(n) || !(n.textContent ?? "").trim()) return "hidden";
      if (n.closest('[role="tooltip"]')) return "tooltip";
      if (n.contains(c)) return "around";
      return n.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING ? "before" : "after";
    }, el);
    if (place !== "before") {
      const why = {
        hidden: "is not shown",
        tooltip: "is only in a tooltip",
        around: "holds the control instead of coming before it",
        after: "comes after the control",
      }[place];
      throw new JustifiedFinding(
        "FRM-012a",
        `the notice that a change of value acts ${why}, so people meet the control before they are told. Put the notice in text before the control.`,
      );
    }
    told = true;
  }

  const address = page.url();
  let popup = false;
  const onPopup = () => {
    popup = true;
  };
  page.on("popup", onPopup);
  await page.evaluate(() => {
    const state = { submits: 0, dialogs: 0 };
    state.dialogs = document.querySelectorAll('[role="dialog"], [role="alertdialog"], dialog[open]').length;
    document.addEventListener("submit", () => (state.submits += 1), true);
    globalThis.__justifiedTestInput = state;
  });

  await control.focus();
  try {
    if (options.change) await options.change(control);
    else await defaultChange(control);
    await page.waitForTimeout(settle);
  } finally {
    page.off("popup", onPopup);
  }

  /** @type {string | null} */
  let what = null;
  if (popup) what = "opened a new window";
  else if (page.url() !== address) what = `opened another page (${page.url()})`;
  else {
    await install(page);
    what = await el.evaluate((c, selector) => {
      const t = globalThis.__justifiedTest;
      const state = globalThis.__justifiedTestInput;
      if (state?.submits > 0) return "sent the form";
      if (!c.isConnected) return "replaced the view around the control, which is no longer in the page";
      const now = t.active();
      const dialog = now?.closest?.(selector);
      if (dialog && !dialog.contains(c)) return `opened a dialog that took focus (${t.describe(dialog)})`;
      if (now !== c && !c.contains(now)) return `moved focus to ${t.describe(now)}`;
      return null;
    }, DIALOGS);
  }

  if (what && !told) {
    throw new JustifiedFinding(
      "FRM-012a",
      `changing the value ${what}. Keep focus on the control and change things in place, let people act with a button, or tell them in text before the control what the change will do.`,
    );
  }
}
