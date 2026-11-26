/**
 * justified/table-has-title, for TBL-004 (a guideline): every data table has
 * a visible title, tied to the table in code as its caption or through
 * aria-labelledby.
 *
 * Flags a `Table` or `table` that has all of these:
 *   - no `TableCaption` or `caption` among its children;
 *   - no `aria-label`, `aria-labelledby` or spread props;
 *   - no `role` of `presentation` or `none`, which marks a layout table;
 *   - at least one `TableHead` or `th` inside it, which marks a data table;
 *   - only children the rule knows (`TableHeader`, `TableBody`,
 *     `TableFooter`, `TableRow`, `thead`, `tbody`, `tfoot`, `tr`,
 *     `colgroup`, and `.map()` or conditions that give them). A child of
 *     another kind, such as a component of the project's own, may draw a
 *     caption, so the table is left alone.
 *
 * Left alone: a table named by an expression, such as `aria-label={label}`,
 * even if the value may be empty, and a table in a `figure` beside its
 * `figcaption` or `TableCaption`. Whether a name matches the visible title
 * above the table, and whether a title says what the rows have in common,
 * need the page and a judgement. The review skill covers them.
 */
import { defineRule } from "../lib/define-rule.js";
import { attributeValue, elementName, getAttribute, hasSpread, unwrap, walk } from "../lib/jsx.js";

const TABLES = new Set(["Table", "table"]);
const CAPTIONS = new Set(["TableCaption", "caption"]);
const HEADERS = new Set(["TableHead", "th"]);
const PARTS = new Set([
  "TableHeader",
  "TableBody",
  "TableFooter",
  "TableRow",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "colgroup",
]);

/** @param {any} element A JSXElement. */
const nameOf = (element) => elementName(element.openingElement) ?? "";

/**
 * What a child gives: "part" for known table parts or nothing, "caption"
 * when it may give a caption, "unknown" otherwise.
 * @param {any} node A JSX child or an expression.
 * @returns {"part" | "caption" | "unknown"}
 */
function kindOf(node) {
  const n = unwrap(node);
  if (!n) return "part";
  switch (n.type) {
    case "JSXText":
      return n.value.trim() === "" ? "part" : "unknown";
    case "JSXEmptyExpression":
      return "part";
    case "JSXExpressionContainer":
      return kindOf(n.expression);
    case "JSXElement": {
      const name = nameOf(n);
      if (CAPTIONS.has(name)) return "caption";
      return PARTS.has(name) ? "part" : "unknown";
    }
    case "JSXFragment":
      return worst(n.children.map(kindOf));
    case "Literal":
      return n.value === null || typeof n.value === "boolean" ? "part" : "unknown";
    case "Identifier":
      return n.name === "undefined" ? "part" : "unknown";
    case "ConditionalExpression":
      return worst([kindOf(n.consequent), kindOf(n.alternate)]);
    case "LogicalExpression":
      return n.operator === "&&" ? kindOf(n.right) : worst([kindOf(n.left), kindOf(n.right)]);
    case "CallExpression": {
      // rows.map((row) => <TableRow ... />), with an expression body or a single return.
      const callee = unwrap(n.callee);
      if (callee.type !== "MemberExpression" || callee.computed || callee.property.name !== "map") return "unknown";
      const fn = n.arguments[0];
      if (!fn || (fn.type !== "ArrowFunctionExpression" && fn.type !== "FunctionExpression")) return "unknown";
      if (fn.body.type !== "BlockStatement") return kindOf(fn.body);
      const returns = fn.body.body.filter((s) => s.type === "ReturnStatement");
      return returns.length === 1 ? kindOf(returns[0].argument) : "unknown";
    }
    default:
      return "unknown";
  }
}

/** @param {("part" | "caption" | "unknown")[]} kinds */
const worst = (kinds) => (kinds.includes("caption") ? "caption" : kinds.includes("unknown") ? "unknown" : "part");

/**
 * Whether the table holds a header cell anywhere inside it.
 * @param {any} table
 * @param {Record<string, readonly string[]>} keys
 */
function holdsHeaderCell(table, keys) {
  let found = false;
  walk(table, keys, (n) => {
    if (found) return false;
    if (n.type === "JSXElement" && n !== table && HEADERS.has(nameOf(n))) found = true;
    return undefined;
  });
  return found;
}

export default defineRule({
  id: "TBL-004",
  level: "guideline",
  verdict: "Insufficient evidence (1 of 3 judges spoke)",
  description: "A data table with no caption, aria-labelledby or aria-label.",
  type: "suggestion",
  messages: {
    noTitle:
      'this data table has no title in code: no TableCaption, aria-labelledby or aria-label, so a screen reader announces it only as "table". Give it a visible title that says what its rows have in common, as a TableCaption or as a heading the table points to with aria-labelledby.',
  },
  create(context) {
    const keys = context.sourceCode.visitorKeys;
    return {
      JSXElement(node) {
        const opening = node.openingElement;
        if (!TABLES.has(nameOf(node)) || opening.selfClosing) return;
        if (hasSpread(opening) || getAttribute(opening, "aria-label") || getAttribute(opening, "aria-labelledby"))
          return;
        const role = attributeValue(getAttribute(opening, "role"));
        if (getAttribute(opening, "role") && role !== "table" && role !== "grid") return;
        // A table in a figure with its caption, as react-aria's shadcn base writes TableCaption: whether that caption
        // counts as the table's own takes judgement.
        const parent = node.parent;
        if (
          parent?.type === "JSXElement" &&
          elementName(parent.openingElement) === "figure" &&
          parent.children.some(
            (/** @type {any} */ c) =>
              c.type === "JSXElement" && /^(figcaption|TableCaption)$/.test(elementName(c.openingElement) ?? ""),
          )
        )
          return;
        if (worst(node.children.map(kindOf)) !== "part") return;
        if (!holdsHeaderCell(node, keys)) return;
        context.report({ node: opening, messageId: "noTitle" });
      },
    };
  },
});
