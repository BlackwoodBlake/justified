/**
 * justified/page-language, for STR-006 (a rule): the `html` element names
 * the page's main language with a valid tag, and follows the locale.
 *
 * Flags:
 *   - An `html` element in JSX with no `lang`, or `lang=""`.
 *   - A written-out `lang` on `html` (or on next/document's `Html`) that is
 *     not a valid language tag, such as `en_US`, `english` or `cn`.
 *   - A written-out `lang` on `html` in a layout under a locale segment,
 *     such as `app/[locale]/layout.tsx`, where the route gives the locale.
 *   - A `lang` on an element inside `html` that wraps `{children}`, such as
 *     the child of `body`, while `html` has none or is written another way.
 *
 * Left alone: next/document's `Html` with no `lang`, since Next.js sets it
 * from the `i18n` config, and whether the project has that config is not in
 * the file; `lang={locale}` on `html`, which is correct; a language switch
 * that never updates `lang`, which needs the whole project; and whether the
 * page's text is in the language `lang` names, which takes reading it.
 * Files that are not JSX, such as `index.html`, are not linted.
 */
import { defineRule } from "../lib/define-rule.js";
import { attributeValue, elementName, findAncestorElement, getAttribute, hasSpread, unwrap, walk } from "../lib/jsx.js";
import { invalidTagHint } from "../lib/language-helpers.js";

/** A layout under a dynamic locale segment of the App Router. */
const LOCALE_LAYOUT = /(^|[\\/])app[\\/](.*[\\/])?\[{1,2}\.{0,3}(locale|lang|lng|language)\]{1,2}[\\/]layout\.[cm]?[jt]sx?$/;

/** Whether an expression is `children` or `props.children`. @param {any} node */
const isChildren = (node) => {
  const n = unwrap(node);
  return (
    (n?.type === "Identifier" && n.name === "children") ||
    (n?.type === "MemberExpression" && !n.computed && n.property.name === "children")
  );
};

/** Whether an element renders `{children}` somewhere inside it. @param {any} element @param {any} keys */
function wrapsChildren(element, keys) {
  let found = false;
  walk(element, keys, (n) => {
    if (found) return false;
    if (n.type === "JSXExpressionContainer" && isChildren(n.expression)) found = true;
    return undefined;
  });
  return found;
}

export default defineRule({
  id: "STR-006",
  level: "rule",
  verdict: "Requirement",
  description: "An html element with no lang, an invalid tag, a fixed lang in a locale layout, or lang only on a wrapper.",
  messages: {
    missingLang:
      'this html element has no lang, so a screen reader, translation and spell checking each guess the page\'s language. Add lang with the main language\'s tag, such as lang="en", or lang={locale} when the app has several.',
    emptyLang: 'lang="" on html names no language. Give the main language\'s tag, such as lang="en", or lang={locale}.',
    invalidLang: 'lang="{{value}}" is not a valid language tag: {{hint}}. A screen reader cannot pick a voice from it.',
    literalInLocaleLayout:
      'this layout sits under a locale segment, but html says lang="{{value}}" for every locale. Read the locale from the route params and pass it: lang={locale}.',
    wrapperLang:
      "lang is set on this element around the app, not on html, so the page title, head and anything in a portal, such as dialogs, menus and toasts, fall back to what html says. Put the same lang on html instead.",
  },
  create(context) {
    const keys = /** @type {any} */ (context.sourceCode.visitorKeys);
    const filename = context.filename ?? "";
    return {
      JSXOpeningElement(opening) {
        const name = elementName(opening);
        const attribute = getAttribute(opening, "lang");
        const value = attributeValue(attribute);
        if (name === "html" || name === "Html") {
          if (!attribute) {
            if (name === "html" && !hasSpread(opening)) context.report({ node: opening, messageId: "missingLang" });
            return;
          }
          if (typeof value !== "string") return;
          if (value.trim() === "") {
            context.report({ node: attribute, messageId: "emptyLang" });
            return;
          }
          const hint = invalidTagHint(value);
          if (hint) {
            context.report({ node: attribute, messageId: "invalidLang", data: { value, hint } });
            return;
          }
          if (name === "html" && LOCALE_LAYOUT.test(filename))
            context.report({ node: attribute, messageId: "literalInLocaleLayout", data: { value } });
          return;
        }
        if (!attribute) return;
        const element = opening.parent;
        const html = findAncestorElement(element, (n) => n === "html");
        if (!html || !wrapsChildren(element, keys)) return;
        const htmlLang = getAttribute(html.openingElement, "lang");
        if (hasSpread(html.openingElement)) return;
        const text = (/** @type {any} */ a) => (a?.value ? context.sourceCode.getText(a.value) : undefined);
        if (htmlLang && text(htmlLang) === text(attribute)) return;
        context.report({ node: attribute, messageId: "wrapperLang" });
      },
    };
  },
});
