/**
 * justified/focus-stays-visible, for KBD-001 (a requirement): whenever an
 * element has keyboard focus, a visible indicator marks it.
 *
 * Flags a native focusable element that removes the browser's focus
 * outline and puts nothing in its place: `outline-none`, `outline-hidden`
 * or `outline-0` (with or without `focus:` or `focus-visible:`), or a
 * `style` that sets `outline` or `outlineStyle` to none or 0, on an
 * element whose class list holds no other focus style at all. Any class
 * behind a focus variant counts as one (`focus-visible:ring-2`,
 * `focus:bg-accent`, `group-focus-within:`, `has-[:focus-visible]:`),
 * except one that only takes something away, such as `focus:ring-0`.
 *
 * Native focusable means `button`, `a` with `href`, `input` that is not
 * hidden, `select`, `textarea`, `summary`, `iframe`, any element with a
 * `tabIndex` of 0 or more or `contentEditable`, and a router `Link`
 * (from next/link, react-router or @tanstack/react-router), which renders
 * a plain `a`.
 *
 * Left alone:
 *   - shadcn components such as `Button` or `Input` with `outline-none`:
 *     their own classes keep the focus ring, and `cn` does not drop it.
 *   - Class lists the code does not state in full (a prop, a call such as
 *     `buttonVariants()`, an imported constant such as `focusRing`), and
 *     elements that spread props, which may bring a focus style.
 *   - Elements with `tabIndex={-1}`, which only a script focuses, and
 *     disabled controls (the rule's exception).
 *   - An indicator drawn by another element: an ancestor with a focus
 *     class such as `focus-within:ring-2` (a search box that rings its
 *     wrapper), a `group` whose children style `group-focus:`, or a `peer`,
 *     whose siblings may style `peer-focus:`.
 *   - Elements with a class that is not a Tailwind utility, such as
 *     `focus-ring` or `btn`: it comes from a stylesheet the rule cannot
 *     read, which may give the focus style. A wrong report costs more than
 *     a missed one here.
 *   - Whether a focus style is plain enough to see, such as `focus:bg-accent`
 *     alone: that takes judgement, and the review skill covers it.
 */
import { defineRule } from "../lib/define-rule.js";
import { allTokens, parseToken, readClassList } from "../lib/class-token-helpers.js";
import { attributeValue, elementName, getAttribute, hasSpread, parentElement, unwrap, walk } from "../lib/jsx.js";

const ALWAYS_FOCUSABLE = new Set(["button", "select", "textarea", "summary", "iframe"]);
const LINK_SOURCES = /^(next\/link|react-router|react-router-dom|@tanstack\/react-router)$/;
const REMOVES_OUTLINE = /^outline-(none|hidden|0)$/;
/** Utilities behind a focus variant that only take an indicator away. */
const TAKES_AWAY = /^(outline-(none|hidden|0)|ring-0|ring-transparent|shadow-none|border-0|border-transparent)$/;

/**
 * Tailwind utilities by their first part. A class with no variant that is
 * not one of them, such as `focus-ring` or `btn`, comes from a stylesheet
 * the rule cannot read, which may draw a focus style.
 */
const TAILWIND =
  /^-?(\[.+\]|\(.+\)|(sr-only|not-sr-only|peer|group|container|block|inline|inline-block|inline-flex|inline-grid|flex|grid|hidden|contents|table|flow-root|list-item|static|fixed|absolute|relative|sticky|visible|invisible|collapse|isolate|truncate|italic|not-italic|underline|overline|line-through|no-underline|uppercase|lowercase|capitalize|normal-case|antialiased|subpixel-antialiased|ordinal|slashed-zero|tabular-nums|proportional-nums|lining-nums|oldstyle-nums|diagonal-fractions|stacked-fractions|normal-nums|grow|shrink|transform|filter|border|rounded|shadow|ring|outline|blur|transition|resize|prose|dark)(\/\S+)?$|(p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|w|h|size|min-w|min-h|max-w|max-h|inset|inset-x|inset-y|top|right|bottom|left|start|end|z|gap|gap-x|gap-y|space-x|space-y|text|font|leading|tracking|bg|from|via|to|border|divide|outline|ring|ring-offset|shadow|inset-shadow|inset-ring|rounded|opacity|cursor|select|pointer-events|items|justify|content|self|place|order|col|row|grid-cols|grid-rows|auto-cols|auto-rows|grid-flow|flex|basis|grow|shrink|overflow|overscroll|object|aspect|columns|break|box|float|clear|decoration|underline-offset|indent|align|whitespace|wrap|hyphens|list|line-clamp|fill|stroke|transition|duration|delay|ease|animate|scale|rotate|translate|skew|origin|perspective|backface|transform|blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|saturate|sepia|backdrop|mix-blend|bg-blend|appearance|resize|user|fade|zoom|slide|spin|caret|accent|scroll|snap|touch|will-change|forced-color-adjust|field-sizing|color-scheme|table|border-collapse|border-spacing|caption|tab|mask|text-shadow|stroke|outline-offset|font-stretch|inline|block|shadow|display)-\S+)$/;

/** Whether a token draws something on focus. @param {string} token */
export function isFocusStyle(token) {
  const { variants, utility } = parseToken(token);
  return variants.some((v) => v.includes("focus")) && !TAKES_AWAY.test(utility);
}

/** Whether a style value removes the outline. @param {any} value */
const noOutline = (value) => {
  const v = unwrap(value);
  if (v?.type !== "Literal") return false;
  return v.value === 0 || (typeof v.value === "string" && /^(none|0|0px)(\s|$)/.test(v.value.trim()));
};

export default defineRule({
  id: "KBD-001",
  level: "rule",
  verdict: "Requirement",
  description: "A native focusable element that removes the focus outline and has no other focus style.",
  messages: {
    outlineRemoved:
      "this {{name}} removes the focus outline with {{token}} and has no other focus style, so someone using the keyboard cannot see when it has focus. Add a visible focus style, such as focus-visible:ring-2 focus-visible:ring-ring, or keep the outline.",
  },
  create(context) {
    const links = new Set();

    /** @param {any} node */
    const focusable = (node) => {
      const name = elementName(node);
      if (!name) return false;
      const disabled = attributeValue(getAttribute(node, "disabled"));
      if (disabled === true || disabled === "true" || disabled === "") return false;
      const tabIndex = getAttribute(node, "tabIndex");
      if (tabIndex) {
        const v = attributeValue(tabIndex);
        const n = typeof v === "string" ? Number(v) : v;
        // A negative tabIndex takes the element out of the Tab order; only a script focuses it.
        if (typeof n === "number") return n >= 0;
        return false;
      }
      if (ALWAYS_FOCUSABLE.has(name)) return true;
      if (name === "a" || links.has(name)) return Boolean(getAttribute(node, "href") || getAttribute(node, "to"));
      if (name === "input") return attributeValue(getAttribute(node, "type")) !== "hidden";
      const editable = getAttribute(node, "contentEditable");
      if (editable) {
        const v = attributeValue(editable);
        return v === true || v === "true" || v === "" || v === "plaintext-only";
      }
      return false;
    };

    /** Focus-variant tokens in an element's class list, read as far as the code states it. @param {any} opening */
    const focusTokens = (opening) => {
      const list = readClassList(context, opening);
      return list ? allTokens(list).filter((t) => parseToken(t).variants.some((v) => v.includes("focus"))) : [];
    };

    /** Whether another element may draw the indicator. @param {any} node @param {string[]} tokens */
    const focusShownElsewhere = (node, tokens) => {
      const utilities = tokens.map((t) => parseToken(t).utility);
      if (utilities.some((u) => /^peer(\/|$)/.test(u))) return true;
      for (let el = parentElement(node.parent); el; el = parentElement(el))
        if (focusTokens(el.openingElement).length) return true;
      if (utilities.some((u) => /^group(\/|$)/.test(u))) {
        let found = false;
        walk(node.parent, context.sourceCode.visitorKeys, (n) => {
          if (found) return false;
          if (n.type === "JSXOpeningElement" && n !== node && focusTokens(n).length) found = true;
          return undefined;
        });
        if (found) return true;
      }
      return false;
    };

    return {
      ImportDeclaration(node) {
        if (!LINK_SOURCES.test(String(node.source.value))) return;
        for (const s of node.specifiers) {
          if (s.type !== "ImportSpecifier" && s.type !== "ImportDefaultSpecifier") continue;
          const imported =
            s.type === "ImportDefaultSpecifier"
              ? "Link"
              : s.imported.type === "Identifier"
                ? s.imported.name
                : s.imported.value;
          if (imported === "Link") links.add(s.local.name);
        }
      },
      JSXOpeningElement(node) {
        if (hasSpread(node) || !focusable(node)) return;
        const list = readClassList(context, node);
        if (list && (!list.complete || list.passThrough)) return;
        const tokens = list ? allTokens(list) : [];
        if (tokens.some(isFocusStyle)) return;
        // A class from the project's own stylesheet, such as focus-ring, may draw the indicator: stay quiet.
        if (tokens.some((t) => !parseToken(t).variants.length && !TAILWIND.test(parseToken(t).utility.replace(/^!|!$/g, ""))))
          return;
        if (focusShownElsewhere(node, tokens)) return;

        // Only an outline removed whatever the branches do: a branch may not be taken for this element.
        let token = (list?.certain ?? []).find((t) => REMOVES_OUTLINE.test(parseToken(t).utility));
        let reportOn = getAttribute(node, "className");
        if (!token) {
          const style = getAttribute(node, "style");
          const object = style?.value?.type === "JSXExpressionContainer" ? unwrap(style.value.expression) : undefined;
          if (object?.type !== "ObjectExpression") return;
          const property = object.properties.find(
            (p) =>
              p.type === "Property" &&
              !p.computed &&
              ["outline", "outlineStyle", "outlineWidth"].includes(
                p.key.type === "Identifier" ? p.key.name : p.key.value,
              ) &&
              noOutline(p.value),
          );
          if (!property) return;
          token = context.sourceCode.getText(property);
          reportOn = property;
        }
        context.report({
          node: reportOn ?? node,
          messageId: "outlineRemoved",
          data: { name: elementName(node) ?? "element", token },
        });
      },
    };
  },
});
