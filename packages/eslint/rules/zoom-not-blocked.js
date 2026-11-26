/**
 * justified/zoom-not-blocked, for LAY-003a (a rule): text can be enlarged
 * to 200 percent. The rule is checked when the page runs; this lint rule
 * covers only the parts its how_to_check names that are certain in code: the
 * viewport setting, and a fixed height that cuts off a paragraph.
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
 *   - A box with a fixed height (`h-32`, `max-h-24`, `h-[7.5em]`,
 *     `h-[120px]`) and `overflow-hidden` or `overflow-clip`, both stated
 *     with no variant in a class list the code states in full, that holds
 *     a `p` with text that can wrap. The box is an HTML element or a
 *     `Card`, `CardContent` or `CardDescription`.
 *
 * Left alone: everything else the rule asks, since whether text is cut off
 * or overlaps at 200 percent shows only in the browser; text in viewport
 * units, which the how_to_check leaves to a person to judge at 200
 * percent; a fixed height with no `overflow-hidden`, where text spills
 * instead of being cut, since what it spills over shows only in the
 * browser; boxes whose text is not a paragraph, such as a one-line label
 * or a heading in a bar; text cut on purpose with `truncate` or
 * `line-clamp-*`, or that does not wrap; boxes that also scroll, hold a
 * picture, video, avatar, carousel or scroll area, or fade the cut with a
 * gradient or mask, where the crop is a choice or the exception for
 * truncation with a way to the whole may apply; `h-0` and other heights in
 * a branch, such as a collapsed panel; and values that are computed.
 */
import { defineRule } from "../lib/define-rule.js";
import { parseToken, readClassList } from "../lib/class-token-helpers.js";
import { attributeValue, elementName, getAttribute, hasSpread, staticValue, unwrap, walk } from "../lib/jsx.js";

/** A height that does not grow with its text: `h-32`, `max-h-24`, `h-[7.5em]`, `h-[120px]`. */
const FIXED_HEIGHT = /^(max-)?h-(\d+(\.\d+)?|\[\d+(\.\d+)?(px|rem|em)\])$/;
const CLIPS = /^overflow(-y)?-(hidden|clip)$/;
/** Text that is cut on purpose, or does not wrap. */
const NO_WRAP = /^(truncate|line-clamp-.+|whitespace-nowrap|whitespace-pre|text-ellipsis|text-clip)$/;
const SCROLLS = /^overflow(-[xy])?-(auto|scroll)$/;
/** A fade over the cut, which takes judgement. */
const FADE = /^(bg-gradient-to-|bg-linear-|from-|mask-)/;
/** Pictures, video and scroll areas, whose crop is a choice. */
const MEDIA = /^(img|Image|picture|video|canvas|iframe|svg|ScrollArea|Carousel.*|Avatar.*|AspectRatio)$/;

/** Whether a child is text that can wrap: a word break in written text, or a value. @param {any} c */
const isText = (c) =>
  (c.type === "JSXText" && /\S\s+\S/.test(c.value)) ||
  (c.type === "JSXExpressionContainer" && c.expression.type !== "JSXEmptyExpression");

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
  description:
    "A viewport setting that turns zoom off or caps it below 200 percent, and a fixed height with overflow hidden on a paragraph that can wrap.",
  messages: {
    noScaling:
      "this viewport setting turns zoom off, so people who need larger text cannot zoom or pinch to get it. Remove {{name}}. To stop the zoom when a field gets focus, give fields text of at least 16px instead.",
    lowMaximum:
      "this viewport setting caps zoom at {{value}} times, below twice the size. Remove {{name}}, or set it to 2 or more.",
    clipsText:
      "{{height}} with overflow hidden holds a paragraph that wraps onto more lines as text grows, so at 200 percent its last lines are cut off with no way to read them. Use a minimum height, such as min-h-32, and let the box grow.",
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

    /** The stated class tokens with no variant, when the list is complete and nothing else adds to it. @param {any} opening */
    const plainTokens = (opening) => {
      if (hasSpread(opening)) return undefined;
      const list = readClassList(context, opening);
      if (!list) return [];
      if (!list.complete || list.passThrough) return undefined;
      return list.certain.filter((t) => parseToken(t).variants.length === 0).map((t) => parseToken(t).utility);
    };

    /**
     * A paragraph inside the box whose text can wrap, or undefined when the
     * box holds something that makes the clip a choice: a picture, a scroll
     * area, a fade, or text that is cut with an ellipsis on purpose.
     * @param {any} box A JSXElement.
     */
    const wrappingParagraph = (box) => {
      let paragraph;
      let excluded = false;
      walk(box, context.sourceCode.visitorKeys, (n) => {
        if (excluded) return false;
        if (n.type !== "JSXOpeningElement") return undefined;
        const name = elementName(n) ?? "";
        if (MEDIA.test(name)) excluded = true;
        const all = readClassList(context, n);
        const tokens = all ? all.parts.flatMap((p) => p.tokens).map((t) => parseToken(t).utility) : [];
        if (tokens.some((t) => FADE.test(t) || SCROLLS.test(t))) excluded = true;
        // The box holds the paragraph itself, or is it: a box of text, not a frame round a layout.
        const own = n.parent === box || n.parent.parent === box;
        if (name === "p" && own && n.parent.children.some(isText) && !tokens.some((t) => NO_WRAP.test(t))) paragraph = n;
        return undefined;
      });
      return excluded ? undefined : paragraph;
    };

    return {
      JSXElement(element) {
        const opening = element.openingElement;
        const name = elementName(opening) ?? "";
        if (!/^([a-z]+|Card|CardContent|CardDescription)$/.test(name) || MEDIA.test(name)) return;
        const tokens = plainTokens(opening);
        if (!tokens) return;
        const height = tokens.find((t) => FIXED_HEIGHT.test(t) && !/^(max-)?h-(0|px|\[0[a-z]*\])$/.test(t));
        if (!height || !tokens.some((t) => CLIPS.test(t))) return;
        if (tokens.some((t) => NO_WRAP.test(t) || SCROLLS.test(t))) return;
        if (wrappingParagraph(element)) context.report({ node: opening, messageId: "clipsText", data: { height } });
      },
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
