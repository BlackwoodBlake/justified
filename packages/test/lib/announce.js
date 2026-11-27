/**
 * announce.js: expectAnnounced (FBK-004).
 *
 * Runs the action, waits for new text that matches, and checks that the
 * element it appears in sits in a live region: `role="status"`, `"alert"`
 * or `"log"`, an `aria-live` other than "off", or an `output` element.
 *
 * A message reached by moving focus, such as one in a dialog that takes
 * focus or one that gets focus itself, is not a status message, and the
 * rule does not apply; the helper then checks nothing. Whether "alert" or
 * "polite" fits the message is our own advice, not the rule, and is not
 * checked.
 */
import { install } from "./page.js";
import { JustifiedFinding, JustifiedUsageError, quote } from "./report.js";

/** @typedef {import("@playwright/test").Page} Page */

/**
 * @param {Page} page
 * @param {string | RegExp} text The message, or part of it. Only text that appears or changes after the action counts.
 * @param {{ action?: () => Promise<void>, timeout?: number }} [options]
 */
export async function expectAnnounced(page, text, options = {}) {
  const timeout = options.timeout ?? 5000;
  await install(page);
  const match = typeof text === "string" ? { text } : { source: text.source, flags: text.flags };

  await page.evaluate(() => {
    const changed = new Set();
    const observer = new MutationObserver((records) => {
      // Only elements whose own text changed, or that were added, count; not a parent that got a new child.
      for (const r of records) {
        if (r.type === "characterData") {
          if (r.target.parentElement) changed.add(r.target.parentElement);
          continue;
        }
        for (const n of r.addedNodes) {
          if (n instanceof Element) changed.add(n);
          else if (n.nodeType === Node.TEXT_NODE && r.target instanceof Element) changed.add(r.target);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    globalThis.__justifiedTestChanged = { changed, observer, focus: null };
  });

  if (options.action) await options.action();
  await page.evaluate(() => {
    globalThis.__justifiedTestChanged.focus = globalThis.__justifiedTest.active();
  });

  const found = await page
    .waitForFunction(
      (m) => {
        const words = (/** @type {Element} */ el) => (el.textContent ?? "").replace(/\s+/g, " ").trim();
        const test = m.text !== undefined ? (s) => s.includes(m.text) : (s) => new RegExp(m.source, m.flags).test(s);
        const hits = [...globalThis.__justifiedTestChanged.changed].filter((el) => el.isConnected && test(words(el)));
        if (hits.length === 0) return false;
        // The smallest element that holds the whole message.
        hits.sort((a, b) => words(a).length - words(b).length);
        const el = hits[0];
        globalThis.__justifiedTestChanged.observer.disconnect();
        const t = globalThis.__justifiedTest;
        const now = t.active();
        const moved = now !== globalThis.__justifiedTestChanged.focus;
        const holder = now?.closest?.('[role="dialog"], [role="alertdialog"], dialog');
        const byFocus = moved && !!now && (el.contains(now) || now.contains(el) || (!!holder && holder.contains(el)));
        const live = el.closest(
          '[role="status"], [role="alert"], [role="log"], [aria-live="polite"], [aria-live="assertive"], output',
        );
        return { text: words(el), byFocus, live: !!live, where: t.describe(el) };
      },
      match,
      { timeout, polling: 25 },
    )
    .then((h) => h.jsonValue())
    .catch(() => null);

  if (!found) {
    throw new JustifiedUsageError(`no new text matching ${quote(String(text))} appeared within ${timeout} ms.`);
  }
  if (found.byFocus) return;
  if (!found.live) {
    throw new JustifiedFinding(
      "FBK-004",
      `the message ${quote(found.text)} appeared in ${found.where} with no live role around it, so a screen reader does not announce it. Put it in an element with role="status" or aria-live="polite" that is in the page before the message appears; keep role="alert" for an error that needs attention now.`,
    );
  }
}
