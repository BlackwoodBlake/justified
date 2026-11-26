/**
 * class-token-helpers.js: reads Tailwind class lists from `className`, for
 * `focus-stays-visible`, `hover-controls-on-focus` and
 * `colour-tokens-by-role`.
 *
 * A class list is read into parts. A part is a list of class tokens and a
 * group: `null` for tokens that are always there, or a number for tokens
 * that only one branch adds (`cond && "a"`, `cond ? "a" : "b"`). Tokens
 * from different groups may never be there together, so pair checks only
 * compare tokens of the same group, or a group with the always-there ones.
 *
 * `certain` holds the tokens that are there whatever the branches do: the
 * always-there ones, and those both sides of a `?:` add. Presence checks
 * use only these, since a branch may never be taken for the code at hand.
 *
 * `complete` says whether every part of the list is known. A value the
 * code does not state, such as `buttonVariants()` or a prop, makes it
 * incomplete; `passThrough` notes that the only unknown is the caller's own
 * `className` prop.
 */
import { unwrap } from "./jsx.js";

const CLASS_FUNCTIONS = new Set(["cn", "clsx", "classNames", "classnames", "cx", "twMerge", "twJoin"]);

/**
 * @typedef {{ tokens: string[], group: number | null }} ClassPart
 * @typedef {{ parts: ClassPart[], certain: string[], complete: boolean, passThrough: boolean }} ClassList
 */

/** Splits a class string into tokens. @param {string} text */
export const splitTokens = (text) => text.split(/\s+/).filter(Boolean);

/**
 * Splits a token into its variants and utility, keeping brackets whole:
 * `dark:hover:bg-zinc-900` gives `{ variants: ["dark", "hover"], utility: "bg-zinc-900" }`.
 * A leading or trailing `!` is dropped.
 * @param {string} token
 */
export function parseToken(token) {
  const pieces = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < token.length; i++) {
    const c = token[i];
    if (c === "[" || c === "(") depth++;
    else if (c === "]" || c === ")") depth = Math.max(0, depth - 1);
    else if (c === ":" && depth === 0) {
      pieces.push(token.slice(start, i));
      start = i + 1;
    }
  }
  const utility = token.slice(start).replace(/^!|!$/g, "");
  return { variants: pieces, utility };
}

/**
 * Finds a `const` in scope and returns its initial value, or `undefined`.
 * @param {any} context
 * @param {any} identifier
 */
function constInit(context, identifier) {
  let scope = context.sourceCode.getScope(identifier);
  while (scope) {
    const variable = scope.set.get(identifier.name);
    if (variable) {
      const def = variable.defs[0];
      if (def?.type === "Variable" && def.parent?.kind === "const" && def.node.id.type === "Identifier")
        return def.node.init;
      return undefined;
    }
    scope = scope.upper;
  }
  return undefined;
}

/**
 * Whether an expression is a string the code states with no branches:
 * a literal, a template with no expressions, or such strings joined with `+`.
 * @param {any} node
 */
function plainString(node) {
  const n = unwrap(node);
  if (!n) return false;
  if (n.type === "Literal") return typeof n.value === "string";
  if (n.type === "TemplateLiteral") return n.expressions.length === 0;
  if (n.type === "BinaryExpression" && n.operator === "+") return plainString(n.left) && plainString(n.right);
  return false;
}

/**
 * Reads the class list of an element.
 * @param {any} context
 * @param {any} opening A JSXOpeningElement.
 * @param {string} [attributeName]
 * @returns {ClassList | undefined} `undefined` when there is no such attribute.
 */
export function readClassList(context, opening, attributeName = "className") {
  const attribute = opening.attributes.find(
    (a) => a.type === "JSXAttribute" && a.name.type === "JSXIdentifier" && a.name.name === attributeName,
  );
  if (!attribute) return undefined;
  /** @type {ClassList} */
  const list = { parts: [], certain: [], complete: true, passThrough: false };
  let next = 0;
  let unknown = 0;

  /** @param {string} text @param {number | null} group @returns {string[]} */
  const add = (text, group) => {
    const tokens = splitTokens(text);
    if (tokens.length) list.parts.push({ tokens, group });
    return tokens;
  };

  /** @param {string[]} a @param {string[]} b */
  const both = (a, b) => a.filter((t) => b.includes(t));

  /**
   * Reads one expression into parts, and returns the tokens it adds for certain.
   * @param {any} node @param {number | null} group @param {number} depth
   * @returns {string[]}
   */
  const read = (node, group, depth) => {
    const n = unwrap(node);
    if (!n || depth > 8) {
      unknown++;
      return [];
    }
    switch (n.type) {
      case "Literal":
        if (typeof n.value === "string") return add(n.value, group);
        if (n.value !== null && n.value !== false && n.value !== true) unknown++;
        return [];
      case "TemplateLiteral": {
        const out = [];
        n.quasis.forEach((q, i) => {
          let text = q.value.cooked ?? "";
          // A token that touches an expression is only part of a class, such as `bg-${tone}`.
          if (i > 0 && !/^\s/.test(text)) text = text.replace(/^\S*/, "");
          if (i < n.quasis.length - 1 && !/\s$/.test(text)) text = text.replace(/\S*$/, "");
          out.push(...add(text, group));
        });
        for (const e of n.expressions) out.push(...read(e, group, depth + 1));
        return out;
      }
      case "BinaryExpression":
        if (n.operator !== "+") break;
        return [...read(n.left, group, depth + 1), ...read(n.right, group, depth + 1)];
      case "ConditionalExpression":
        return both(read(n.consequent, next++, depth + 1), read(n.alternate, next++, depth + 1));
      case "LogicalExpression":
        if (n.operator === "&&") {
          read(n.right, next++, depth + 1);
          return [];
        }
        return both(read(n.left, next++, depth + 1), read(n.right, next++, depth + 1));
      case "ArrayExpression":
        return n.elements.flatMap((e) =>
          e ? read(e.type === "SpreadElement" ? e.argument : e, group, depth + 1) : [],
        );
      case "ObjectExpression":
        for (const p of n.properties) {
          if (p.type !== "Property") {
            unknown++;
            continue;
          }
          const key = p.computed
            ? undefined
            : p.key.type === "Identifier"
              ? p.key.name
              : typeof p.key.value === "string"
                ? p.key.value
                : undefined;
          if (key === undefined) unknown++;
          else add(key, next++);
        }
        return [];
      case "CallExpression": {
        const callee = unwrap(n.callee);
        if (callee?.type === "Identifier" && CLASS_FUNCTIONS.has(callee.name)) {
          return n.arguments.flatMap((a) => read(a.type === "SpreadElement" ? a.argument : a, group, depth + 1));
        }
        break;
      }
      case "Identifier": {
        if (n.name === "undefined") return [];
        if (n.name === "className") {
          list.passThrough = true;
          return [];
        }
        const init = constInit(context, n);
        // Only a string with no branches is followed: a branch in a shared constant may be taken for one caller and not another.
        if (init && plainString(init)) return read(init, group, depth + 1);
        break;
      }
      case "MemberExpression":
        if (!n.computed && n.property.type === "Identifier" && n.property.name === "className") {
          list.passThrough = true;
          return [];
        }
        break;
      default:
        break;
    }
    unknown++;
    return [];
  };

  const value = attribute.value;
  if (!value) return list;
  if (value.type === "Literal") list.certain = add(String(value.value), null);
  else if (value.type === "JSXExpressionContainer") {
    if (value.expression.type !== "JSXEmptyExpression") list.certain = read(value.expression, null, 0);
  } else unknown++;
  list.certain = [...new Set(list.certain)];
  list.complete = unknown === 0;
  return list;
}

/** Every token in a class list. @param {ClassList} list */
export const allTokens = (list) => list.parts.flatMap((p) => p.tokens);

/** The string literal node that holds a whole class attribute, if it is one. @param {any} opening */
export function plainClassLiteral(opening) {
  const attribute = opening.attributes.find(
    (a) => a.type === "JSXAttribute" && a.name.type === "JSXIdentifier" && a.name.name === "className",
  );
  const value = attribute?.value;
  if (value?.type === "Literal" && typeof value.value === "string") return value;
  if (value?.type === "JSXExpressionContainer") {
    const e = unwrap(value.expression);
    if (e?.type === "Literal" && typeof e.value === "string") return e;
    if (e?.type === "TemplateLiteral" && e.expressions.length === 0) return e;
  }
  return undefined;
}
