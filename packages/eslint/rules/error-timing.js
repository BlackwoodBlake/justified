/**
 * justified/error-timing, for FRM-002b: a new error shows when the person
 * leaves a field they changed, or sends the form, never while they type;
 * a shown error goes as soon as the value is valid.
 *
 * Flags react-hook-form's `useForm` options that are certain to do
 * otherwise:
 *   - `mode: "onChange"` or `"all"`: new errors while typing.
 *   - `mode: "onBlur"` or `"onTouched"`: an error on a field that was only
 *     tabbed past; `onTouched` then also shows new errors while typing.
 *   - `reValidateMode: "onBlur"` or `"onSubmit"`: a fixed value keeps its
 *     error until the field is left or the form sent again.
 *
 * Also flags an `onChange` or `onInput` handler on a text field (`input`,
 * `Input`, `textarea` or `Textarea`) that sets a new error message while
 * the person types: a `useState` setter whose state is named for an error,
 * given a message (a string, a template, or a constant holding one), or
 * react-hook-form's `setError(name, { ... })`. The handler is read when it
 * is written inline or is a function declared in this file, and so are
 * the local functions it calls, one level deep. The call is reported only
 * when nothing guards it but a check of the new value itself: every
 * condition on the way to it reads only the handler's own values and
 * names from outside the component. A guard such as "an error is already
 * shown" (`if (error && ...)`, `errors.postcode`) or "the field was left
 * once" leaves it alone, and so does an early return under such a guard.
 *
 * Left out, because the code alone cannot settle them:
 *   - The exception for a new value with its rules shown beside the field,
 *     such as a new password. A file with `autoComplete="new-password"`
 *     gets no `mode` reports, since the mode may be there for that field,
 *     and a field with it gets no handler reports.
 *   - `trigger()`, a `safeParse` and other helpers whose result is set as
 *     the error, and server checks on each change: whether they add an
 *     error or only clear one takes judgement. The review skill covers them.
 *   - Options that are not written as an object literal in the call.
 *   - An error set inside a `catch` or after an `await`, which comes from a
 *     request, such as a search that fails, not from a check of the value;
 *     a state named for a limit, count, remaining or length, which holds a
 *     limit message (FRM-017c), not an error; and `setError` with an empty
 *     `message`, which clears one.
 */
import { defineRule } from "../lib/define-rule.js";
import { attributeValue, elementName, getAttribute, importedNames, staticValue, unwrap, walk } from "../lib/jsx.js";

const TYPING = new Set(["onChange", "all"]);
const TEXT_FIELDS = new Set(["input", "Input", "textarea", "Textarea"]);
const TEXT_TYPES = new Set(["text", "email", "tel", "url", "search", "password", "number"]);
const CHANGE_HANDLERS = new Set(["onChange", "onInput"]);
const FUNCTIONS = new Set(["FunctionExpression", "ArrowFunctionExpression", "FunctionDeclaration"]);
const ERROR_STATE = /error/i;
/** A state about a length limit is a count, not an error message (FRM-017c). */
const NOT_ERROR_STATE = /limit|count|remaining|length/i;

export default defineRule({
  id: "FRM-002b",
  level: "rule",
  verdict: "Unanimous (2 of 2)",
  description:
    "react-hook-form validation modes, and change handlers, that show a new error while the person types, on a field they only tabbed past, or after the value is fixed.",
  hasSuggestions: true,
  messages: {
    typing:
      'mode "{{mode}}" checks every field on each key press, so a new error can appear while the person is still typing. Leave mode at its default ("onSubmit") and check a field when the person leaves it after a change, for example by calling trigger() from onBlur when the field is dirty.',
    onBlur:
      'mode "onBlur" shows an error on a field the person only tabbed past, and keeps a shown error until the field is left again. Leave mode at its default ("onSubmit") and check a field on blur only when it was changed.',
    onTouched:
      'mode "onTouched" shows an error on a field the person only tabbed past, and from then on checks it on every key press. Leave mode at its default ("onSubmit") and check a field on blur only when it was changed.',
    revalidate:
      'reValidateMode "{{mode}}" keeps a shown error after the person has fixed the value, until they leave the field or send the form again. Use the default reValidateMode ("onChange"), so the error goes as soon as the value is valid.',
    suggestRemoveRevalidate: 'Remove reValidateMode, so the default "onChange" clears a fixed error at once.',
    whileTyping:
      "this change handler sets a new error while the person is still typing. Show a new error when the person leaves the field after changing it, or sends the form; on change, only remove an error that is already shown, once the value is valid.",
  },
  create(context) {
    const sourceCode = context.sourceCode;
    /** Local names of react-hook-form's useForm, and namespaces it is imported under. */
    const names = new Set();
    const namespaces = new Set();
    let newPassword = false;
    /** @type {{ node: any, messageId: string, mode: string }[]} */
    const modeHits = [];

    /** Removes an object property and the comma after it. @param {any} property */
    const removeProperty = (property) => (/** @type {import("eslint").Rule.RuleFixer} */ fixer) => {
      const after = sourceCode.getTokenAfter(property);
      const end = after && after.value === "," ? after.range[1] : property.range[1];
      return fixer.removeRange([property.range[0], end]);
    };

    /** The variable a name refers to where it is used. @param {any} identifier */
    const variableOf = (identifier) => {
      for (let scope = sourceCode.getScope(identifier); scope; scope = scope.upper) {
        const v = scope.set.get(identifier.name);
        if (v) return v;
      }
      return undefined;
    };

    /** The initial value of a `const` a name refers to. @param {any} identifier */
    const constInit = (identifier) => {
      const def = variableOf(identifier)?.defs[0];
      if (def?.type !== "Variable" || def.parent?.kind !== "const" || def.node.id.type !== "Identifier")
        return undefined;
      return unwrap(def.node.init);
    };

    /** The function a handler expression stands for, in this file. @param {any} node */
    const functionOf = (node) => {
      const n = unwrap(node);
      if (!n) return undefined;
      if (FUNCTIONS.has(n.type)) return n;
      if (n.type !== "Identifier") return undefined;
      const def = variableOf(n)?.defs[0];
      if (def?.type === "FunctionName") return def.node;
      const init = def?.type === "Variable" ? unwrap(def.node.init) : undefined;
      return init && FUNCTIONS.has(init.type) ? init : undefined;
    };

    /** Whether a callee is a `useState` setter whose state is named for an error. @param {any} callee */
    const isErrorSetter = (callee) => {
      if (callee?.type !== "Identifier") return false;
      const def = variableOf(callee)?.defs[0];
      const pattern = def?.type === "Variable" ? def.node.id : undefined;
      if (pattern?.type !== "ArrayPattern") return false;
      const [state, setter] = pattern.elements;
      if (setter?.type !== "Identifier" || setter.name !== callee.name || state?.type !== "Identifier") return false;
      const init = unwrap(def.node.init);
      const hook = unwrap(init?.callee);
      const isUseState =
        init?.type === "CallExpression" &&
        (hook?.name === "useState" || (hook?.type === "MemberExpression" && hook.property.name === "useState"));
      return isUseState && ERROR_STATE.test(state.name) && !NOT_ERROR_STATE.test(state.name);
    };

    /** Whether a value may be an error message. @param {any} node @param {number} [depth] @returns {boolean} */
    const mayBeMessage = (node, depth = 0) => {
      const n = unwrap(node);
      if (!n) return false;
      const value = staticValue(n);
      if (value !== undefined) return typeof value === "string" && value.trim() !== "";
      if (n.type === "TemplateLiteral") return true;
      if (n.type === "Identifier") {
        const init = depth < 2 ? constInit(n) : undefined;
        return init ? mayBeMessage(init, depth + 1) : false;
      }
      if (n.type === "ConditionalExpression")
        return mayBeMessage(n.consequent, depth) || mayBeMessage(n.alternate, depth);
      if (n.type === "LogicalExpression") return mayBeMessage(n.right, depth);
      return false;
    };

    /**
     * Whether an expression reads only the handler's own values and names
     * from outside the component, so as a condition it checks the new value
     * and nothing about what is shown.
     * @param {any} expression
     * @param {any} handler The handler function.
     * @param {any} component The function that holds the field, if any.
     * @param {number} [depth]
     * @returns {boolean}
     */
    const readsOnlyValue = (expression, handler, component, depth = 0) => {
      let only = true;
      walk(expression, sourceCode.visitorKeys, (n, parent) => {
        if (!only) return false;
        if (n.type !== "Identifier") return undefined;
        if (parent?.type === "MemberExpression" && parent.property === n && !parent.computed) return undefined;
        if (parent?.type === "Property" && parent.key === n && !parent.computed) return undefined;
        const def = variableOf(n)?.defs[0];
        if (!def || def.type === "FunctionName") return undefined; // a global such as Number, or a function
        if (def.type === "Variable" && FUNCTIONS.has(unwrap(def.node.init)?.type)) return undefined;
        const at = def.name.range[0];
        const inHandler = at >= handler.range[0] && at < handler.range[1];
        const inComponent = component && at >= component.range[0] && at < component.range[1];
        if (inHandler) {
          // A local of the handler counts only when it comes from the value, not from shown state.
          const init = def.type === "Variable" ? def.node.init : undefined;
          if (init && (depth > 2 || !readsOnlyValue(init, handler, component, depth + 1))) only = false;
        } else if (inComponent) only = false;
        return undefined;
      });
      return only;
    };

    /** The nearest function around a node, not counting the node. @param {any} node */
    const enclosingFunction = (node) => {
      for (let n = node.parent; n; n = n.parent) if (FUNCTIONS.has(n.type)) return n;
      return undefined;
    };

    /**
     * Whether every condition between a call and the body of `fn` checks
     * only the value.
     * @param {any} call @param {any} fn @param {any} handler @param {any} component
     */
    const guardedOnlyByValue = (call, fn, handler, component) => {
      let child = call;
      for (let n = call.parent; n && n !== fn; child = n, n = n.parent) {
        if (n.type === "IfStatement" && child !== n.test && !readsOnlyValue(n.test, handler, component)) return false;
        if (n.type === "ConditionalExpression" && child !== n.test && !readsOnlyValue(n.test, handler, component))
          return false;
        if (n.type === "LogicalExpression" && child === n.right && !readsOnlyValue(n.left, handler, component))
          return false;
        if (n.type === "SwitchCase" || /^(For|While|DoWhile)/.test(n.type)) return false;
      }
      return true;
    };

    /** Whether a function returns early under a condition that is not about the value. */
    const returnsEarlyOnState = (/** @type {any} */ fn, /** @type {any} */ handler, /** @type {any} */ component) => {
      let found = false;
      walk(fn.body, sourceCode.visitorKeys, (n) => {
        if (found || (FUNCTIONS.has(n.type) && n !== fn)) return false;
        if (n.type !== "IfStatement" || readsOnlyValue(n.test, handler, component)) return undefined;
        walk(n, sourceCode.visitorKeys, (m) => {
          if (FUNCTIONS.has(m.type)) return false;
          if (m.type === "ReturnStatement" || m.type === "ThrowStatement") found = true;
          return undefined;
        });
        return undefined;
      });
      return found;
    };

    /** Whether a call sets a new error message. @param {any} call */
    const setsError = (call) => {
      const callee = unwrap(call.callee);
      const name =
        callee?.type === "Identifier"
          ? callee.name
          : callee?.type === "MemberExpression" && !callee.computed
            ? callee.property.name
            : undefined;
      // react-hook-form: setError(name, { type, message })
      const options = unwrap(call.arguments[1]);
      if (name === "setError" && call.arguments.length >= 2 && options?.type === "ObjectExpression") {
        // An empty message clears the error rather than setting one.
        const message = options.properties.find(
          (/** @type {any} */ p) => p.type === "Property" && !p.computed && p.key.name === "message",
        );
        return !message || staticValue(message.value) !== "";
      }
      return isErrorSetter(callee) && call.arguments.length === 1 && mayBeMessage(call.arguments[0]);
    };

    /** Whether the conditions inside a value set as the error check only the value. @param {any} node @param {any} handler @param {any} component @returns {boolean} */
    const valueGuardedOnlyByValue = (node, handler, component) => {
      const n = unwrap(node);
      if (n?.type === "ConditionalExpression")
        return (
          readsOnlyValue(n.test, handler, component) &&
          valueGuardedOnlyByValue(n.consequent, handler, component) &&
          valueGuardedOnlyByValue(n.alternate, handler, component)
        );
      if (n?.type === "LogicalExpression")
        return readsOnlyValue(n.left, handler, component) && valueGuardedOnlyByValue(n.right, handler, component);
      return true;
    };

    /**
     * Whether a call in a function runs only after a request: inside a
     * `catch`, or after an `await`. Such an error comes from a request,
     * not from a check of the value the person types.
     * @param {any} call @param {any} fn
     */
    const afterRequest = (call, fn) => {
      for (let n = call.parent; n && n !== fn; n = n.parent) if (n.type === "CatchClause") return true;
      let awaited = false;
      walk(fn.body, sourceCode.visitorKeys, (n) => {
        if (awaited || FUNCTIONS.has(n.type)) return false;
        if (n.type === "AwaitExpression" && n.range[0] < call.range[1]) awaited = true;
        return undefined;
      });
      return awaited;
    };

    /**
     * The first call in a handler that sets a new error while typing.
     * @param {any} fn @param {any} component @param {number} depth
     * @returns {any}
     */
    const errorCall = (fn, component, depth) => {
      if (returnsEarlyOnState(fn, fn, component)) return undefined;
      /** @type {any} */
      let found;
      walk(fn.body, sourceCode.visitorKeys, (n) => {
        if (found || FUNCTIONS.has(n.type)) return false;
        if (n.type !== "CallExpression") return undefined;
        if (setsError(n)) {
          if (afterRequest(n, fn)) return undefined;
          const value = n.arguments.length === 1 ? n.arguments[0] : undefined;
          if (guardedOnlyByValue(n, fn, fn, component) && valueGuardedOnlyByValue(value, fn, component)) found = n;
        } else if (depth < 1 && unwrap(n.callee)?.type === "Identifier") {
          const local = functionOf(n.callee);
          if (local && local !== fn && guardedOnlyByValue(n, fn, fn, component) && errorCall(local, component, depth + 1))
            found = n;
        }
        return undefined;
      });
      return found;
    };

    return {
      JSXOpeningElement(opening) {
        const name = elementName(opening);
        if (!name || !TEXT_FIELDS.has(name)) return;
        const type = getAttribute(opening, "type");
        if (type && !TEXT_TYPES.has(String(attributeValue(type)))) return;
        if (String(attributeValue(getAttribute(opening, "autoComplete"))).includes("new-password")) return;
        for (const attribute of opening.attributes) {
          if (attribute.type !== "JSXAttribute" || attribute.name.type !== "JSXIdentifier") continue;
          if (!CHANGE_HANDLERS.has(attribute.name.name) || attribute.value?.type !== "JSXExpressionContainer") continue;
          const handler = functionOf(attribute.value.expression);
          if (!handler) continue;
          const call = errorCall(handler, enclosingFunction(opening), 0);
          if (call) context.report({ node: call, messageId: "whileTyping" });
        }
      },
      ImportDeclaration(node) {
        const found = importedNames(node, "react-hook-form", "useForm");
        found.named.forEach((n) => names.add(n));
        found.namespaces.forEach((n) => namespaces.add(n));
      },
      JSXAttribute(node) {
        const name = node.name.type === "JSXIdentifier" ? node.name.name : "";
        if ((name === "autoComplete" || name === "autocomplete") && String(attributeValue(node)).includes("new-password")) newPassword = true;
      },
      CallExpression(node) {
        const callee = unwrap(node.callee);
        const isUseForm =
          (callee.type === "Identifier" && names.has(callee.name)) ||
          (callee.type === "MemberExpression" &&
            !callee.computed &&
            callee.object.type === "Identifier" &&
            namespaces.has(callee.object.name) &&
            callee.property.type === "Identifier" &&
            callee.property.name === "useForm");
        if (!isUseForm) return;
        const options = unwrap(node.arguments[0]);
        if (!options || options.type !== "ObjectExpression") return;
        for (const property of options.properties) {
          if (property.type !== "Property" || property.computed) continue;
          const key = property.key.type === "Identifier" ? property.key.name : property.key.value;
          const value = staticValue(property.value);
          if (typeof value !== "string") continue;
          if (key === "mode") {
            const messageId = TYPING.has(value) ? "typing" : value === "onBlur" ? "onBlur" : value === "onTouched" ? "onTouched" : null;
            if (messageId) modeHits.push({ node: property, messageId, mode: value });
          } else if (key === "reValidateMode" && (value === "onBlur" || value === "onSubmit")) {
            context.report({
              node: property,
              messageId: "revalidate",
              data: { mode: value },
              suggest: [{ messageId: "suggestRemoveRevalidate", fix: removeProperty(property) }],
            });
          }
        }
      },
      "Program:exit"() {
        // A new password with its rules beside it may check while typing (see the rule's Exceptions).
        if (newPassword) return;
        for (const hit of modeHits) context.report({ node: hit.node, messageId: hit.messageId, data: { mode: hit.mode } });
      },
    };
  },
});
