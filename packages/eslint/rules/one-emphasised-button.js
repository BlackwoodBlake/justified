/**
 * justified/one-emphasised-button, for ACT-002a: among the buttons shown
 * together for one task, at most one has the most emphasised style.
 *
 * Flags a row with two or more emphasised buttons. A row is the direct
 * children of `DialogFooter`, `AlertDialogFooter`, `SheetFooter`,
 * `DrawerFooter` or `CardFooter`, looking through fragments and through
 * `<DialogClose asChild>` (and `SheetClose`, `DrawerClose`), or a `div`
 * written directly inside a `<form>` that holds only buttons, at least two.
 * A `Button` or `AlertDialogAction` is emphasised when its `variant` is
 * `"default"` or `"destructive"`, or it has none, since shadcn's default
 * variant is the filled one; `className={buttonVariants({ variant })}`
 * counts as its variant. For `a ? <X /> : <Y />` each branch is counted on
 * its own, since they never show together.
 *
 * Left alone, because the code does not say for certain what shows:
 * buttons behind `cond && …` or made in a `.map()`, a `variant` that is a
 * variable or a prop, a spread that may set it, a `className` that cannot
 * be read or that sets its own `bg-*` colour, `AlertDialogCancel` (always
 * the outline style), and rows nested inside other elements. A row with no
 * emphasised button is fine. Whether a filled Cancel steers people the
 * wrong way takes judgement and is left to review.
 *
 * Options: `emphasisedVariants` (default `["default", "destructive"]`) and
 * `defaultVariant` (default `"default"`), for a project whose `Button`
 * has other names or another default.
 */
import { classNameOf, buttonOf, rowItems, splitClass, variantsOf } from "../lib/button-row-helpers.js";
import { defineRule } from "../lib/define-rule.js";
import { elementName, getAttribute, unwrap } from "../lib/jsx.js";

const FOOTERS = new Set(["DialogFooter", "AlertDialogFooter", "SheetFooter", "DrawerFooter", "CardFooter"]);
const STYLED = new Set(["Button", "AlertDialogAction"]);

export default defineRule({
  id: "ACT-002a",
  level: "rule",
  verdict: "Unanimous (3 of 3)",
  description: "Two or more buttons with the most emphasised style in one row, such as a dialog footer.",
  type: "suggestion",
  schema: [
    {
      type: "object",
      properties: {
        emphasisedVariants: { type: "array", items: { type: "string" }, uniqueItems: true },
        defaultVariant: { type: "string" },
      },
      additionalProperties: false,
    },
  ],
  messages: {
    twoEmphasised:
      "{{count}} buttons in this row have the most emphasised style ({{variants}}). Keep that style for the one action most people want here and give the others a quieter variant, such as outline, secondary or ghost.",
  },
  create(context) {
    const options = context.options[0] ?? {};
    const emphasised = new Set(options.emphasisedVariants ?? ["default", "destructive"]);
    const defaultVariant = options.defaultVariant ?? "default";

    /** 1 if the item is an emphasised button for certain, else 0. @param {any} item */
    function emphasisOf(item) {
      const button = buttonOf(item);
      if (!button || !STYLED.has(button.name)) return 0;
      const opening = button.element.openingElement;
      const variants = variantsOf(opening);
      if (variants === undefined) return 0;
      const list = variants ?? [defaultVariant];
      if (!list.every((v) => emphasised.has(v))) return 0;
      const className = getAttribute(opening, "className");
      const call = unwrap(className?.value?.expression);
      const fromVariants =
        call?.type === "CallExpression" && call.callee.type === "Identifier" && call.callee.name === "buttonVariants";
      if (className && !fromVariants) {
        // A class list that cannot be read, or one with its own background, may change the look.
        const { classes, known } = classNameOf(opening);
        if (!known) return 0;
        if (classes.some((c) => splitClass(c).prefix === "" && splitClass(c).utility.startsWith("bg-"))) return 0;
      }
      return 1;
    }

    /** How many emphasised buttons the items show at once, at most. @param {any[]} items */
    function count(items) {
      let total = 0;
      for (const item of items) {
        if (item.type === "JSXExpressionContainer") {
          const expr = unwrap(item.expression);
          if (expr?.type === "ConditionalExpression")
            total += Math.max(branch(expr.consequent), branch(expr.alternate));
          continue;
        }
        total += emphasisOf(item);
      }
      return total;
    }

    /** @param {any} node One branch of a condition. */
    function branch(node) {
      const n = unwrap(node);
      if (n?.type === "JSXFragment") return count(rowItems(n));
      if (n?.type === "JSXElement") return count([n]);
      return 0;
    }

    /** Whether the element is a row of buttons. @param {any} element */
    function isRow(element) {
      const name = elementName(element.openingElement) ?? "";
      if (FOOTERS.has(name)) return true;
      if (name !== "div") return false;
      const parent = element.parent;
      if (parent?.type !== "JSXElement" || elementName(parent.openingElement) !== "form") return false;
      const items = rowItems(element);
      return items.length >= 2 && items.every((i) => buttonOf(i));
    }

    return {
      JSXElement(node) {
        if (!isRow(node)) return;
        const n = count(rowItems(node));
        if (n < 2) return;
        context.report({
          node: node.openingElement,
          messageId: "twoEmphasised",
          data: {
            count: String(n),
            variants: `variant ${[...emphasised].map((v) => `"${v}"`).join(" or ")}${emphasised.has(defaultVariant) ? ", or no variant" : ""}`,
          },
        });
      },
    };
  },
});
