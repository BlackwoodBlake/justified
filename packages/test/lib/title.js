/**
 * title.js: expectTitleChangesOnNavigate (STR-001).
 *
 * Runs each navigation in turn and reads the title while the new view
 * loads and after. It reports a title that stays the same when the view
 * changes, an empty or starter title, a title that is only the product's
 * name, and a title that shows a value that is not there yet, such as
 * "undefined" or "{invoice.number}".
 *
 * Whether the words name the view well takes judgement and is left to
 * people. Dialogs, sheets and tabs without their own route keep the view's
 * title, so do not pass them as navigations.
 */
import { JustifiedFinding, JustifiedUsageError, quote } from "./report.js";

/** @typedef {import("@playwright/test").Page} Page */

const STARTER = /^(vite \+ react( \+ ts)?|vite app|react app|create next app|create react app|my app|app|untitled|document)$/i;
const PLACEHOLDER = /\bundefined\b|\bnull\b|\bNaN\b|\[object Object\]|\{\{?[^}]*\}\}?|%s\b/;

/**
 * @param {Page} page
 * @param {Array<() => Promise<void>>} navigations Each one moves to another view, such as a click on a link.
 * @param {{ settle?: number, appName?: string, readTitle?: () => Promise<string> }} [options]
 */
export async function expectTitleChangesOnNavigate(page, navigations, options = {}) {
  if (!Array.isArray(navigations) || navigations.length === 0) {
    throw new JustifiedUsageError("expectTitleChangesOnNavigate needs at least one navigation.");
  }
  const settle = options.settle ?? 500;
  const read = options.readTitle ?? (() => page.title());

  /** @param {string} title @param {string} when */
  const plain = (title, when) => {
    if (!title.trim()) {
      throw new JustifiedFinding("STR-001", `the page has no title ${when}. Give every view a title that says what it holds.`);
    }
    if (STARTER.test(title.trim())) {
      throw new JustifiedFinding(
        "STR-001",
        `the title is ${quote(title)} ${when}, a starter title that names the tool, not the product or the view. Replace it with a title that names the view.`,
      );
    }
    if (options.appName && title.trim() === options.appName.trim()) {
      throw new JustifiedFinding(
        "STR-001",
        `the title is only the product's name, ${quote(title)}, ${when}. Name the view now shown, for example "Invoices – ${options.appName}".`,
      );
    }
  };
  /** @param {string} title @param {string} when */
  const filled = (title, when) => {
    if (PLACEHOLDER.test(title)) {
      throw new JustifiedFinding(
        "STR-001",
        `the title read ${quote(title)} ${when}, a value that was not there yet. Show a sensible title at once, such as the kind of record, and add the details when the data arrives.`,
      );
    }
  };

  let previous = await read();
  filled(previous, "before the first navigation");
  plain(previous, "before the first navigation");

  for (let i = 0; i < navigations.length; i += 1) {
    const when = `after navigation ${i + 1}`;
    /** @type {string[]} */
    const seen = [];
    let running = true;
    const watch = (async () => {
      while (running) {
        seen.push(await read().catch(() => ""));
        await new Promise((r) => setTimeout(r, 40));
      }
    })();
    try {
      await navigations[i]();
      await page.waitForTimeout(settle);
    } finally {
      running = false;
      await watch;
    }
    const now = await read();
    for (const title of [...seen, now]) filled(title, `while the view loaded ${when}`);
    plain(now, when);
    if (now === previous) {
      throw new JustifiedFinding(
        "STR-001",
        `the title stayed ${quote(now)} ${when}, when the view changed. Set a new title on every route change, one that names the view now shown.`,
      );
    }
    previous = now;
  }
}
