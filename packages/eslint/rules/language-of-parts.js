/**
 * justified/language-of-parts, for STR-006a (a rule): a part in another
 * language than the text around it carries `lang` with that language.
 *
 * Flags:
 *   - A written-out `lang` on a native element other than `html` that is
 *     not a valid language tag, such as `en_US` or `cn`. (`html` is
 *     STR-006.) A component's `lang` prop, as in `<CodeBlock lang="bash">`,
 *     often names something else, such as a programming language, so
 *     components are left alone.
 *   - A language picker built with `.map()` from a list written out in the
 *     same file, where the entries' labels are the languages' own names
 *     (*Polski*, *Português*, *한국어*) for at least two languages, and the
 *     element that shows the label has no `lang`, nor any element around
 *     it. With two or more languages in their own names, at least one
 *     differs from the page's, whatever that is.
 *
 * Left alone: `lang=""`, which means the language is unknown; lists that
 * come from another file or from data, since their labels cannot be read;
 * labels written in one language, such as "Polish"; `hreflang`, which this
 * rule neither asks for nor counts; fallback text and user content, whose
 * language shows only in the data; and parts inside a portal, which need
 * judgement about the language of what the portal shows.
 */
import { defineRule } from "../lib/define-rule.js";
import { attributeValue, elementName, getAttribute, hasSpread, parentElement, staticValue, unwrap, walk } from "../lib/jsx.js";
import { invalidTagHint, isAutonym } from "../lib/language-helpers.js";

const CODE_KEYS = ["code", "locale", "lang", "language", "value", "id", "key", "tag"];
const LABEL_KEYS = ["label", "name", "nativeName", "native", "title", "text", "autonym"];

/** The written-out string value of an object's property. @param {any} object @param {string} key */
function prop(object, key) {
  const p = object.properties.find(
    (/** @type {any} */ q) => q.type === "Property" && !q.computed && (q.key.name ?? q.key.value) === key,
  );
  const v = p ? staticValue(p.value) : undefined;
  return typeof v === "string" ? v : undefined;
}

/** A picker list's keys, when the array is one. @param {any} array */
function pickerKeys(array) {
  const objects = array.elements.map(unwrap);
  if (objects.length < 2 || objects.some((o) => o?.type !== "ObjectExpression")) return undefined;
  for (const codeKey of CODE_KEYS)
    for (const labelKey of LABEL_KEYS) {
      const own = new Set();
      for (const o of objects) {
        const code = prop(o, codeKey);
        const label = prop(o, labelKey);
        if (code && label && isAutonym(label, code)) own.add(code.split("-")[0].toLowerCase());
      }
      if (own.size >= 2) return { codeKey, labelKey };
    }
  return undefined;
}

export default defineRule({
  id: "STR-006a",
  level: "rule",
  verdict: "Requirement",
  description: "A lang that is not a valid tag, or language picker entries in their own languages with no lang.",
  messages: {
    invalidLang: 'lang="{{value}}" is not a valid language tag: {{hint}}. A screen reader cannot switch its voice for it.',
    pickerNoLang:
      "these entries show each language's name in that language, with no lang, so a screen reader reads them with the page's sounds. Add lang={{code}} to the element that holds the name, and leave it out for the page's own language if you like.",
  },
  create(context) {
    const keys = /** @type {any} */ (context.sourceCode.visitorKeys);
    /** Picker lists by variable name. @type {Map<string, { codeKey: string, labelKey: string }>} */
    const lists = new Map();

    return {
      VariableDeclarator(node) {
        const init = unwrap(node.init);
        if (node.id.type !== "Identifier" || init?.type !== "ArrayExpression") return;
        const k = pickerKeys(init);
        if (k) lists.set(node.id.name, k);
      },
      JSXOpeningElement(opening) {
        const name = elementName(opening);
        // Only native elements: a lowercase name with no dot or namespace.
        if (!name || name === "html" || !/^[a-z][a-z0-9-]*$/.test(name)) return;
        const value = attributeValue(getAttribute(opening, "lang"));
        if (typeof value !== "string") return;
        const hint = invalidTagHint(value);
        if (hint) context.report({ node: getAttribute(opening, "lang"), messageId: "invalidLang", data: { value, hint } });
      },
      "CallExpression:exit"(call) {
        const callee = unwrap(call.callee);
        if (callee?.type !== "MemberExpression" || callee.computed || callee.property.name !== "map") return;
        const list = unwrap(callee.object);
        const k = list?.type === "Identifier" ? lists.get(list.name) : undefined;
        const fn = unwrap(call.arguments[0]);
        if (!k || !fn || !["ArrowFunctionExpression", "FunctionExpression"].includes(fn.type)) return;
        const param = fn.params[0];
        /** Whether an expression reads the entry's label. @type {(n: any) => boolean} */
        let readsLabel;
        let codeText;
        if (param?.type === "Identifier") {
          readsLabel = (n) =>
            n.type === "MemberExpression" &&
            !n.computed &&
            unwrap(n.object)?.type === "Identifier" &&
            unwrap(n.object).name === param.name &&
            n.property.name === k.labelKey;
          codeText = `{${param.name}.${k.codeKey}}`;
        } else if (param?.type === "ObjectPattern") {
          const local = (/** @type {string} */ key) => {
            const p = param.properties.find((q) => q.type === "Property" && (q.key.name ?? q.key.value) === key);
            return p?.value?.type === "Identifier" ? p.value.name : undefined;
          };
          const labelName = local(k.labelKey);
          if (!labelName) return;
          readsLabel = (n) => n.type === "Identifier" && n.name === labelName;
          codeText = `{${local(k.codeKey) ?? k.codeKey}}`;
        } else return;

        /** @type {any[]} */
        const holders = [];
        walk(fn.body, keys, (n) => {
          if (n !== fn.body && (n.type === "ArrowFunctionExpression" || n.type === "FunctionExpression")) return false;
          if (n.type === "JSXExpressionContainer" && n.parent?.type === "JSXElement" && readsLabel(unwrap(n.expression)))
            holders.push(n.parent);
          return undefined;
        });
        for (const holder of holders) {
          let marked = false;
          for (let el = holder; el; el = parentElement(el)) {
            const o = el.openingElement;
            if (getAttribute(o, "lang") || hasSpread(o)) {
              marked = true;
              break;
            }
            if (el.range[0] < fn.range[0]) break;
          }
          if (!marked) context.report({ node: holder.openingElement, messageId: "pickerNoLang", data: { code: codeText } });
        }
      },
    };
  },
});
