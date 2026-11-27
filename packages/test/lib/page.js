/**
 * page.js: small helpers that run inside the page.
 *
 * `install(page)` puts them on `globalThis.__justifiedTest` once per
 * document, so the helpers can call them from `evaluate`. They only read
 * the page; none of them changes it.
 */

/** @typedef {import("@playwright/test").Page} Page */

/** The selector for open dialogs, native and ARIA. */
export const DIALOGS = '[role="dialog"], [role="alertdialog"], dialog[open]';

function helpers() {
  if (globalThis.__justifiedTest) return;

  const TABBABLE =
    'a[href], area[href], button, input, select, textarea, iframe, summary, [tabindex], [contenteditable=""], [contenteditable="true"]';

  /** Whether an element takes up room and is not hidden. @param {Element} el */
  const shown = (el) => {
    if (!(el instanceof HTMLElement || el instanceof SVGElement)) return false;
    if (el.closest("[hidden], [inert]")) return false;
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") return false;
    const box = el.getBoundingClientRect();
    return box.width > 0 && box.height > 0;
  };

  /** Elements that Tab can reach, in the order they appear. @param {ParentNode} root */
  const tabbables = (root) =>
    [...root.querySelectorAll(TABBABLE)].filter((el) => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.tabIndex < 0) return false;
      if (/** @type {any} */ (el).disabled) return false;
      if (el instanceof HTMLInputElement && el.type === "hidden") return false;
      return shown(el);
    });

  /** A short, readable name for an element, for messages. @param {Element | null} el */
  const describe = (el) => {
    if (!el || el === document.body || el === document.documentElement) return "nothing (the page itself)";
    const tag = el.tagName.toLowerCase();
    const role = el.getAttribute("role");
    let name = el.getAttribute("aria-label") ?? "";
    if (!name && el.getAttribute("aria-labelledby")) {
      name = el
        .getAttribute("aria-labelledby")
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent ?? "")
        .join(" ");
    }
    if (!name && (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement))
      name = el.labels?.[0]?.textContent ?? "";
    if (!name) name = (el instanceof HTMLElement ? el.innerText : el.textContent) ?? "";
    name = name.replace(/\s+/g, " ").trim();
    if (name.length > 50) name = `${name.slice(0, 49)}…`;
    const what = role ? `${tag} (${role})` : tag;
    return name ? `${what} "${name}"` : what;
  };

  /** The focused element, looking into shadow roots. */
  const active = () => {
    let el = document.activeElement;
    while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
    return el;
  };

  /** Whether focus has left the document's content, as to the page itself or the browser. */
  const onNothing = () => {
    const el = active();
    return !el || el === document.body || el === document.documentElement;
  };

  globalThis.__justifiedTest = { shown, tabbables, describe, active, onNothing };
}

/** @param {Page} page */
export async function install(page) {
  await page.evaluate(helpers);
}
