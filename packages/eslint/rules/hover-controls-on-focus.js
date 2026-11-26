/**
 * justified/hover-controls-on-focus, for KBD-001 (a requirement): what a
 * pointer can do, the keyboard can do too, and focus shows.
 *
 * Flags controls shown only on hover: an element whose class list hides it
 * (`opacity-0`, `hidden` or `invisible`) and shows it again behind a hover
 * variant (`group-hover:opacity-100`, `hover:opacity-100`,
 * `group-hover:flex`, `group-hover:visible` …), with no class behind a
 * focus variant on the same element, such as `group-focus-within:opacity-100`
 * or `focus-visible:opacity-100`. The element must be a control, or hold a
 * button, link or field written in the same JSX.
 *
 * Responsive variants (`sm:`, `md:` …) and `dark:` are ignored when the
 * classes are matched.
 *
 * Left alone:
 *   - Class lists the code does not state in full, such as a prop or a
 *     constant with branches, and elements that spread props.
 *   - Elements with any class behind a focus variant: whether it shows the
 *     controls well enough is for review. A touch-screen class such as
 *     `[@media(hover:none)]:opacity-100` does not count, since the controls
 *     stay hidden from a keyboard on a desktop.
 *   - Elements whose only controls have `tabIndex={-1}`: Tab never reaches
 *     them, so a focus class would not help. Other checks cover that.
 */
import { defineRule } from "../lib/define-rule.js";
import { allTokens, parseToken, readClassList } from "../lib/class-token-helpers.js";
import { attributeValue, elementName, getAttribute, hasSpread, unwrap, walk } from "../lib/jsx.js";

const IGNORED_VARIANTS = /^(sm|md|lg|xl|2xl|dark|@\w+|max-\w+|min-\w+)$/;
const HIDES = new Set(["opacity-0", "hidden", "invisible"]);
const SHOWS =
  /^(opacity-(?!0$)\d+|visible|block|inline|inline-block|flex|inline-flex|grid|inline-grid|contents|table|table-row|table-cell)$/;
const CONTROLS = new Set(["button", "a", "input", "select", "textarea", "summary"]);
const CONTROL_COMPONENTS = new Set([
  "Button",
  "Link",
  "NavLink",
  "Input",
  "Textarea",
  "Checkbox",
  "Switch",
  "Toggle",
  "SelectTrigger",
  "DropdownMenuTrigger",
  "PopoverTrigger",
  "TooltipTrigger",
  "DialogTrigger",
  "AlertDialogTrigger",
  "SheetTrigger",
  "SidebarMenuAction",
]);

/** The variants that matter here. @param {string} token */
const significant = (token) => {
  const { variants, utility } = parseToken(token);
  return { variants: variants.filter((v) => !IGNORED_VARIANTS.test(v)), utility };
};

/** Whether an element takes keyboard focus as written. @param {any} opening */
const isControl = (opening) => {
  const name = elementName(opening) ?? "";
  const tabIndex = getAttribute(opening, "tabIndex");
  if (tabIndex) {
    const e = tabIndex.value?.type === "JSXExpressionContainer" ? unwrap(tabIndex.value.expression) : undefined;
    // `tabIndex={-1}` is a unary minus on a number.
    if (e?.type === "UnaryExpression" && e.operator === "-" && e.argument.type === "Literal") return false;
    const v = attributeValue(tabIndex);
    // A tabIndex the code does not state may be either; count it as reachable only when it is.
    return v !== undefined && Number(v) >= 0;
  }
  if (name === "a") return Boolean(getAttribute(opening, "href"));
  if (name === "input") return attributeValue(getAttribute(opening, "type")) !== "hidden";
  return CONTROLS.has(name) || CONTROL_COMPONENTS.has(name.split(".").pop() ?? "");
};

export default defineRule({
  id: "KBD-001",
  level: "rule",
  verdict: "Requirement",
  description: "Controls shown only on hover, with no focus class that shows them too.",
  messages: {
    hoverOnly:
      "{{hide}} with {{show}} shows these controls only while the pointer is over them, so someone using the keyboard cannot see them, or cannot reach them at all. Show them on focus too, for example with group-focus-within:{{again}} or focus-within:{{again}} next to the hover class.",
  },
  create(context) {
    const keys = context.sourceCode.visitorKeys;

    /** Whether the element is, or holds, a control the keyboard reaches. @param {any} element */
    const holdsControl = (element) => {
      let found = false;
      walk(element, keys, (n) => {
        if (found) return false;
        if (n.type === "JSXOpeningElement" && isControl(n)) found = true;
        return undefined;
      });
      return found;
    };

    return {
      JSXOpeningElement(node) {
        if (hasSpread(node)) return;
        const list = readClassList(context, node);
        if (!list || !list.complete || list.passThrough) return;
        const tokens = allTokens(list);
        if (tokens.some((t) => parseToken(t).variants.some((v) => v.includes("focus")))) return;

        // Hiding and showing must be there whatever the branches do; any focus class anywhere is enough.
        const parsed = list.certain.map((t) => ({ token: t, ...significant(t) }));
        const hide = parsed.find((p) => p.variants.length === 0 && HIDES.has(p.utility));
        if (!hide) return;
        const show = parsed.find(
          (p) =>
            p.variants.length > 0 &&
            p.variants.every((v) => /^(group-|peer-)?hover(\/[\w-]+)?$/.test(v)) &&
            (hide.utility === "opacity-0"
              ? /^opacity-(?!0$)\d+$/.test(p.utility)
              : hide.utility === "invisible"
                ? p.utility === "visible"
                : SHOWS.test(p.utility) && !p.utility.startsWith("opacity") && p.utility !== "visible"),
        );
        if (!show) return;
        if (!holdsControl(node.parent)) return;
        context.report({
          node: getAttribute(node, "className") ?? node,
          messageId: "hoverOnly",
          data: { hide: hide.token, show: show.token, again: show.utility },
        });
      },
    };
  },
});
