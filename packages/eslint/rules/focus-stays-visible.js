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
