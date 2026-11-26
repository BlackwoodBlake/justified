/**
 * justified/confirm-button-last, for ACT-003a: when a dialog's buttons sit
 * side by side, the confirming one is last, with Cancel before it and no
 * button after it.
 *
 * Looks at the buttons written directly in a `DialogFooter` or
 * `AlertDialogFooter` (through fragments and `<DialogClose asChild>`) in the
 * order they show when they sit in a row, and flags:
 *   - an `AlertDialogAction` that is not the last button, because Cancel or
 *     another button, such as "Remind me later", comes after it;
 *   - with no `AlertDialogAction`, a Cancel that is the last of two or more
 *     buttons. Cancel is `AlertDialogCancel` or a button whose text is
 *     exactly "Cancel";
 *   - the same when classes change the order on screen: `flex-row-reverse`
 *     on the footer, `order-*` on the buttons, at any width where the
 *     footer is a row.
 *
 * The footers are a row from `sm` up and stacked below, in shadcn and in
 * Justified's adapter. Stacked buttons are an exception to the rule, so
 * only the widths where the footer's own classes make a row are checked,
 * and a footer stacked at every width (`sm:flex-col`, or `grid` with no
 * `grid-cols-*`) is left alone.
 *
 * Left alone, because the code does not show the order for certain:
 * footers with a child written as an expression (`cond && …`, `.map()`, a
 * helper call), with an element that is not a button (a nested row, a
 * link, text), or with classes that cannot be read; widths set by other
 * variants such as `max-sm:` or `rtl:`; and `justify-start`, since whether
 * the buttons fill the row depends on their own widths. Which of several
 * plain `Button`s confirms, and multi-step dialogs with Back and Next, take
 * judgement and are left to review. Code written in the reverse order but
 * shown in the right order by `flex-row-reverse` is LAY-002's concern.
 */
import { buttonOf, classNameOf, rowItems, splitClass, visibleText } from "../lib/button-row-helpers.js";
import { defineRule } from "../lib/define-rule.js";
import { elementName } from "../lib/jsx.js";

const FOOTERS = new Set(["DialogFooter", "AlertDialogFooter"]);
/** Tailwind's min-width breakpoints, narrowest first; "" is every width. */
const LEVELS = ["", "sm", "md", "lg", "xl", "2xl"];
const DIRECTIONS = new Set(["flex-row", "flex-row-reverse", "flex-col", "flex-col-reverse"]);
const DISPLAYS = new Set([
  "flex",
  "inline-flex",
  "grid",
  "inline-grid",
  "block",
  "inline-block",
  "inline",
  "hidden",
  "contents",
  "table",
]);

/**
 * How the footer lays out its children at each width: `"row"`,
 * `"reverse"` (a reversed row) or `"stacked"`, or `undefined` if a class
 * that changes the layout cannot be read.
 * @param {string[]} classes
 * @returns {string[] | undefined}
 */
function layoutAt(classes) {
  // The footer's own classes, in shadcn and the adapter: stacked, a row from sm up.
  /** @type {Record<string, string>[]} */
  const set = LEVELS.map(() => ({}));
  set[0].display = "flex";
  set[0].direction = "flex-col";
  set[1].direction = "flex-row";
  for (const cls of classes) {
    const { prefix, utility } = splitClass(cls);
    const key = DIRECTIONS.has(utility)
      ? "direction"
      : DISPLAYS.has(utility)
        ? "display"
        : utility.startsWith("grid-cols-")
          ? "cols"
          : utility.startsWith("grid-flow-")
            ? "flow"
            : undefined;
    if (!key) continue;
    const level = LEVELS.indexOf(prefix);
    if (level < 0) return undefined;
    set[level][key] = utility;
  }
  const current = { display: "", direction: "", cols: "", flow: "" };
  const out = [];
  for (const level of set) {
    Object.assign(current, level);
    if (current.flow) return undefined;
    if (current.display === "flex" || current.display === "inline-flex") {
      out.push(
        current.direction === "flex-row" ? "row" : current.direction === "flex-row-reverse" ? "reverse" : "stacked",
      );
    } else if (current.display === "grid" || current.display === "inline-grid") {
      const m = /^grid-cols-(\d+)$/.exec(current.cols);
      if (current.cols && current.cols !== "grid-cols-none" && !m) return undefined;
      out.push(m && Number(m[1]) >= 2 ? "row" : "stacked");
    } else return undefined;
  }
  return out;
}

/**
 * An item's `order` at each width, from `order-*` classes on it, or
 * `undefined` if one cannot be read.
 * @param {string[]} classes
 * @returns {number[] | undefined}
 */
function ordersAt(classes) {
  /** @type {(number | undefined)[]} */
  const set = LEVELS.map(() => undefined);
  for (const cls of classes) {
    const { prefix, utility } = splitClass(cls);
    const m = /^(-?)order-(.+)$/.exec(utility);
    if (!m) continue;
    const level = LEVELS.indexOf(prefix);
    if (level < 0) return undefined;
    const v = m[2];
    const value =
      v === "first" ? -9999 : v === "last" ? 9999 : v === "none" ? 0 : /^\d+$/.test(v) ? Number(v) : undefined;
    if (value === undefined) return undefined;
    set[level] = m[1] ? -value : value;
  }
  let current = 0;
  return set.map((v) => (current = v ?? current));
}

export default defineRule({
  id: "ACT-003a",
  level: "rule",
  verdict: "Unanimous (3 of 3)",
  description: "A dialog footer whose confirming button is not last in the row, or whose Cancel is last.",
  messages: {
    cancelLast:
      "Cancel is the last button in this dialog's row, where people expect the confirming button. Write Cancel first and the confirming button last.",
    buttonAfterConfirm:
      "this button comes after the confirming AlertDialogAction, so the confirming button is no longer last. Put Cancel and any other buttons before it.",
    reordered:
      "classes on this footer or its buttons change the order on screen, so the confirming button no longer shows last when the buttons sit in a row. Remove flex-row-reverse or order-*, and write Cancel first and the confirming button last.",
  },
  create(context) {
    return {
      JSXElement(node) {
        if (!FOOTERS.has(elementName(node.openingElement) ?? "")) return;
        const items = rowItems(node);
        if (items.length < 2) return;
        const buttons = items.map(buttonOf);
        if (buttons.some((b) => !b)) return;

        const footer = classNameOf(node.openingElement);
        if (!footer.known) return;
        const layout = layoutAt(footer.classes);
        if (!layout) return;

        const kinds = [];
        const orders = [];
        for (const [i, b] of buttons.entries()) {
          const button = /** @type {NonNullable<typeof b>} */ (b);
          const text = visibleText(button.element);
          kinds.push(
            button.name === "AlertDialogAction"
              ? "action"
              : button.name === "AlertDialogCancel" || text?.toLowerCase() === "cancel"
                ? "cancel"
                : "other",
          );
          // Order classes are looked for wherever they can be seen; a part that cannot be read adds none.
          const own = classNameOf(button.element.openingElement).classes;
          const wrapper = items[i] === button.element ? [] : classNameOf(items[i].openingElement).classes;
          const order = ordersAt([...wrapper, ...own]);
          if (!order) return;
          orders.push(order);
        }

        /** The problem with this order, by item index. @param {number[]} seq */
        const problem = (seq) => {
          const last = kinds[seq[seq.length - 1]];
          if (kinds.includes("action"))
            return last === "action" ? undefined : last === "cancel" ? "cancelLast" : "buttonAfterConfirm";
          return last === "cancel" ? "cancelLast" : undefined;
        };

        const source = kinds.map((_k, i) => i);
        let wrongAsWritten = false;
        let wrongOnScreen = false;
        for (const [level, mode] of layout.entries()) {
          if (mode === "stacked") continue;
          const seq = [...source].sort((a, b) => orders[a][level] - orders[b][level] || a - b);
          if (mode === "reverse") seq.reverse();
          if (!problem(seq)) continue;
          if (seq.every((v, i) => v === i)) wrongAsWritten = true;
          else wrongOnScreen = true;
        }

        if (wrongAsWritten) {
          const last = items[items.length - 1];
          context.report({ node: last.openingElement, messageId: /** @type {string} */ (problem(source)) });
        } else if (wrongOnScreen) {
          context.report({ node: node.openingElement, messageId: "reordered" });
        }
      },
    };
  },
});
