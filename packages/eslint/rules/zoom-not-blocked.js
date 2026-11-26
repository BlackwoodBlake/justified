/**
 * justified/zoom-not-blocked, for LAY-003a (a rule): text can be enlarged
 * to 200 percent. The rule is checked when the page runs; this lint rule
 * covers only the part its how_to_check names that is certain in code, the
 * viewport setting.
 *
 * Flags:
 *   - In a Next.js viewport object, `userScalable: false` or a
 *     `maximumScale` below 2. The object is the `viewport` export (or any
 *     variable named `viewport`), a `viewport` property such as the older
 *     `metadata.viewport`, what `generateViewport` returns, or any object
 *     with `initialScale` or `width: "device-width"`.
 *   - In a viewport content string, `user-scalable=no` (or `0`, `false`)
 *     or a `maximum-scale` below 2. The string is the `content` of
 *     `<meta name="viewport">`, or any written-out string that holds
 *     `width=device-width` or `initial-scale=`, such as one set with
 *     `setAttribute("content", ...)`.
 *
 * Left alone: everything else the rule asks, since whether text is cut off
 * or overlaps at 200 percent shows only in the browser; text in viewport
 * units and fixed heights on text boxes, which the how_to_check leaves to a
 * person to judge at 200 percent; and values that are computed.
 */
import { defineRule } from "../lib/define-rule.js";
import { attributeValue, elementName, getAttribute, staticValue, unwrap } from "../lib/jsx.js";

const VIEWPORT_STRING = /(^|[,;\s])(width\s*=\s*device-width|initial-scale\s*=)/i;

const TS_WRAPPERS = new Set(["TSAsExpression", "TSSatisfiesExpression", "TSNonNullExpression", "TSTypeAssertion"]);

/** Pairs in a viewport content string. @param {string} text */
const pairs = (text) =>
  text
    .split(/[,;]/)
    .map((p) => p.split("=").map((s) => s.trim().toLowerCase()))
    .filter((p) => p.length === 2);

/** The key of a non-computed property. @param {any} p */
const keyOf = (p) => (p.type === "Property" && !p.computed ? (p.key.name ?? p.key.value) : undefined);

/** Whether an object is a viewport setting. @param {any} object */
function isViewportObject(object) {
  let self = object;
  while (TS_WRAPPERS.has(self.parent?.type)) self = self.parent;
  const parent = self.parent;
  if (parent?.type === "VariableDeclarator" && parent.id.type === "Identifier" && parent.id.name === "viewport") return true;
  if (parent?.type === "Property" && keyOf(parent) === "viewport" && parent.value === self) return true;
  if (parent?.type === "ReturnStatement" || parent?.type === "ArrowFunctionExpression") {
    for (let n = parent; n; n = n.parent)
      if (n.type === "FunctionDeclaration" || n.type === "FunctionExpression" || n.type === "ArrowFunctionExpression") {
        const name = n.id?.name ?? (n.parent?.type === "VariableDeclarator" ? n.parent.id.name : undefined);
        if (name === "generateViewport") return true;
        break;
      }
  }
  return object.properties.some((/** @type {any} */ p) => {
    const key = keyOf(p);
    return key === "initialScale" || (key === "width" && staticValue(p.value) === "device-width");
  });
}

export default defineRule({
  id: "LAY-003a",
  level: "rule",
  verdict: "Requirement",
  description: "A viewport setting that turns zoom off or caps it below 200 percent.",
  messages: {
    noScaling:
      "this viewport setting turns zoom off, so people who need larger text cannot zoom or pinch to get it. Remove {{name}}. To stop the zoom when a field gets focus, give fields text of at least 16px instead.",
    lowMaximum:
      "this viewport setting caps zoom at {{value}} times, below twice the size. Remove {{name}}, or set it to 2 or more.",
  },
  create(context) {
    const reported = new Set();

    /** @param {any} node @param {string} text */
    function checkString(node, text) {
      if (reported.has(node)) return;
      reported.add(node);
      for (const [key, value] of pairs(text)) {
        if (key === "user-scalable" && ["no", "0", "false"].includes(value))
          context.report({ node, messageId: "noScaling", data: { name: "user-scalable" } });
        if (key === "maximum-scale" && value !== "" && Number(value) < 2)
          context.report({ node, messageId: "lowMaximum", data: { name: "maximum-scale", value } });
      }
    }

    /** @param {any} node */
    function stringOf(node) {
      if (node.type === "Literal" && typeof node.value === "string") return node.value;
      if (node.type === "TemplateLiteral" && node.expressions.length === 0) return node.quasis[0].value.cooked;
      return undefined;
    }

    return {
      JSXOpeningElement(opening) {
        if (elementName(opening) !== "meta" || attributeValue(getAttribute(opening, "name")) !== "viewport") return;
        const content = getAttribute(opening, "content");
        const value = attributeValue(content);
        if (typeof value !== "string") return;
        const node = content.value.type === "JSXExpressionContainer" ? unwrap(content.value.expression) : content.value;
        checkString(node, value);
      },
      "Literal, TemplateLiteral"(node) {
        const text = stringOf(node);
        if (text !== undefined && VIEWPORT_STRING.test(text)) checkString(node, text);
      },
      ObjectExpression(object) {
        if (!isViewportObject(object)) return;
        for (const p of object.properties) {
          const key = keyOf(p);
          const v = staticValue(p.value);
          if (key === "userScalable" && v === false)
            context.report({ node: p, messageId: "noScaling", data: { name: "userScalable" } });
          if (key === "maximumScale" && (typeof v === "number" || (typeof v === "string" && v.trim() !== "")) && Number(v) < 2)
            context.report({ node: p, messageId: "lowMaximum", data: { name: "maximumScale", value: String(v) } });
        }
      },
    };
  },
});
