/**
 * input-value-helpers.js: reading what kind of value a text field takes, for
 * justified/input-type-matches-value (FRM-014), justified/digit-field-keypad
 * (FRM-014a), justified/digit-string-not-number (FRM-014b) and
 * justified/separators-accepted (FRM-017a).
 *
 * A field's kind comes from what the code states: its `autoComplete`
 * value, its written-out label, and the Zod schema entry its form field
 * name points at. Like `jsx.js`, each helper returns `undefined` when it
 * cannot see the answer for certain, and the rules then stay quiet.
 */
import { attributeValue, elementName, getAttribute, parentElement, staticValue, unwrap, walk } from "./jsx.js";
import { normalize, visibleText } from "./name-helpers.js";

export const INPUTS = new Set(["Input", "input"]);
const LABELS = new Set(["label", "Label", "FieldLabel", "FormLabel"]);
const NO_ICONS = new Set();

/** Whether the element is a shadcn `Input` or a native `input`. @param {any} opening */
export const isInput = (opening) => INPUTS.has(elementName(opening) ?? "");

/**
 * Whether a spread is one that never sets `type`, `inputMode` or
 * `maxLength`: react-hook-form's `{...field}` or `{...register("x")}`.
 * @param {any} attribute A JSXSpreadAttribute.
 */
function isFormSpread(attribute) {
  const a = unwrap(attribute.argument);
  if (a?.type === "Identifier") return a.name === "field";
  if (a?.type !== "CallExpression") return false;
  const c = unwrap(a.callee);
  if (c.type === "Identifier") return c.name === "register";
  return c.type === "MemberExpression" && !c.computed && c.property.type === "Identifier" && c.property.name === "register";
}

/** Whether every spread on the element is a form spread, so the written props are the whole story. @param {any} opening */
export const onlyFormSpreads = (opening) =>
  opening.attributes.every((/** @type {any} */ a) => a.type !== "JSXSpreadAttribute" || isFormSpread(a));

/**
 * An attribute's value for certain: the string, `null` when it is absent
 * and the props are fully known, and `undefined` when it cannot be known.
 * @param {any} opening
 * @param {string} name
 */
export function propValue(opening, name) {
  const attribute = getAttribute(opening, name) ?? getAttribute(opening, name.toLowerCase());
  if (!attribute) return onlyFormSpreads(opening) ? null : undefined;
  const v = attributeValue(attribute);
  return typeof v === "string" ? v : typeof v === "number" ? String(v) : undefined;
}

/**
 * The field name in an `autoComplete` value, such as "tel" for
 * "shipping mobile tel", or `null`/`undefined` as `propValue`.
 * @param {any} opening
 */
export function autocompleteField(opening) {
  const v = propValue(opening, "autoComplete");
  if (typeof v !== "string") return v;
  const tokens = v.toLowerCase().split(/\s+/).filter(Boolean);
  return tokens.filter((t) => t !== "webauthn").pop() ?? null;
}

/**
 * Whether the field is a text field: no `type`, or `type="text"`.
 * `undefined` when the type cannot be known.
 * @param {any} opening
 */
export function isTextType(opening) {
  const type = propValue(opening, "type");
  if (type === undefined) return undefined;
  return type === null || type.toLowerCase() === "text";
}

/** Label text with parts in parentheses and a required star left out, normalised. @param {string} text */
export const labelWords = (text) => normalize(text.replace(/\([^)]*\)/g, " ").replace(/\*/g, " "));

/**
 * Collects, for one file, the text of every label with a written-out
 * `htmlFor`. Call `see` on every JSXElement, then `forId` at Program:exit.
 */
export function labelIndex() {
  /** @type {Map<string, string | undefined>} */
  const byId = new Map();
  return {
    /** @param {any} element */
    see(element) {
      const opening = element.openingElement;
      if (!LABELS.has(elementName(opening) ?? "")) return;
      const target = attributeValue(getAttribute(opening, "htmlFor"));
      if (typeof target !== "string") return;
      // Two labels for one id leave the label unknown.
      byId.set(target, byId.has(target) ? undefined : visibleText(element, NO_ICONS));
    },
    /** @param {string} id */
    forId: (id) => byId.get(id),
  };
}

/**
 * The field's written-out label, normalised, or `undefined`: its
 * `aria-label`, a `Field label="..."` around it, a `label` or `Label` that
 * wraps it, the `FormLabel` of the shadcn `FormItem` it sits in, or a label
 * whose `htmlFor` matches its `id`.
 * @param {any} element A JSXElement.
 * @param {ReturnType<typeof labelIndex>} [labels]
 */
export function fieldLabel(element, labels) {
  const opening = element.openingElement;
  const aria = attributeValue(getAttribute(opening, "aria-label"));
  if (typeof aria === "string") return labelWords(aria);
  const parent = parentElement(element);
  for (let el = parent; el; el = parentElement(el)) {
    const name = elementName(el.openingElement) ?? "";
    const base = name.split(".").pop();
    if (base === "Field") {
      const label = attributeValue(getAttribute(el.openingElement, "label"));
      if (typeof label === "string") return labelWords(label);
    }
    if (name === "label" || name === "Label") {
      const text = visibleText(el, NO_ICONS, (e) => e === element);
      return text === undefined ? undefined : labelWords(text);
    }
    if (name === "FormItem") {
      const formLabel = el.children.find(
        (/** @type {any} */ c) => c.type === "JSXElement" && elementName(c.openingElement) === "FormLabel",
      );
      const text = formLabel ? visibleText(formLabel, NO_ICONS) : undefined;
      return text === undefined ? undefined : labelWords(text);
    }
    // Past a field wrapper or a form, the label belongs to something else.
    if (base === "FormField" || name === "form" || base === "FieldGroup" || base === "FieldSet") break;
  }
  const id = attributeValue(getAttribute(opening, "id"));
  if (typeof id === "string" && labels) {
    const text = labels.forId(id);
    if (text !== undefined) return labelWords(text);
  }
  return undefined;
}

/** Words from an identifier such as "cardNumber" or "card_number": "card number". @param {string} name */
export const identifierWords = (name) => normalize(name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " "));

/**
 * Other written-out names of the field, as words: `name`, `id`,
 * `placeholder` and the `name` of the shadcn `FormField` around it.
 * Used to stay quiet, never to report.
 * @param {any} element
 */
export function otherNames(element) {
  const opening = element.openingElement;
  const out = [];
  for (const n of ["name", "id", "placeholder"]) {
    const v = attributeValue(getAttribute(opening, n));
    if (typeof v === "string") out.push(identifierWords(v));
  }
  const form = formFieldName(element);
  if (form) out.push(identifierWords(form));
  return out;
}

/**
 * The form field name the element is bound to: the `name` of the
 * `FormField` (or react-hook-form `Controller`) whose render holds it,
 * or the argument of a `{...register("x")}` spread on it.
 * @param {any} element
 */
export function formFieldName(element) {
  for (const a of element.openingElement.attributes) {
    if (a.type !== "JSXSpreadAttribute") continue;
    const call = unwrap(a.argument);
    if (call?.type === "CallExpression" && isFormSpread(a)) {
      const v = staticValue(call.arguments[0]);
      if (typeof v === "string") return v;
    }
  }
  for (let el = parentElement(element); el; el = parentElement(el)) {
    const name = elementName(el.openingElement)?.split(".").pop();
    if (name === "FormField" || name === "Controller") {
      const v = attributeValue(getAttribute(el.openingElement, "name"));
      return typeof v === "string" ? v : undefined;
    }
  }
  return undefined;
}

/** The method names of a call chain, root first, and the root callee. @param {any} node */
export function callChain(node) {
  /** @type {{ name: string, call: any }[]} */
  const calls = [];
  let n = unwrap(node);
  while (n?.type === "CallExpression") {
    const c = unwrap(n.callee);
    if (c.type !== "MemberExpression" || c.computed || c.property.type !== "Identifier") {
      calls.unshift({ name: c.type === "Identifier" ? c.name : "", call: n });
      return { calls, root: c };
    }
    calls.unshift({ name: c.property.name, call: n });
    n = unwrap(c.object);
  }
  return { calls, root: n };
}

/**
 * The entries of every `z.object({...})` in the file: key to value.
 * A key that appears twice with different values is left out.
 * @param {any} program
 * @param {Record<string, readonly string[]>} keys
 */
export function schemaEntries(program, keys) {
  /** @type {Map<string, any>} */
  const out = new Map();
  /** @type {Set<string>} */
  const twice = new Set();
  walk(program, keys, (n) => {
    if (n.type !== "CallExpression") return;
    const c = unwrap(n.callee);
    if (
      c.type !== "MemberExpression" ||
      c.computed ||
      c.property.name !== "object" ||
      unwrap(c.object)?.type !== "Identifier" ||
      unwrap(c.object).name !== "z"
    )
      return;
    const arg = unwrap(n.arguments[0]);
    if (arg?.type !== "ObjectExpression") return;
    for (const p of arg.properties) {
      if (p.type !== "Property" || p.computed) continue;
      const key = p.key.type === "Identifier" ? p.key.name : typeof p.key.value === "string" ? p.key.value : undefined;
      if (!key) continue;
      if (out.has(key) && out.get(key) !== p.value) twice.add(key);
      out.set(key, p.value);
    }
  });
  for (const k of twice) out.delete(k);
  return out;
}

/**
 * The regular expressions in `.regex(/.../)` calls inside a schema value.
 * @param {any} value
 * @param {Record<string, readonly string[]>} keys
 * @returns {{ source: string, flags: string, node: any }[]}
 */
export function schemaRegexes(value, keys) {
  const out = [];
  walk(value, keys, (n) => {
    if (n.type !== "CallExpression") return;
    const c = unwrap(n.callee);
    if (c.type !== "MemberExpression" || c.computed || c.property.name !== "regex") return;
    const r = unwrap(n.arguments[0]);
    if (r?.type === "Literal" && r.regex) out.push({ source: r.regex.pattern, flags: r.regex.flags, node: n });
  });
  return out;
}

/** Whether a schema value cleans the value first: a `.transform()`, `.pipe()` or `z.preprocess()` anywhere in it. @param {any} value @param {Record<string, readonly string[]>} keys */
export function schemaCleans(value, keys) {
  let found = false;
  walk(value, keys, (n) => {
    if (n.type === "CallExpression") {
      const c = unwrap(n.callee);
      if (c.type === "MemberExpression" && !c.computed && /^(transform|pipe|preprocess)$/.test(c.property.name))
        found = true;
    }
  });
  return found;
}

const DIGIT = String.raw`(?:\\d|\[0-9\])`;
const COUNT = String.raw`(?:\{\d+(?:,\d*)?\}|[+*?])?`;
const DOT = String.raw`(?:\\\.|\[\.,\]|\[,\.\]|\[\\\.,\]|\[,\\\.\]|\[\.\]|\[,\]|,)`;
const DIGITS = `(?:${DIGIT}${COUNT})+`;
const NUMERIC = new RegExp(String.raw`^\^${DIGITS}\$$`);
const DECIMAL = new RegExp(String.raw`^\^${DIGITS}\((?:\?:)?${DOT}${DIGITS}\)\?\$$`);

/**
 * What a validation pattern allows: "digits" for digits only, "decimal"
 * for digits with an optional decimal part and no minus sign, "letters"
 * when it allows letters, or `undefined`.
 * @param {string} source The pattern, with `^` and `$` for a regex.
 * @param {{ anchored?: boolean }} [options] `anchored: false` for an HTML `pattern`, which is anchored implicitly.
 */
export function patternKind(source, { anchored = true } = {}) {
  const s = anchored ? source : `^${source}$`;
  if (NUMERIC.test(s)) return "digits";
  if (DECIMAL.test(s)) return "decimal";
  if (/\\w|\\p\{L/.test(s)) return "letters";
  const plain = s
    .replace(/\\[pPu]\{[^}]*\}/g, "")
    .replace(/\\./g, "")
    .replace(/\{[^}]*\}/g, "")
    .replace(/\(\?<?[=!:]/g, "(")
    .replace(/\(\?<[A-Za-z_]\w*>/g, "(");
  if (/[A-Za-z]/.test(plain)) return "letters";
  return undefined;
}
