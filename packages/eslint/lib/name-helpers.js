/**
 * name-helpers.js: reading accessible names and visible text in JSX, for
 * justified/button-has-name (ACT-001b) and justified/control-has-name
 * (FRM-010).
 *
 * Like `jsx.js`, each helper answers only what it can see for certain and
 * returns `undefined` otherwise, so the rule stays quiet.
 */
import { attributeValue, elementName, getAttribute, hasSpread, meaningfulChildren, staticValue } from "./jsx.js";

/** Modules whose exports are icons. */
const ICON_SOURCES =
  /^(lucide-react|lucide-react\/.*|@radix-ui\/react-icons|@tabler\/icons-react|react-icons(\/.*)?|@heroicons\/react(\/.*)?|@phosphor-icons\/react)$|\/icons$/;

/**
 * Local names imported from icon modules, read from the whole program.
 * @param {any} program
 * @returns {Set<string>}
 */
export function iconImports(program) {
  const names = new Set();
  for (const node of program.body) {
    if (node.type !== "ImportDeclaration" || !ICON_SOURCES.test(String(node.source.value))) continue;
    for (const s of node.specifiers) names.add(s.local.name);
  }
  return names;
}

/**
 * Whether a JSX element is an icon: an inline `svg`, a component imported
 * from an icon module (or a member of one, such as `Icons.spinner`), or a
 * component whose name ends in "Icon".
 * @param {any} element A JSXElement.
 * @param {Set<string>} icons From `iconImports`.
 */
export function isIcon(element, icons) {
  const name = elementName(element.openingElement) ?? "";
  if (name === "svg") return true;
  const first = name.split(".")[0];
  if (icons.has(first)) return true;
  const last = name.split(".").pop() ?? "";
  return /^[A-Z]\w*Icon$/.test(last);
}

/** Whether `aria-hidden` is set to true for certain. @param {any} opening */
export const isAriaHidden = (opening) => {
  const v = attributeValue(getAttribute(opening, "aria-hidden"));
  return v === true || v === "true";
};

/**
 * The class list when it is written out: a string or a template without
 * expressions. `""` when there is no className, `undefined` when computed.
 * @param {any} opening
 */
export function staticClassName(opening) {
  const attribute = getAttribute(opening, "className") ?? getAttribute(opening, "class");
  if (!attribute) return "";
  const value = attributeValue(attribute);
  return typeof value === "string" ? value : undefined;
}

const hasClass = (/** @type {string} */ list, /** @type {string} */ cls) => list.split(/\s+/).includes(cls);

/**
 * The text an element shows on screen, when every part of it is written
 * out. Icons, `aria-hidden` parts and `sr-only` parts are left out, and so
 * is any element `skip` accepts. Any other component, expression or
 * computed class list makes the text unknown (`undefined`).
 * @param {any} element A JSXElement or JSXFragment.
 * @param {Set<string>} icons
 * @param {(element: any) => boolean} [skip]
 * @returns {string | undefined}
 */
export function visibleText(element, icons, skip = () => false) {
  let out = "";
  for (const child of element.children) {
    if (child.type === "JSXText") out += child.value;
    else if (child.type === "JSXExpressionContainer") {
      if (child.expression.type === "JSXEmptyExpression") continue;
      const v = staticValue(child.expression);
      if (typeof v === "string" || typeof v === "number") out += String(v);
      else return undefined;
    } else if (child.type === "JSXFragment") {
      const inner = visibleText(child, icons, skip);
      if (inner === undefined) return undefined;
      out += inner;
    } else if (child.type === "JSXElement") {
      if (skip(child) || isIcon(child, icons) || isAriaHidden(child.openingElement)) continue;
      const name = elementName(child.openingElement) ?? "";
      // Only plain HTML elements; a component may render anything.
      if (!/^[a-z][a-z0-9]*$/.test(name)) return undefined;
      if (hasSpread(child.openingElement)) return undefined;
      const classes = staticClassName(child.openingElement);
      if (classes === undefined) return undefined;
      if (hasClass(classes, "sr-only")) continue;
      const inner = visibleText(child, icons, skip);
      if (inner === undefined) return undefined;
      out += ` ${inner} `;
    } else return undefined;
  }
  return out.replace(/\s+/g, " ").trim();
}

/**
 * Text for comparing names: lower case, apostrophes dropped, other
 * punctuation and symbols turned into spaces.
 * @param {string} text
 */
export const normalize = (text) =>
  text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

/** Whether the text spells at least one word, not only symbols such as "A+" or "@". @param {string} text */
export const spellsWord = (text) => /\p{L}{2,}/u.test(text);

/**
 * Whether a name holds the visible words in the same order, ignoring case
 * and punctuation.
 * @param {string} name
 * @param {string} visible
 */
export const containsWords = (name, visible) => ` ${normalize(name)} `.includes(` ${normalize(visible)} `);

/** The attribute's value as a written-out string, or `undefined`. @param {any} opening @param {string} name */
export function stringAttribute(opening, name) {
  const v = attributeValue(getAttribute(opening, name));
  return typeof v === "string" ? v : undefined;
}
