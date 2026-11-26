/**
 * justified/hover-and-press-looks, for VIS-008 (a rule): everything that does
 * something when pressed changes its look while pressed and, where the
 * pointer can hover, while the pointer is over it. A control that is off
 * shows neither change.
 *
 * Flags, from the classes the code states:
 *   1. A `Card`, `div`, `li` or `tr` with `onClick`, a `Card` that is the
 *      only child of a link, or a `Card` with a link stretched over it
 *      (`after:absolute after:inset-0`), with no `hover:` or `active:` look
 *      on it or the link. `group-hover:`, `group-active:`, `has-[…]:` and
 *      looks behind other variants count. A `div`, `li` or `tr` needs a
 *      `className` to be read, and a `div` also `cursor-pointer`, a `role`
 *      or a `tabIndex`, since a `div` with `onClick` is often a wrapper that
 *      catches its children's clicks. A `Card` without a `className` has no
 *      look.
 *   2. `hover:bg-transparent` on a `Button`, a menu, command or select item
 *      with no other `hover:` look, and `focus:bg-transparent` or
 *      `data-[highlighted]:bg-transparent` on a menu item with no other
 *      `focus:` or `data-[highlighted]:` look in its place.
 *   3. `hover:` or `active:` looks on an element that carries
 *      `aria-disabled`, with no `not-aria-disabled:` scope and no
 *      `aria-disabled:` override, so a control that is off still reacts.
 *
 * Left alone:
 *   - Class lists the code does not state in full, and elements that spread
 *     props or take the caller's `className`: the look may come from there.
 *   - An element with `group`, whose children may carry the look.
 *   - `onClick` that only stops or prevents the event, as on a wrapper.
 *   - shadcn's `Button`, `TableRow`, menu items and the like as they are:
 *     their definitions carry the looks, and lint reads each usage, not the
 *     `cva` definition in `components/ui/`. The review skill reads that.
 *   - Whole containers (a bar, dialog, sheet or panel) and native controls
 *     left with the browser's styling, which this check never reads.
 *   - Whether a look is plain enough to see, and a static card with a hover
 *     look (our own advice, not the rule).
 */
import { defineRule } from "../lib/define-rule.js";
import { parseToken, readClassList } from "../lib/class-token-helpers.js";
import { attributeValue, elementName, getAttribute, hasSpread, unwrap, walk } from "../lib/jsx.js";

const CLICKABLE = new Set(["Card", "div", "li", "tr"]);
const LINKS = new Set(["a", "Link", "NavLink"]);
const HOVER_ITEMS = /^(Button|DropdownMenuItem|DropdownMenuCheckboxItem|DropdownMenuRadioItem|ContextMenuItem|MenubarItem|CommandItem|SelectItem|NavigationMenuLink)$/;
const MENU_ITEMS = /^(DropdownMenu(Checkbox|Radio)?Item|ContextMenu(Checkbox|Radio)?Item|Menubar(Checkbox|Radio)?Item|CommandItem|SelectItem)$/;

/** Whether a variant shows hover or press. @param {string} v */
const isPointerVariant = (v) =>
  /^(group-|peer-)?(hover|active)(\/[\w-]+)?$/.test(v) || v.startsWith("has-") || /:(hover|active)\b/.test(v);

/** Whether a token draws a hover or press look. @param {string} token */
const isLook = (token) => {
  const { variants, utility } = parseToken(token);
  return variants.some(isPointerVariant) && !/^cursor-/.test(utility);
};

/** Whether a token is scoped away from an off control. @param {string} token */
const scopedOff = (token) =>
  parseToken(token).variants.some((v) => /^not-(aria-disabled|aria-\[disabled(=true)?\]|\[\[aria-disabled(=true)?\]\])$/.test(v) || /not\(\[aria-disabled/.test(v));

/** Whether `onClick` only stops or prevents the event. @param {any} attribute */
function onlyStops(attribute) {
  const fn = attribute?.value?.type === "JSXExpressionContainer" ? unwrap(attribute.value.expression) : undefined;
  if (!fn || (fn.type !== "ArrowFunctionExpression" && fn.type !== "FunctionExpression")) return false;
  const body = fn.body.type === "BlockStatement" ? fn.body.body : [{ type: "ExpressionStatement", expression: fn.body }];
  return (
    body.length > 0 &&
    body.every((/** @type {any} */ s) => {
      const call = s.type === "ExpressionStatement" ? unwrap(s.expression) : undefined;
      const callee = call?.type === "CallExpression" ? unwrap(call.callee) : undefined;
      return callee?.type === "MemberExpression" && /^(stopPropagation|preventDefault)$/.test(callee.property.name);
    })
  );
}

export default defineRule({
  id: "VIS-008",
  level: "rule",
  verdict: "Unanimous (3 of 3)",
  description:
    "A clickable Card, div, li or tr with no hover or press look, hover:bg-transparent with nothing in its place on a Button or menu item, and hover or press looks on an aria-disabled element.",
  messages: {
    noLook:
      "this {{name}} does something when pressed but has no hover: or active: look, so nothing changes under the pointer or the finger. Add both, such as hover:bg-accent and active:shadow-inner; a pointing cursor is not a change of the element.",
    stripped:
      "{{token}} takes the highlight off this {{name}} and puts nothing in its place, so the item under the pointer or the keyboard looks like every other. Leave the component's own look, or give it another one, such as hover:text-foreground or hover:underline.",
    offReacts:
      "this element carries aria-disabled but {{token}} still changes it under the pointer or the press, so a control that is off looks as if it works. Scope the looks with not-aria-disabled:, as in not-aria-disabled:hover:bg-accent.",
  },
  create(context) {
    const keys = context.sourceCode.visitorKeys;

    /** The class list if the code states it in full and nothing else can add to it. @param {any} opening */
    const knownList = (opening) => {
      if (hasSpread(opening)) return undefined;
      const list = readClassList(context, opening);
      if (!list) return { tokens: [], present: false };
      if (!list.complete || list.passThrough) return undefined;
      return { tokens: list.parts.flatMap((p) => p.tokens), present: true };
    };

    /** Whether the list has a look, or a `group` whose children may carry it. @param {string[]} tokens */
    const hasLook = (tokens) => tokens.some((t) => isLook(t) || /^group(\/[\w-]+)?$/.test(t));

    /** A link stretched over the card: `after:absolute after:inset-0` or `before:…`. @param {any} element */
    const stretchedLink = (element) => {
      let found;
      walk(element, keys, (n) => {
        if (found) return false;
        if (n.type !== "JSXOpeningElement" || !LINKS.has(elementName(n) ?? "")) return undefined;
        const tokens = readClassList(context, n)?.certain ?? [];
        for (const pseudo of ["after", "before"]) {
          const has = (/** @type {string} */ u) => tokens.some((t) => {
            const p = parseToken(t);
            return p.variants.length === 1 && p.variants[0] === pseudo && p.utility === u;
          });
          if (has("absolute") && (has("inset-0") || (has("inset-x-0") && has("inset-y-0")))) found = n;
        }
        return undefined;
      });
      return found;
    };

    return {
      JSXElement(element) {
        const opening = element.openingElement;
        const name = elementName(opening) ?? "";

        // 1. Clickable cards, items and rows.
        if (CLICKABLE.has(name)) {
          const onClick = getAttribute(opening, "onClick");
          const list = knownList(opening);
          if (!list) return;
          if (onClick && !onlyStops(onClick)) {
            if (name !== "Card" && !list.present) return;
            // A div with onClick is often a wrapper that catches its children's clicks: read it only when it is
            // drawn or marked as one target.
            if (name === "div" && !list.tokens.includes("cursor-pointer") && !getAttribute(opening, "role") && !getAttribute(opening, "tabIndex")) return;
            // A backdrop or a layer over the page is a whole container, not a control.
            if (list.tokens.includes("fixed") || (list.tokens.includes("absolute") && list.tokens.includes("inset-0"))) return;
            if (!hasLook(list.tokens)) context.report({ node: opening, messageId: "noLook", data: { name } });
            return;
          }
          if (name !== "Card") return;
          // A link stretched over a card.
          const link = stretchedLink(element);
          if (link) {
            const linkList = knownList(link);
            if (linkList && !hasLook(list.tokens) && !hasLook(linkList.tokens))
              context.report({ node: opening, messageId: "noLook", data: { name } });
            return;
          }
          // A link round a card.
          const parent = element.parent;
          if (parent?.type === "JSXElement" && LINKS.has(elementName(parent.openingElement) ?? "")) {
            const others = parent.children.filter(
              (/** @type {any} */ c) => c !== element && !(c.type === "JSXText" && c.value.trim() === ""),
            );
            const linkList = knownList(parent.openingElement);
            if (!others.length && linkList && !hasLook(list.tokens) && !hasLook(linkList.tokens))
              context.report({ node: opening, messageId: "noLook", data: { name } });
          }
        }
      },
      JSXOpeningElement(node) {
        const name = elementName(node) ?? "";
        const list = readClassList(context, node);
        if (!list) return;
        const tokens = list.certain;
        const at = getAttribute(node, "className");

        // 2. A highlight taken away with nothing in its place.
        const base = name.split(".").pop() ?? "";
        if (HOVER_ITEMS.test(base) && list.complete && !(base === "Button" && attributeValue(getAttribute(node, "variant")) === "link")) {
          const all = list.parts.flatMap((p) => p.tokens);
          const stripped = (/** @type {RegExp} */ variant) =>
            tokens.find((t) => {
              const p = parseToken(t);
              return p.variants.length === 1 && variant.test(p.variants[0]) && /^bg-transparent$/.test(p.utility);
            });
          const replaced = (/** @type {RegExp} */ variant, /** @type {string} */ except) =>
            all.some((t) => {
              if (t === except) return false;
              const p = parseToken(t);
              return p.variants.some((v) => variant.test(v)) && !/^(cursor-|bg-transparent$)/.test(p.utility);
            });
          const hover = stripped(/^hover$/);
          if (hover && !replaced(/^(hover|active)$/, hover))
            context.report({ node: at, messageId: "stripped", data: { token: hover, name: base } });
          else if (MENU_ITEMS.test(base)) {
            const highlight = stripped(/^(focus|data-\[highlighted\]|data-highlighted|data-\[selected=true\])$/);
            if (highlight && !replaced(/^(focus|focus-visible|data-\[highlighted\]|data-highlighted|data-\[selected=true\])$/, highlight))
              context.report({ node: at, messageId: "stripped", data: { token: highlight, name: base } });
          }
        }

        // 3. Looks on a control that is off.
        const disabled = getAttribute(node, "aria-disabled");
        const value = attributeValue(disabled);
        if (disabled && value !== false && value !== "false") {
          const overridden = tokens.some((t) => {
            const p = parseToken(t);
            return p.variants.some((v) => /^aria-disabled$|^aria-\[disabled/.test(v)) && (p.variants.some(isPointerVariant) || p.utility === "pointer-events-none");
          });
          if (overridden) return;
          if (getAttribute(node, "disabled") && tokens.includes("disabled:pointer-events-none")) return;
          const look = tokens.find((t) => isLook(t) && !scopedOff(t));
          if (look) context.report({ node: at, messageId: "offReacts", data: { token: look } });
        }
      },
    };
  },
});
