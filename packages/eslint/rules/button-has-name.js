/**
 * justified/button-has-name, for ACT-001b (a rule): a button that shows no
 * text has a name that says what pressing it does, and a button that shows
 * text has a name that contains those words in the same order.
 *
 * Looks at `<Button>`, `<button>`, and `<TooltipTrigger>` without
 * `asChild` (which renders a button), and flags:
 *   - An icon-only button, or an empty `<button>` or `<Button size="icon">`,
 *     with no `aria-label`, `aria-labelledby` or `title`. When the button
 *     sits in a `TooltipTrigger`, the message says the tooltip is not a
 *     name to count on.
 *   - A written-out `aria-label` that does not contain the written-out
 *     visible text, compared without case and punctuation.
 *   - On an icon-only button, a written-out `aria-label` that names the
 *     picture ("Gear", "Bin", "Three dots") or ends with "button".
 *   - An icon with its own `aria-label`, `aria-labelledby` or `<title>`, and
 *     no `aria-hidden="true"`, inside a button that shows text.
 *
 * Icons are inline `svg`, components imported from icon packages (lucide,
 * Radix icons, Tabler, react-icons, Heroicons, Phosphor, or a module path
 * ending in `/icons`), and components whose name ends in "Icon".
 *
 * Left alone: buttons with `asChild` or spread props (the name may come
 * from the child or the spread), buttons passed as a prop such as
 * `render={<Button />}` (the component that takes it adds the children and
 * may add the name), names and children computed in
 * expressions, children that are other components (they may render text),
 * visible text that spells no word, such as "A+" or "@" (the rule's
 * exception for symbols), and names that hold the visible text without
 * starting with it, since starting with it is advice. Whether a computed
 * name says what the button does needs review.
 */
import { defineRule } from "../lib/define-rule.js";
import {
  attributeValue,
  baseName,
  elementName,
  getAttribute,
  hasSpread,
  isPropValue,
  meaningfulChildren,
  parentElement,
  staticValue,
} from "../lib/jsx.js";
import {
  containsWords,
  iconImports,
  isAriaHidden,
  isIcon,
  normalize,
  spellsWord,
  stringAttribute,
  visibleText,
} from "../lib/name-helpers.js";

/** Names that describe an icon's picture, compared after `normalize`. */
const PICTURES = new Set([
  "gear",
  "cog",
  "cogwheel",
  "bin",
  "trash",
  "trash can",
  "wastebasket",
  "three dots",
  "dots",
  "ellipsis",
  "kebab",
  "hamburger",
  "x",
  "cross",
  "pencil",
  "magnifying glass",
  "icon",
]);

const NAME_ATTRIBUTES = ["aria-label", "aria-labelledby", "title"];

/** Whether an icon carries a name of its own. @param {any} icon A JSXElement. */
function iconHasOwnName(icon) {
  const opening = icon.openingElement;
  if (getAttribute(opening, "aria-label") || getAttribute(opening, "aria-labelledby")) return true;
  return icon.children.some((c) => c.type === "JSXElement" && elementName(c.openingElement) === "title");
}

export default defineRule({
  id: "ACT-001b",
  level: "rule",
  verdict: "Requirement",
  description:
    "Buttons with no name, an aria-label without the visible words, a name that describes the icon, or an icon whose label joins the visible text.",
  messages: {
    noName:
      'this button shows only an icon and has no name, so a screen reader says just "button". Add an aria-label that says what pressing it does, such as "Remove attachment", or put that text in a span with the sr-only class inside it.',
    tooltipOnly:
      "this icon button has no name of its own. Whether a tooltip is read as the name depends on how it is built, so do not count on it. Set an aria-label on the button that says what pressing it does; the tooltip can stay.",
    labelMissesText:
      'the aria-label "{{label}}" does not contain the visible text "{{text}}", so a speech command for the words on screen does nothing. Put the visible words in the name in the same order, or remove the aria-label so the text is the name.',
    pictureName:
      'the name "{{label}}" describes the icon, not what pressing the button does. Name the action instead, such as "Open settings" or "Remove attachment".',
    roleInName:
      'the name "{{label}}" ends with the word "button", which a screen reader already says. Name only the action, such as "Remove attachment".',
    namedIcon:
      'this icon has a name of its own inside a button that shows text, so its words join the button\'s name. Give the icon aria-hidden="true" and no label, so the visible words are the name.',
  },
  create(context) {
    /** @type {Set<string>} */
    let icons = new Set();

    return {
      Program(node) {
        icons = iconImports(node);
      },
      JSXElement(element) {
        const opening = element.openingElement;
        const name = elementName(opening);
        const isTrigger = name === "TooltipTrigger" && !getAttribute(opening, "asChild");
        if (!(name === "Button" || name === "button" || isTrigger)) return;
        if (getAttribute(opening, "asChild") || hasSpread(opening) || isPropValue(element)) return;
        if (getAttribute(opening, "dangerouslySetInnerHTML") || getAttribute(opening, "children")) return;

        const named = NAME_ATTRIBUTES.some((a) => getAttribute(opening, a));
        const children = meaningfulChildren(element);
        const iconOnly = children.length > 0 && children.every((c) => c.type === "JSXElement" && isIcon(c, icons));
        const size = attributeValue(getAttribute(opening, "size"));
        const iconSize = typeof size === "string" && size.startsWith("icon");

        // 1. No name at all.
        if (!named) {
          const nameless = iconOnly
            ? !children.some(iconHasOwnName)
            : children.length === 0 && (name === "button" || iconSize);
          if (nameless) {
            const parent = parentElement(element);
            const inTooltip = isTrigger || (parent && baseName(parent.openingElement) === "TooltipTrigger");
            context.report({ node: opening, messageId: inTooltip ? "tooltipOnly" : "noName" });
            return;
          }
        }

        const labelAttribute = getAttribute(opening, "aria-label");
        const label = stringAttribute(opening, "aria-label");

        // 3. An icon-only button named after its picture or with its role.
        if (iconOnly && label !== undefined) {
          const n = normalize(label);
          const picture = PICTURES.has(n) || PICTURES.has(n.replace(/ icon$/, ""));
          if (picture) context.report({ node: labelAttribute, messageId: "pictureName", data: { label } });
          else if (/\S \bbutton$/.test(n))
            context.report({ node: labelAttribute, messageId: "roleInName", data: { label } });
          return;
        }

        // 2. A name that leaves out the visible words. aria-labelledby wins over aria-label, so leave it to review.
        if (label !== undefined && !getAttribute(opening, "aria-labelledby")) {
          const text = visibleText(element, icons);
          if (text && spellsWord(text) && !containsWords(label, text)) {
            context.report({ node: labelAttribute, messageId: "labelMissesText", data: { label, text } });
          }
          return;
        }

        // 5. A named icon beside visible text, when the button itself sets no name.
        if (!labelAttribute && !getAttribute(opening, "aria-labelledby")) {
          const showsText = children.some(
            (c) =>
              (c.type === "JSXText" && c.value.trim() !== "") ||
              (c.type === "JSXExpressionContainer" &&
                typeof staticValue(c.expression) === "string" &&
                String(staticValue(c.expression)).trim() !== ""),
          );
          if (!showsText) return;
          for (const c of children) {
            if (c.type === "JSXElement" && isIcon(c, icons) && !isAriaHidden(c.openingElement) && iconHasOwnName(c)) {
              context.report({ node: c.openingElement, messageId: "namedIcon" });
            }
          }
        }
      },
    };
  },
});
