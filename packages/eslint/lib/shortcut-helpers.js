/**
 * shortcut-helpers.js: finds page-wide keyboard shortcuts made of character
 * keys, for `character-key-shortcuts` (KBD-003) and `modifier-by-default`
 * (KBD-003b).
 *
 * A binding is page-wide when it is:
 *   - `useHotkeys(keys, …)` from react-hotkeys-hook whose returned ref is
 *     not kept (a kept ref is attached to an element, so the keys are bound
 *     to its focus),
 *   - `tinykeys(window | document | document.body, { … })`,
 *   - `Mousetrap.bind(keys, …)` (not `Mousetrap(element).bind`),
 *   - `addEventListener("keydown" | "keypress", …)` on `window`, `document`
 *     or `document.body`, or `window.onkeydown = …`, whose handler compares
 *     `e.key` or `e.code` with a character, or tests `e.key.length === 1`.
 *
 * Each finding is "plain" (no modifier and no Shift, such as `n` or `/`)
 * or "shift" (Shift alone, such as `shift+d`, `"D"` or `"?"`). A binding
 * that needs Ctrl, Alt or Cmd (`mod`, `$mod`, `meta`, `e.ctrlKey` …) is
 * left alone, and so are keys outside the criterion (Escape, arrows, Enter,
 * Space, Tab, Delete, function keys …).
 *
 * The code is left alone, as possibly having a way out, when:
 *   - `useHotkeys` gets an `enabled` option or an options value the code
 *     does not state,
 *   - a condition the handler or the registration depends on reads anything
 *     besides the event and fixed values, such as `if (!singleKeys) return`
 *     or `if (enabled && e.key === "n")`, since that may be the setting,
 *   - a check on the event goes through a function the rule cannot read,
 *     such as `hasModifier(e)`.
 * A guard that only skips typing in `input`, `textarea` or
 * `[contenteditable]` is not a way out, so it does not quiet anything.
 *
 * Not seen: a setting that mounts or unmounts the component holding the
 * shortcut, which lives in another file. That is the main source of wrong
 * reports, and why only clearly page-wide bindings are read.
 */
import { importedNames, unwrap } from "./jsx.js";

const MODIFIERS = new Set(["ctrl", "control", "alt", "option", "meta", "cmd", "command", "mod", "$mod", "super", "os", "altgraph"]);
const CODE_NAMES =
  /^(key[a-z]|digit\d|numpad\d|slash|backslash|period|comma|semicolon|quote|backquote|minus|equal|bracketleft|bracketright|intlbackslash)$/i;
/** react-hotkeys-hook and Mousetrap names for character keys. */
const CHAR_NAMES = new Set(["slash", "backslash", "period", "comma", "semicolon", "quote", "backquote", "minus", "equal", "plus"]);
const SHIFTED = new Set([..."~!@#$%^&*()_+{}|:\"<>?"]);
const FUNCTIONS = new Set(["FunctionExpression", "ArrowFunctionExpression", "FunctionDeclaration"]);
const GLOBALS = new Set(["document", "window", "globalThis", "navigator", "undefined", "NaN", "Infinity", "console"]);

/**
 * Whether one key, as a library writes it, types a character, and whether
 * it implies Shift.
 * @param {string} key
 * @returns {"plain" | "shift" | undefined}
 */
function charKey(key, caseSensitive = true) {
  if (key.length === 1) {
    if (key === " ") return undefined;
    if ((caseSensitive && /[A-Z]/.test(key)) || SHIFTED.has(key)) return "shift";
    return "plain";
  }
  if (CODE_NAMES.test(key) || CHAR_NAMES.has(key.toLowerCase())) return "plain";
  return undefined;
}

/**
 * Classifies one combination such as "shift+d", "$mod+K", "g t" or "/".
 * @param {string} combo
 * @param {string} [sequenceSplit] What separates the steps of a sequence.
 * @returns {"modifier" | "shift" | "plain" | undefined} `undefined` for keys outside the criterion.
 */
export function classifyCombo(combo, sequenceSplit = " ") {
  const trimmed = combo.trim();
  if (!trimmed) return undefined;
  // A sequence is judged by its first step: that is the key that arrives on its own.
  const first = sequenceSplit && trimmed.includes(sequenceSplit) && trimmed.length > 1 ? trimmed.split(sequenceSplit).filter(Boolean)[0] : trimmed;
  const parts = first === "+" ? ["+"] : first.endsWith("++") ? [...first.slice(0, -2).split("+"), "+"] : first.split("+");
  const key = parts[parts.length - 1];
  const mods = parts.slice(0, -1).map((m) => m.toLowerCase());
  if (mods.some((m) => MODIFIERS.has(m))) return "modifier";
  // Libraries match letters in either case, so a capital letter alone does not mean Shift.
  const kind = charKey(key, false);
  if (!kind) return undefined;
  if (mods.includes("shift")) return "shift";
  return kind;
}

/**
 * The worst character binding in a list of key strings: "plain" before "shift".
 * @param {string[]} combos
 * @param {string} [sequenceSplit]
 * @returns {{ kind: "plain" | "shift", key: string } | undefined}
 */
export function worstCombo(combos, sequenceSplit) {
  /** @type {{ kind: "plain" | "shift", key: string } | undefined} */
  let found;
  for (const c of combos) {
    const kind = classifyCombo(c, sequenceSplit);
    if (kind === "plain") return { kind, key: `"${c.trim()}"` };
    if (kind === "shift" && !found) found = { kind, key: `"${c.trim()}"` };
  }
  return found;
}

/** Strings from a literal or an array of literals, or `undefined`. @param {any} node */
function keyStrings(node) {
  const n = unwrap(node);
  if (n?.type === "Literal" && typeof n.value === "string") return [n.value];
  if (n?.type === "TemplateLiteral" && n.expressions.length === 0) return [n.quasis[0].value.cooked ?? ""];
  if (n?.type === "ArrayExpression") {
    const out = [];
    for (const e of n.elements) {
      const s = keyStrings(e);
      if (!s) return undefined;
      out.push(...s);
    }
    return out;
  }
  return undefined;
}

/** @param {any} node */
const isPageTarget = (node) => {
  const n = unwrap(node);
  if (n?.type === "Identifier") return n.name === "window" || n.name === "document" || n.name === "globalThis";
  return (
    n?.type === "MemberExpression" &&
    !n.computed &&
    unwrap(n.object)?.type === "Identifier" &&
    unwrap(n.object).name === "document" &&
    (n.property.name === "body" || n.property.name === "documentElement")
  );
};

/**
 * Finds a variable's definition in scope.
 * @param {any} context @param {any} identifier
 */
function findVariable(context, identifier) {
  let scope = context.sourceCode.getScope(identifier);
  while (scope) {
    const v = scope.set.get(identifier.name);
    if (v) return v;
    scope = scope.upper;
  }
  return undefined;
}

/** The function an identifier names in this file, or the node if it is a function. @param {any} context @param {any} node */
function resolveFunction(context, node) {
  const n = unwrap(node);
  if (!n) return undefined;
  if (FUNCTIONS.has(n.type)) return n;
  if (n.type !== "Identifier") return undefined;
  const def = findVariable(context, n)?.defs[0];
  if (!def) return undefined;
  if (def.type === "FunctionName") return def.node;
  if (def.type === "Variable" && def.parent?.kind === "const") {
    const init = unwrap(def.node.init);
    if (init && FUNCTIONS.has(init.type)) return init;
    // useCallback((e) => …, deps)
    if (init?.type === "CallExpression" && init.arguments[0] && FUNCTIONS.has(unwrap(init.arguments[0]).type))
      return unwrap(init.arguments[0]);
  }
  return undefined;
}

/**
 * Reads a handler's conditions.
 *
 * `facts(term, positive)` says what a condition demands when it holds
 * (`positive`) or fails: a modifier, Shift, something besides the event
 * (`gate`, maybe the setting), or an event check the rule cannot read
 * (`unknown`).
 *
 * @param {any} context
 * @param {any} fn The handler function.
 */
function handlerReader(context, fn) {
  const param = fn.params[0];
  /** Names that stand for the event or values read from it. */
  const eventNames = new Set();
  /** Names destructured from the event: key, code, ctrlKey … */
  const eventProps = new Map();
  if (param?.type === "Identifier") eventNames.add(param.name);
  else if (param?.type === "ObjectPattern")
    for (const p of param.properties)
      if (p.type === "Property" && p.key.type === "Identifier" && p.value.type === "Identifier")
        eventProps.set(p.value.name, p.key.name);

  // const { key } = e; const key = e.key; const mod = e.ctrlKey || e.metaKey
  /** @type {Map<string, any>} */
  const derived = new Map();
  if (fn.body.type === "BlockStatement")
    for (const s of fn.body.body) {
      if (s.type !== "VariableDeclaration" || s.kind !== "const") continue;
      for (const d of s.declarations) {
        if (!d.init) continue;
        if (d.id.type === "Identifier") derived.set(d.id.name, d.init);
        else if (d.id.type === "ObjectPattern" && readsEventOnly(d.init))
          for (const p of d.id.properties)
            if (p.type === "Property" && p.key.type === "Identifier" && p.value.type === "Identifier")
              eventProps.set(p.value.name, p.key.name);
      }
    }

  /** @param {any} node */
  function isEvent(node) {
    const n = unwrap(node);
    return n?.type === "Identifier" && eventNames.has(n.name);
  }

  /** Whether an expression reads only the event and fixed values. @param {any} node */
  function readsEventOnly(node) {
    const f = facts(node, true);
    return !f.gate && !f.unknown;
  }

  /** The event property a node reads, such as "key" for `e.key` or `key`. @param {any} node */
  function eventProperty(node) {
    const n = unwrap(node);
    if (n?.type === "MemberExpression" && !n.computed && n.property.type === "Identifier" && isEvent(n.object))
      return n.property.name;
    if (n?.type === "Identifier" && eventProps.has(n.name)) return eventProps.get(n.name);
    if (n?.type === "Identifier" && derived.has(n.name)) return eventProperty(derived.get(n.name));
    return undefined;
  }

  /** Whether a name is a fixed value: a global, a constructor, or a const of literals. @param {any} id */
  function isFixed(id) {
    if (GLOBALS.has(id.name) || /^[A-Z]/.test(id.name)) return true;
    const def = findVariable(context, id)?.defs[0];
    // A name the file does not declare: a prop or state in a snippet, or a global; only known globals are fixed.
    if (!def) return false;
    if (def.type === "FunctionName" || def.type === "ImportBinding") return true;
    if (def.type === "Variable" && def.parent?.kind === "const") {
      const init = unwrap(def.node.init);
      if (!init) return false;
      if (FUNCTIONS.has(init.type)) return true;
      if (["Literal", "ArrayExpression", "ObjectExpression", "TemplateLiteral"].includes(init.type)) {
        // A const of literals at the top of the module, not state or props.
        return def.node.parent?.parent?.type === "Program" || def.node.parent?.parent?.type === "ExportNamedDeclaration";
      }
    }
    return false;
  }

  /**
   * @param {any} node
   * @param {boolean} positive
   * @returns {{ modifier: boolean, shift: boolean, gate: boolean, unknown: boolean }}
   */
  function facts(node, positive) {
    const none = { modifier: false, shift: false, gate: false, unknown: false };
    const n = unwrap(node);
    if (!n) return none;
    if (n.type === "UnaryExpression" && n.operator === "!") return facts(n.argument, !positive);
    if (n.type === "LogicalExpression" && (n.operator === "&&" || n.operator === "||")) {
      const a = facts(n.left, positive);
      const b = facts(n.right, positive);
      const all = (n.operator === "&&") === positive;
      return {
        modifier: all ? a.modifier || b.modifier : a.modifier && b.modifier,
        shift: all ? a.shift || b.shift : a.shift && b.shift,
        gate: a.gate || b.gate,
        unknown: a.unknown || b.unknown,
      };
    }
    const prop = eventProperty(n);
    if (prop) {
      if (!positive) return none;
      if (prop === "ctrlKey" || prop === "altKey" || prop === "metaKey") return { ...none, modifier: true };
      if (prop === "shiftKey") return { ...none, shift: true };
      return none;
    }
    if (n.type === "Identifier") {
      if (isEvent(n)) return none;
      if (derived.has(n.name)) return facts(derived.get(n.name), positive);
      return isFixed(n) ? none : { ...none, gate: true };
    }
    if (n.type === "CallExpression") {
      const callee = unwrap(n.callee);
      // e.getModifierState("Control")
      if (callee?.type === "MemberExpression" && isEvent(callee.object)) {
        const name = callee.property.name;
        if (name === "getModifierState") return positive ? { ...none, modifier: true } : none;
        return none;
      }
      // A function given the event itself may check its modifiers: the rule cannot tell.
      if (n.arguments.some((a) => isEvent(a))) return { ...none, unknown: true };
      // The function's own name says nothing; what it is called on and given may be the setting.
      return merge([callee?.type === "Identifier" ? null : callee, ...n.arguments]);
    }
    return merge(childExpressions(n));
  }

  /** Gates and unknowns from several expressions, without modifiers. @param {any[]} nodes */
  function merge(nodes) {
    const out = { modifier: false, shift: false, gate: false, unknown: false };
    for (const c of nodes) {
      if (!c || FUNCTIONS.has(c.type)) continue;
      const f = facts(c, true);
      out.gate ||= f.gate;
      out.unknown ||= f.unknown;
    }
    return out;
  }

  /** @param {any} n */
  function childExpressions(n) {
    switch (n.type) {
      case "MemberExpression":
        return n.computed ? [n.object, n.property] : [n.object];
      case "BinaryExpression":
      case "AssignmentExpression":
        return [n.left, n.right];
      case "ConditionalExpression":
        return [n.test, n.consequent, n.alternate];
      case "ArrayExpression":
        return n.elements;
      case "TemplateLiteral":
        return n.expressions;
      case "UnaryExpression":
        return [n.argument];
      case "ObjectExpression":
        return n.properties.map((p) => (p.type === "Property" ? p.value : p.argument));
      default:
        return [];
    }
  }

  /**
   * What the comparison `node` tests: a character key, or `undefined`.
   * @param {any} node
   * @returns {"plain" | "shift" | undefined}
   */
  function keyTest(node) {
    if (node.type === "BinaryExpression" && ["===", "==", "!==", "!="].includes(node.operator)) {
      const sides = [node.left, node.right];
      for (const [a, b] of [sides, [...sides].reverse()]) {
        const lit = unwrap(b);
        if (lit?.type !== "Literal") continue;
        // e.key.length === 1
        const ua = unwrap(a);
        if (
          ua?.type === "MemberExpression" &&
          !ua.computed &&
          ua.property.name === "length" &&
          eventProperty(ua.object) === "key" &&
          lit.value === 1
        )
          return "plain";
        if (typeof lit.value !== "string") continue;
        const keyed = keyRead(a);
        if (!keyed) continue;
        return keyed.folded && /[a-z]/i.test(lit.value) ? "plain" : charKey(lit.value);
      }
      return undefined;
    }
    // ["/", "e"].includes(e.key)
    if (node.type === "CallExpression") {
      const callee = unwrap(node.callee);
      if (callee?.type === "MemberExpression" && callee.property.name === "includes" && node.arguments[0] && keyRead(node.arguments[0])) {
        const list = keyStrings(callee.object) ?? constList(callee.object);
        if (!list) return undefined;
        let found;
        for (const k of list) {
          const kind = charKey(k);
          if (kind === "plain") return kind;
          if (kind) found = kind;
        }
        return found;
      }
    }
    return undefined;
  }

  /** @param {any} node */
  function constList(node) {
    const n = unwrap(node);
    if (n?.type !== "Identifier") return undefined;
    const def = findVariable(context, n)?.defs[0];
    if (def?.type === "Variable" && def.parent?.kind === "const") return keyStrings(def.node.init);
    return undefined;
  }

  /** Whether a node reads `e.key` or `e.code`, maybe lower-cased. @param {any} node */
  function keyRead(node) {
    const n = unwrap(node);
    if (n?.type === "CallExpression") {
      const callee = unwrap(n.callee);
      if (callee?.type === "MemberExpression" && /^to(Lower|Upper)Case$/.test(callee.property.name ?? "")) {
        const inner = keyRead(callee.object);
        return inner ? { folded: true } : undefined;
      }
      return undefined;
    }
    const prop = eventProperty(n);
    return prop === "key" || prop === "code" ? { folded: false } : undefined;
  }

  return { facts, keyTest, keyRead, isEvent };
}

/** Whether a statement leaves the function: `return`, `throw`, or a block ending in one. @param {any} s */
function exits(s) {
  if (!s) return false;
  if (s.type === "ReturnStatement" || s.type === "ThrowStatement") return true;
  if (s.type === "BlockStatement") return exits(s.body[s.body.length - 1]);
  return false;
}

/**
 * The conditions that must hold for code at `node` to run, from `node` up
 * to `stop`: tests of the ifs, ternaries and `&&`/`||` around it, and the
 * early exits before it. Each is `[test, positive]`.
 * @param {any} node
 * @param {any} stop
 * @returns {[any, boolean][]}
 */
export function conditionsOf(node, stop) {
  /** @type {[any, boolean][]} */
  const out = [];
  let child = node;
  for (let n = node.parent; n && child !== stop; child = n, n = n.parent) {
    if (n.type === "IfStatement" || n.type === "ConditionalExpression") {
      if (child === n.consequent) out.push([n.test, true]);
      else if (child === n.alternate) out.push([n.test, false]);
    } else if (n.type === "LogicalExpression") {
      if (child === n.right) out.push([n.left, n.operator === "&&"]);
    } else if (n.type === "BlockStatement" || n.type === "Program" || n.type === "SwitchCase") {
      const list = n.type === "SwitchCase" ? n.consequent : n.body;
      for (const s of list) {
        if (s === child) break;
        if (s.type === "IfStatement" && !s.alternate && exits(s.consequent)) out.push([s.test, false]);
      }
    }
    if (n === stop) break;
  }
  return out;
}

/**
 * Walks a function body, not entering nested functions.
 * @param {any} root @param {Record<string, readonly string[]>} keys @param {(n: any) => void} visit
 */
function walkOwn(root, keys, visit) {
  const stack = [root];
  while (stack.length) {
    const n = stack.pop();
    visit(n);
    for (const k of keys[n.type] ?? []) {
      if (k === "parent") continue;
      const c = n[k];
      if (Array.isArray(c)) {
        for (const x of c) if (x && typeof x.type === "string" && !FUNCTIONS.has(x.type)) stack.push(x);
      } else if (c && typeof c.type === "string" && !FUNCTIONS.has(c.type)) stack.push(c);
    }
  }
}

/**
 * Reads a keydown handler: the character key it acts on without a
 * modifier, if any.
 * @param {any} context
 * @param {any} fn
 * @returns {{ kind: "plain" | "shift", node: any } | undefined}
 */
function readKeydownHandler(context, fn) {
  const reader = handlerReader(context, fn);
  const keys = context.sourceCode.visitorKeys;
  /** @type {{ kind: "plain" | "shift", node: any } | undefined} */
  let found;
  let quiet = false;

  /** @param {"plain" | "shift"} kind @param {any} at @param {[any, boolean][]} conditions */
  const judge = (kind, at, conditions) => {
    const all = { modifier: false, shift: false, gate: false, unknown: false };
    for (const [test, positive] of conditions) {
      const f = reader.facts(test, positive);
      all.modifier ||= f.modifier;
      all.shift ||= f.shift;
      all.gate ||= f.gate;
      all.unknown ||= f.unknown;
    }
    if (all.gate || all.unknown) {
      quiet = true;
      return;
    }
    if (all.modifier) return;
    const k = all.shift ? "shift" : kind;
    if (!found || (found.kind === "shift" && k === "plain")) found = { kind: k, node: at };
  };

  /** The object a call or member chain starts from, as `e` in `e.key.toLowerCase()`. @param {any} node */
  const rootObject = (node) => {
    let n = unwrap(node);
    while (n?.type === "MemberExpression" || n?.type === "CallExpression")
      n = unwrap(n.type === "MemberExpression" ? n.object : n.callee);
    return n;
  };

  /**
   * Whether the code that runs on the key acts only while Ctrl, Alt or Cmd
   * is held, as in `if (e.key === "k") { if (e.metaKey || e.ctrlKey) open(); }`.
   * Such a shortcut takes a modifier, which KBD-003 leaves alone. Every
   * call and assignment in the code must sit under a condition that holds
   * only with the modifier, apart from calls on the event itself such as
   * `e.preventDefault()`. Code that returns when a modifier is held, or
   * picks one action with the modifier and another without, still acts on
   * the plain key.
   * @param {any[]} statements The code that runs on the key.
   * @param {any} stop The node the code sits in.
   */
  const actsOnlyWithModifier = (statements, stop) => {
    let actions = 0;
    let unguarded = false;
    for (const statement of statements) {
      if (!statement) continue;
      walkOwn(statement, keys, (n) => {
        if (unguarded) return;
        if (n.type !== "CallExpression" && n.type !== "AssignmentExpression") return;
        if (n.type === "CallExpression" && reader.isEvent(rootObject(n.callee))) return;
        actions++;
        const guarded = conditionsOf(n, stop).some(([test, positive]) => reader.facts(test, positive).modifier);
        if (!guarded) unguarded = true;
      });
    }
    return actions > 0 && !unguarded;
  };

  walkOwn(fn.body, keys, (n) => {
    if (quiet) return;
    // switch (e.key) { case "e": … }
    if (n.type === "SwitchStatement" && reader.keyRead(n.discriminant)) {
      const folded = reader.keyRead(n.discriminant)?.folded;
      for (const c of n.cases) {
        const lit = unwrap(c.test);
        if (lit?.type !== "Literal" || typeof lit.value !== "string") continue;
        const kind = folded && /^[a-z]$/i.test(lit.value) ? "plain" : charKey(lit.value);
        if (kind && !actsOnlyWithModifier(c.consequent, c)) judge(kind, c.test, conditionsOf(n, fn));
      }
      return;
    }
    const kind = reader.keyTest(n);
    if (!kind) return;
    // Whether the comparison holds when the key matches, through any `!` around it.
    let matches = !(n.type === "BinaryExpression" && (n.operator === "!==" || n.operator === "!="));
    let at = n;
    while (
      at.parent &&
      (at.parent.type === "LogicalExpression" || (at.parent.type === "UnaryExpression" && at.parent.operator === "!"))
    ) {
      if (at.parent.type === "UnaryExpression") matches = !matches;
      at = at.parent;
    }
    const holder = at.parent;
    if (holder?.type === "IfStatement" && holder.test === at) {
      const leaves = !holder.alternate && exits(holder.consequent);
      // `if (e.key === "a") return` skips "a"; `if (e.key !== "a") { … }` acts on every other key.
      if (leaves === matches) return;
      // The code that runs on the key: the rest of the function after an early exit, or the branch.
      const branch = matches ? holder.consequent : holder.alternate;
      if (!leaves && actsOnlyWithModifier([branch], holder)) return;
      if (leaves) {
        const list = holder.parent?.type === "BlockStatement" ? holder.parent.body : [];
        if (actsOnlyWithModifier(list.slice(list.indexOf(holder) + 1), holder.parent)) return;
      }
      judge(kind, n, [[holder.test, !leaves], ...conditionsOf(holder, fn)]);
    } else if (holder?.type === "ConditionalExpression" && holder.test === at) {
      if (matches && !actsOnlyWithModifier([holder.consequent], holder))
        judge(kind, n, [[holder.test, true], ...conditionsOf(holder, fn)]);
    } else if (holder?.type === "ExpressionStatement" && at.type === "LogicalExpression" && at !== n) {
      // e.key === "/" && search()
      if (matches && at.operator === "&&" && !actsOnlyWithModifier([at.right], at))
        judge(kind, n, [[at.left, true], ...conditionsOf(holder, fn)]);
    }
  });
  return quiet ? undefined : found;
}

/**
 * Whether a callback has a condition that reads more than the event, which
 * may be the setting that turns the shortcut off.
 * @param {any} context @param {any} fn
 */
function callbackHasGate(context, fn) {
  const reader = handlerReader(context, fn);
  let gate = false;
  walkOwn(fn.body, context.sourceCode.visitorKeys, (n) => {
    if (gate) return;
    if (n.type === "IfStatement" || n.type === "ConditionalExpression") {
      const f = reader.facts(n.test, true);
      if (f.gate || f.unknown) gate = true;
    } else if (n.type === "LogicalExpression" && n.parent?.type === "ExpressionStatement") {
      const f = reader.facts(n.left, true);
      if (f.gate || f.unknown) gate = true;
    }
  });
  return gate;
}

/**
 * Whether a registration call sits under any condition, up to the file:
 * that condition may be the setting.
 * @param {any} node
 */
function registrationHasGate(context, node) {
  const reader = handlerReader(context, { params: [], body: { type: "EmptyStatement" } });
  return conditionsOf(node, null).some(([test, positive]) => {
    const f = reader.facts(test, positive);
    return f.gate || f.unknown;
  });
}

/**
 * The visitor both rules share.
 * @param {any} context
 * @param {(finding: { node: any, kind: "plain" | "shift", key: string, via: string }) => void} report
 */
export function shortcutVisitor(context, report) {
  const hotkeys = new Set();
  const tinykeys = new Set();
  const mousetrap = new Set(["Mousetrap"]);
  const source = context.sourceCode;

  /** @param {any} fn */
  const fnOf = (fn) => resolveFunction(context, fn);

  return {
    ImportDeclaration(/** @type {any} */ node) {
      for (const n of importedNames(node, "react-hotkeys-hook", "useHotkeys").named) hotkeys.add(n);
      for (const n of importedNames(node, "tinykeys", "tinykeys").named) tinykeys.add(n);
      if (node.source.value === "tinykeys")
        for (const s of node.specifiers) if (s.type === "ImportDefaultSpecifier") tinykeys.add(s.local.name);
      if (node.source.value === "mousetrap")
        for (const s of node.specifiers) if (s.type !== "ImportSpecifier") mousetrap.add(s.local.name);
    },
    CallExpression(/** @type {any} */ node) {
      const callee = unwrap(node.callee);
      // useHotkeys(keys, callback, options?, deps?)
      if (callee?.type === "Identifier" && hotkeys.has(callee.name)) {
        // A kept ref is attached to an element: the keys then work only while it has focus.
        if (node.parent?.type !== "ExpressionStatement") return;
        const combos = keyStrings(node.arguments[0]);
        if (!combos) return;
        let split = ",";
        for (const a of node.arguments.slice(2)) {
          const opt = unwrap(a);
          if (opt?.type === "ArrayExpression") continue;
          if (opt?.type !== "ObjectExpression") return;
          for (const p of opt.properties) {
            if (p.type !== "Property") return;
            const name = p.key.type === "Identifier" ? p.key.name : p.key.value;
            if (name === "enabled" && !(unwrap(p.value)?.type === "Literal" && unwrap(p.value).value === true)) return;
            if (name === "splitKey") {
              const v = unwrap(p.value);
              if (v?.type === "Literal" && typeof v.value === "string") split = v.value;
              else return;
            }
          }
        }
        const list = combos.flatMap((c) => (split === "," ? c.split(/,(?!$)/) : c.split(split)));
        const worst = worstCombo(list, ">");
        if (!worst) return;
        const fn = fnOf(node.arguments[1]);
        if (fn && callbackHasGate(context, fn)) return;
        if (!fn && node.arguments[1] && unwrap(node.arguments[1]).type !== "Identifier") return;
        report({ node: node.arguments[0], ...worst, via: "useHotkeys" });
        return;
      }
      // tinykeys(window, { "Shift+D": … })
      if (callee?.type === "Identifier" && tinykeys.has(callee.name)) {
        if (!isPageTarget(node.arguments[0])) return;
        const map = unwrap(node.arguments[1]);
        if (map?.type !== "ObjectExpression") return;
        if (registrationHasGate(context, node)) return;
        /** @type {{ node: any, kind: "plain" | "shift", key: string } | undefined} */
        let found;
        for (const p of map.properties) {
          if (p.type !== "Property" || p.computed) continue;
          const key = p.key.type === "Identifier" ? p.key.name : typeof p.key.value === "string" ? p.key.value : undefined;
          if (!key) continue;
          const kind = classifyCombo(key, " ");
          if (kind !== "plain" && kind !== "shift") continue;
          const fn = fnOf(p.value);
          if (fn && callbackHasGate(context, fn)) continue;
          if (!found || (found.kind === "shift" && kind === "plain")) found = { node: p.key, kind, key: `"${key}"` };
        }
        if (found) report({ ...found, via: "tinykeys" });
        return;
      }
      // Mousetrap.bind(keys, callback)
      if (
        callee?.type === "MemberExpression" &&
        !callee.computed &&
        callee.property.name === "bind" &&
        unwrap(callee.object)?.type === "Identifier" &&
        mousetrap.has(unwrap(callee.object).name)
      ) {
        const combos = keyStrings(node.arguments[0]);
        if (!combos) return;
        const worst = worstCombo(combos, " ");
        if (!worst) return;
        if (registrationHasGate(context, node)) return;
        const fn = fnOf(node.arguments[1]);
        if (fn && callbackHasGate(context, fn)) return;
        report({ node: node.arguments[0], ...worst, via: "Mousetrap.bind" });
        return;
      }
      // window.addEventListener("keydown", handler)
      if (
        callee?.type === "MemberExpression" &&
        !callee.computed &&
        callee.property.name === "addEventListener" &&
        isPageTarget(callee.object)
      ) {
        const type = unwrap(node.arguments[0]);
        if (type?.type !== "Literal" || (type.value !== "keydown" && type.value !== "keypress")) return;
        const fn = fnOf(node.arguments[1]);
        if (!fn || registrationHasGate(context, node)) return;
        const found = readKeydownHandler(context, fn);
        if (!found) return;
        report({ node: found.node, kind: found.kind, key: source.getText(found.node), via: `a ${type.value} listener on ${source.getText(callee.object)}` });
      }
    },
    AssignmentExpression(/** @type {any} */ node) {
      // window.onkeydown = handler
      const left = unwrap(node.left);
      if (left?.type !== "MemberExpression" || left.computed || !isPageTarget(left.object)) return;
      if (left.property.name !== "onkeydown" && left.property.name !== "onkeypress") return;
      const fn = fnOf(node.right);
      if (!fn || registrationHasGate(context, node)) return;
      const found = readKeydownHandler(context, fn);
      if (!found) return;
      report({ node: found.node, kind: found.kind, key: source.getText(found.node), via: `${source.getText(left)}` });
    },
  };
}
