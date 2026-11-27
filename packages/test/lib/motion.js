/**
 * motion.js: expectReducedMotion (VIS-006).
 *
 * Turns on reduced motion for the page (`prefers-reduced-motion: reduce`),
 * runs the action and watches what happens until the page is still:
 *
 *   - a CSS animation or transition, or a Web Animation, that moves, slides,
 *     zooms, scales or turns an element (transform, translate, scale,
 *     rotate, or top, right, bottom and left);
 *   - an element moved by script, such as a spring, seen at three or more
 *     places on the page in a row;
 *   - content that the action showed, or left, at zero opacity, such as a
 *     card that waits for a fade-in that the setting turned off.
 *
 * A fade and an instant change are fine. Motion that is the content, such
 * as a video or an animation being edited, and motion the person drives,
 * such as a drag, stay; leave them out with `ignore`.
 */
import { JustifiedFinding } from "./report.js";
import { install } from "./page.js";

/** @typedef {import("@playwright/test").Page} Page */
/** @typedef {import("@playwright/test").Locator} Locator */

function startWatch({ ignore, scoped }) {
  const t = globalThis.__justifiedTest;
  const root = scoped ?? document.body;
  const skip = (el) => !root.contains(el) || (ignore && el.closest(ignore));
  const MOVING = ["transform", "translate", "scale", "rotate", "top", "right", "bottom", "left", "offsetDistance"];

  /** A value with no movement in it reads "" however it is written. */
  const flat = (v) => {
    const s = String(v ?? "")
      .replace(/\s+/g, "")
      .toLowerCase()
      .replace(/translate(3d|x|y|z)?\((-?0(px|%|rem|em)?,?)+\)/g, "")
      .replace(/scale(3d|x|y|z)?\((1,?)+\)/g, "")
      .replace(/rotate(3d|x|y|z)?\((-?0(deg|rad|turn)?,?)+\)/g, "")
      .replace(/^matrix\(1,0,0,1,0,0\)$/, "")
      .replace(/^matrix3d\(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1\)$/, "");
    return s === "none" || s === "auto" ? "" : s;
  };

  const opacityOf = (el) => {
    let o = 1;
    for (let n = el; n instanceof Element; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
    return o;
  };

  const before = new WeakSet();
  for (const el of root.querySelectorAll("*")) if (opacityOf(el) < 0.05) before.add(el);

  const state = {
    moving: new Map(),
    shapes: new Map(),
    seen: new WeakSet(),
    places: new Map(),
    running: true,
    opacityOf,
    before,
  };

  const look = () => {
    for (const a of document.getAnimations()) {
      const target = a.effect && "target" in a.effect ? a.effect.target : null;
      if (!(target instanceof Element) || skip(target)) continue;
      if (!state.seen.has(a)) {
        state.seen.add(a);
        const frames = a.effect.getKeyframes();
        const name = a.animationName || a.transitionProperty || a.id || "an animation";
        for (const key of MOVING) {
          const values = frames.filter((f) => key in f).map((f) => flat(f[key]));
          // Values written with var() cannot be read here; the element is watched below.
          if (values.length === 0 || values.some((v) => v.includes("var("))) continue;
          const distinct = new Set(values);
          const leftOpen = values.length < frames.length || frames.length === 1;
          if (distinct.size > 1 || (leftOpen && [...distinct].some((v) => v !== ""))) {
            state.moving.set(target, `${t.describe(target)} moves with ${name} (${key})`);
          }
        }
      }
      const now = getComputedStyle(target);
      const shape = [now.transform, now.translate, now.scale, now.rotate].map(flat).join("|");
      const shapes = state.shapes.get(target) ?? new Set();
      shapes.add(shape);
      state.shapes.set(target, shapes);
    }
    let n = 0;
    for (const el of root.querySelectorAll("*")) {
      if (n++ > 400) break;
      if (skip(el)) continue;
      const box = el.getBoundingClientRect();
      if (box.width === 0 && box.height === 0) continue;
      const at = `${Math.round(box.left + scrollX)},${Math.round(box.top + scrollY)}`;
      const list = state.places.get(el) ?? [];
      if (list[list.length - 1] !== at) list.push(at);
      state.places.set(el, list);
    }
    if (state.running) requestAnimationFrame(look);
  };
  globalThis.__justifiedTestMotion = state;
  look();
}

function stopWatch({ ignore, scoped }) {
  const t = globalThis.__justifiedTest;
  const state = globalThis.__justifiedTestMotion;
  state.running = false;
  const root = scoped ?? document.body;
  const found = [...state.moving.values()];

  for (const [el, shapes] of state.shapes) {
    if (state.moving.has(el) || shapes.size < 2) continue;
    state.moving.set(el, `${t.describe(el)} moves with a transform`);
    found.push(state.moving.get(el));
  }

  /** Whether an ancestor already moved, so the child only moved with it. */
  const carried = (el) => {
    for (let p = el.parentElement; p && p !== root; p = p.parentElement) {
      if (state.moving.has(p) || (state.places.get(p) ?? []).length >= 3) return true;
    }
    return false;
  };
  for (const [el, list] of state.places) {
    if (list.length < 3 || state.moving.has(el) || carried(el)) continue;
    found.push(`${t.describe(el)} moves through ${list.length} places`);
  }

  const hidden = [];
  for (const el of root.querySelectorAll("*")) {
    if (state.before.has(el) || (ignore && el.closest(ignore))) continue;
    if (el.closest('[aria-hidden="true"], [hidden], [inert]')) continue;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? "").trim());
    if (!own || !t.shown(el) || state.opacityOf(el) >= 0.05) continue;
    // Name the outermost element that is invisible.
    let top = el;
    while (top.parentElement && top.parentElement !== root && state.opacityOf(top.parentElement) < 0.05) top = top.parentElement;
    if (!hidden.includes(top)) hidden.push(top);
  }
  for (const el of hidden) found.push(`${t.describe(el)} stays invisible at opacity 0`);
  return found;
}

/**
 * @param {Page} page
 * @param {{ action?: () => Promise<void>, scope?: Locator, ignore?: string, settle?: number }} [options]
 */
export async function expectReducedMotion(page, options = {}) {
  const settle = options.settle ?? 2000;
  await page.emulateMedia({ reducedMotion: "reduce" });
  await install(page);
  const scoped = options.scope ? await options.scope.elementHandle() : null;
  const args = { ignore: options.ignore ?? null, scoped };

  await page.evaluate(startWatch, args);
  if (options.action) await options.action();
  // Wait until nothing runs any more, apart from endless loops, or the time is up.
  await page.waitForTimeout(100);
  await page
    .waitForFunction(
      () => document.getAnimations().every((a) => a.playState !== "running" || a.effect?.getComputedTiming().iterations === Infinity),
      null,
      { timeout: settle, polling: 50 },
    )
    .catch(() => {});
  await page.waitForTimeout(150);
  const found = await page.evaluate(stopWatch, args);

  if (found.length > 0) {
    const shown = found.slice(0, 3).join("; ");
    const more = found.length > 3 ? `, and ${found.length - 3} more` : "";
    throw new JustifiedFinding(
      "VIS-006",
      `with reduced motion on, ${shown}${more}. Swap movement for a short fade or an instant change, stop motion that only decorates, and show content in its final state.`,
    );
  }
}
