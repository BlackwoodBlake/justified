/**
 * justified/dnd-announcements, for ACT-007b (a guideline): when an item can
 * be moved with the keyboard, tell assistive technology in words when it is
 * picked up, where it is after each step, and where it was dropped or that
 * the move was cancelled.
 *
 * Flags, for dnd-kit's `DndContext` imported from `@dnd-kit/core`, when the
 * keyboard sensor is certainly in play (no `sensors`, whose defaults include
 * `KeyboardSensor`, or `sensors` built in this file by `useSensors(...)`
 * with `useSensor(KeyboardSensor, ...)`):
 *   - no `accessibility` prop, or one with no `announcements`, so dnd-kit's
 *     default messages read out ids;
 *   - `announcements` written as an object, here or in a `const` in this
 *     file, that lacks `onDragStart`, `onDragOver`, `onDragEnd` or
 *     `onDragCancel`.
 * Also flags `aria-grabbed` and `aria-dropeffect`, which screen readers do
 * not read, unless the file announces moves in words some other way: a
 * `DndContext` with all four announcements, or an element with `aria-live`
 * or the role `status`, `log` or `alert`.
 *
 * Left alone: `sensors` or `announcements` from another file or a call,
 * objects with a spread, pointer-only sensors (KBD-001 asks for the keyboard
 * route, not this guideline), a `DndContext` with spread props or not
 * imported from dnd-kit (a project's own wrapper may add the messages),
 * and the words of the announcements themselves: `active.id` may be the
 * visible label, which the guideline allows, and whether a position counts
 * from one shows only when it runs. A live region inside the list is left
 * to review as well.
 */
import { defineRule } from "../lib/define-rule.js";
import { attributeValue, getAttribute, hasSpread, importedNames, unwrap } from "../lib/jsx.js";

const SOURCE = "@dnd-kit/core";
const STEPS = ["onDragStart", "onDragOver", "onDragEnd", "onDragCancel"];
const LIVE_ROLES = new Set(["status", "log", "alert"]);

/** A property's key, when written plainly. @param {any} p */
const keyOf = (p) =>
  p.type !== "Property" || p.computed
    ? undefined
    : p.key.type === "Identifier"
      ? p.key.name
      : typeof p.key.value === "string"
        ? p.key.value
        : undefined;

export default defineRule({
  id: "ACT-007b",
  level: "guideline",
  verdict: "Insufficient evidence (0 of 3 judges spoke)",
  description:
    "A dnd-kit DndContext with the keyboard sensor and no announcements of its own, or without all four, and aria-grabbed or aria-dropeffect.",
  type: "suggestion",
  messages: {
    noAnnouncements:
      'this DndContext lets items be moved with the keyboard, but passes no accessibility.announcements, so dnd-kit reads out item ids. Pass announcements with onDragStart, onDragOver, onDragEnd and onDragCancel that use the visible label and a position such as "2 of 5".',
    missingSteps:
      'these announcements leave out {{missing}}, so that step of a keyboard move is not read in words. Add it, with the visible label and a position such as "2 of 5".',
    deprecatedAria:
      "{{name}} is deprecated and screen readers do not read it, so it does not tell anyone about the move. Announce each step in words through a live region instead, and drop the attribute.",
  },
  create(context) {
    /** Local names per dnd-kit export, and namespaces it is imported under. */
    const local = { DndContext: new Set(), KeyboardSensor: new Set(), useSensor: new Set(), useSensors: new Set() };
    const namespaces = new Set();
    /** Each name declared once in the file, with its initial value; `null` when declared more than once. */
    const declared = new Map();
    /** @type {any[]} */
    const contexts = [];
    /** @type {any[]} */
    const ariaHits = [];
    let liveRegion = false;

    /** Whether a name or `ns.name` refers to this dnd-kit export. @param {any} node @param {keyof typeof local} name */
    const is = (node, name) => {
      const n = unwrap(node);
      if (!n) return false;
      if (n.type === "Identifier" || n.type === "JSXIdentifier") return local[name].has(n.name);
      if (n.type === "MemberExpression" || n.type === "JSXMemberExpression") {
        const obj = n.object;
        return (
          !n.computed &&
          (obj.type === "Identifier" || obj.type === "JSXIdentifier") &&
          namespaces.has(obj.name) &&
          n.property.name === name
        );
      }
      return false;
    };

    /** The value a local `const` name starts with, if it is declared once in the file. @param {any} node */
    const resolve = (node, depth = 0) => {
      const n = unwrap(node);
      if (n?.type === "Identifier" && depth < 4) {
        const init = declared.get(n.name);
        return init ? resolve(init, depth + 1) : undefined;
      }
      return n;
    };

    /** Whether the sensors certainly include dnd-kit's keyboard sensor. @param {any} opening */
    const keyboardInPlay = (opening) => {
      const attribute = getAttribute(opening, "sensors");
      if (!attribute) return true; // dnd-kit's defaults include KeyboardSensor.
      if (attribute.value?.type !== "JSXExpressionContainer") return false;
      const call = resolve(attribute.value.expression);
      if (call?.type !== "CallExpression" || !is(call.callee, "useSensors")) return false;
      return call.arguments.some((arg) => {
        const sensor = resolve(arg);
        return (
          sensor?.type === "CallExpression" &&
          is(sensor.callee, "useSensor") &&
          is(sensor.arguments[0], "KeyboardSensor")
        );
      });
    };

    /**
     * What the context's announcements lack: `null` when it has all four or
     * the code does not show for certain, else the missing steps (all four
     * when there are no announcements).
     * @param {any} opening
     */
    const missingSteps = (opening) => {
      const attribute = getAttribute(opening, "accessibility");
      if (!attribute) return STEPS;
      if (attribute.value?.type !== "JSXExpressionContainer") return null;
      const accessibility = resolve(attribute.value.expression);
      if (
        accessibility?.type !== "ObjectExpression" ||
        accessibility.properties.some((p) => p.type === "SpreadElement")
      )
        return null;
      const property = accessibility.properties.find((p) => keyOf(p) === "announcements");
      if (!property) return STEPS;
      const announcements = resolve(property.value);
      if (
        announcements?.type !== "ObjectExpression" ||
        announcements.properties.some((p) => p.type === "SpreadElement")
      )
        return null;
      const keys = new Set(announcements.properties.map(keyOf));
      const missing = STEPS.filter((s) => !keys.has(s));
      return missing.length ? missing : null;
    };

    return {
      ImportDeclaration(node) {
        for (const name of /** @type {(keyof typeof local)[]} */ (Object.keys(local))) {
          const found = importedNames(node, SOURCE, name);
          found.named.forEach((n) => local[name].add(n));
          found.namespaces.forEach((n) => namespaces.add(n));
        }
      },
      VariableDeclarator(node) {
        if (node.id.type !== "Identifier") return;
        const kind = node.parent?.kind;
        const name = node.id.name;
        declared.set(name, declared.has(name) || kind !== "const" || !node.init ? null : node.init);
      },
      JSXAttribute(node) {
        const name = node.name.type === "JSXIdentifier" ? node.name.name : "";
        if (name === "aria-grabbed" || name === "aria-dropeffect") ariaHits.push(node);
        if (name === "aria-live") liveRegion = true;
        if (name === "role" && LIVE_ROLES.has(String(attributeValue(node)))) liveRegion = true;
      },
      JSXOpeningElement(node) {
        if (is(node.name, "DndContext")) contexts.push(node);
      },
      "Program:exit"() {
        let announced = false;
        for (const opening of contexts) {
          if (hasSpread(opening)) continue;
          const missing = missingSteps(opening);
          if (!missing) {
            // All four steps written out, or the code does not show; either way, no report.
            if (getAttribute(opening, "accessibility")) announced = true;
            continue;
          }
          if (!keyboardInPlay(opening)) continue;
          if (missing === STEPS) {
            context.report({ node: getAttribute(opening, "accessibility") ?? opening, messageId: "noAnnouncements" });
          } else {
            context.report({
              node: getAttribute(opening, "accessibility"),
              messageId: "missingSteps",
              data: { missing: missing.join(", ") },
            });
          }
        }
        if (announced || liveRegion) return;
        for (const node of ariaHits)
          context.report({ node, messageId: "deprecatedAria", data: { name: node.name.name } });
      },
    };
  },
});
