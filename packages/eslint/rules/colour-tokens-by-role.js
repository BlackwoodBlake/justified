/**
 * justified/colour-tokens-by-role, for VIS-002 (a rule): each colour token
 * is used only for its role and its pairs, and raw palette classes never
 * colour something that carries meaning.
 *
 * Flags, from the classes the code states:
 *   1. A raw palette colour (`text-gray-500`, `border-slate-200`,
 *      `ring-blue-500`, `text-white`, `text-[#333]` …) on text or an edge:
 *      `text-`, `placeholder-`, `border-`, `divide-`, `ring-`, `ring-offset-`,
 *      `outline-`, `decoration-`, `caret-` and `accent-`. A palette `bg-`
 *      only on a control (`button`, `a`, `Button`, `Badge`, `Input` …),
 *      behind a state variant (`hover:`, `aria-selected:`, `data-[state=…]:`),
 *      or as `dark:` next to a token fill (`bg-card dark:bg-zinc-900`). A hex
 *      or colour function in `style` for `color` or a border or outline
 *      colour, and for a background on a control.
 *   2. A foreground on someone else's fill on the same element, under the
 *      same variants: `text-primary-foreground` with `bg-muted`. For
 *      `text-foreground` and `text-muted-foreground`, only on the strong
 *      fills (`primary`, `destructive`, `success`, `warning`, `info`).
 *   3. `border-border` on a field: `Input`, `Textarea`, `NativeSelect`,
 *      `SelectTrigger`, a native text field, or anything with
 *      `role="combobox"`.
 *   4. `ring-ring`, `border-ring` or `outline-ring` behind a selection
 *      variant with no focus variant, such as `aria-selected:ring-ring` or
 *      `data-[state=checked]:border-ring`.
 *
 * Left alone:
 *   - Anything in an `svg`, `img`, `picture`, `video` or `canvas`, and icon
 *     components, shadcn's `Spinner` among them: illustrations and photos are the rule's exception, and
 *     whether an icon carries meaning takes judgement.
 *   - A palette `bg-` on a plain layout element, which may be decoration.
 *   - Classes only a branch adds (`cond && "…"`, or one side of `?:`): the
 *     branch may never be taken for the code at hand. Classes both sides add
 *     count.
 *   - Fills with an opacity (`bg-primary/10`), elements with two text
 *     colours or two fills under the same variants, and the pair check on
 *     class lists the code does not state in full.
 *   - `text-white` or `text-black` on text that sits on a photo or picture
 *     (an `img`, `svg`, `video` or background image up to three levels out):
 *     no token pairs with a photo, and VIS-001 measures such text.
 *   - `muted-foreground` or `foreground` on `accent`, `secondary`, `card` or
 *     `popover`: they are light fills in both shadcn themes, and shadcn's own
 *     components put them there.
 *   - `ring-ring` with no variant, which may draw focus in a picture or a
 *     focus state set by script, and `data-[selected=true]:` in a command
 *     menu, which marks the item the keyboard is on.
 *   - Meaning-based parts: `text-destructive` for a sale price, `bg-success`
 *     as a brand colour, `--chart-*` for status, and pairs split across
 *     parent and child. The review skill covers them.
 *   - Classes inside `cva()` and other functions: only `className` and
 *     `style` on JSX elements are read.
 */
import { defineRule } from "../lib/define-rule.js";
import { parseToken, plainClassLiteral, readClassList } from "../lib/class-token-helpers.js";
import { attributeValue, elementName, findAncestorElement, getAttribute, parentElement, unwrap } from "../lib/jsx.js";

const PALETTE =
  "(?:slate|gray|zinc|neutral|stone|mauve|olive|mist|taupe|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950)|black|white";
const ARBITRARY = String.raw`\[(?:color:)?(?:#[0-9a-fA-F]{3,8}|(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color)\(.*\))\]`;
const COLOUR = `(?:${PALETTE}|${ARBITRARY})(?:/\\S+)?`;
const RAW_INK = new RegExp(
  `^(?:text|placeholder|border(?:-[xytrblse])?|divide|ring|ring-offset|outline|decoration|caret|accent)-${COLOUR}$`,
);
const RAW_FILL = new RegExp(`^bg-${COLOUR}$`);
const COLOUR_VALUE = /^\s*(#[0-9a-fA-F]{3,8}|(rgba?|hsla?|oklch|oklab|lab|lch|hwb|color)\()/;

// shadcn's `Spinner` draws a lucide icon, so it counts as an icon here.
const SKIP_ELEMENTS = new Set(["svg", "img", "picture", "video", "canvas", "Spinner"]);
const MEDIA = new Set(["svg", "img", "picture", "video", "canvas", "Image", "AspectRatio"]);
const ICON_SOURCES =
  /^(lucide-react|@radix-ui\/react-icons|@tabler\/icons-react|@heroicons\/react(\/.*)?|@phosphor-icons\/react|react-icons(\/.*)?)$/;
const CONTROLS = new Set(["button", "a", "input", "select", "textarea", "summary"]);
const CONTROL_COMPONENTS = new Set([
  "Button",
  "Badge",
  "Input",
  "Textarea",
  "SelectTrigger",
  "Toggle",
  "ToggleGroupItem",
  "TabsTrigger",
  "Link",
  "NavLink",
]);
const CONTROL_ROLES = new Set([
  "button",
  "link",
  "tab",
  "checkbox",
  "radio",
  "switch",
  "option",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "combobox",
  "slider",
]);
const STATE_VARIANT =
  /^(group-|peer-)?(hover|focus|focus-visible|focus-within|active|checked|disabled|enabled|selected|open|invalid|indeterminate|aria-.+|data-(selected|active|highlighted|disabled|checked|pressed|open)|data-\[(state|selected|active|highlighted|disabled|checked|pressed|invalid)[=\]].*)(\/[\w-]+)?$/;
const SELECTION_VARIANT =
  /^(group-|peer-)?(aria-(selected|checked|pressed)|aria-\[(selected|checked|pressed)=true\]|checked|has-checked|has-\[:checked\]|has-\[\[aria-(selected|checked|pressed)=true\]\]|data-\[state=(checked|on|active)\]|data-\[selected-single=true\])(\/[\w-]+)?$/;

/** Fills with a foreground of their own. */
const FILLS = new Set([
  "primary",
  "secondary",
  "accent",
  "destructive",
  "card",
  "popover",
  "muted",
  "success",
  "warning",
  "info",
  "sidebar",
  "sidebar-primary",
  "sidebar-accent",
]);
/** Fills that `foreground` and `muted-foreground` are never read on. */
const STRONG = new Set(["primary", "destructive", "success", "warning", "info", "sidebar-primary"]);
const TOKEN_FILLS = new Set([...FILLS, "background", "input"]);

const TEXT_NOT_COLOUR =
  /^text-(xs|sm|base|lg|\d?xl|left|center|right|justify|start|end|wrap|nowrap|balance|pretty|ellipsis|clip|\[(length:|\d).*|\((length:).*)$/;
const FIELDS = new Set(["Input", "Textarea", "NativeSelect", "SelectTrigger", "textarea", "select"]);
const NOT_TEXT_INPUTS = new Set([
  "checkbox",
  "radio",
  "hidden",
  "range",
  "color",
  "file",
  "submit",
  "button",
  "reset",
  "image",
]);
const LAYOUT_VARIANTS = /^(dark|sm|md|lg|xl|2xl)$/;

/** @param {string} s */
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

export default defineRule({
  id: "VIS-002",
  level: "rule",
  verdict: "Unanimous (3 of 3)",
  description:
    "Raw palette colours on text, controls, states and edges, foregrounds on another token's fill, border-border on fields, and the ring colour used for selection.",
  hasSuggestions: true,
  messages: {
    rawPalette:
      "raw palette colours ({{classes}}) colour text, a control, a state or an edge here. They have no role, do not follow the theme, and no contrast test covers them. Use the token for the role, such as text-muted-foreground, border-input, or bg-primary with text-primary-foreground.",
    darkMix:
      "{{dark}} mixes a raw palette colour into the token fill {{fill}}, so the dark theme rests on a palette the tests never see. Let the token carry both themes, or add a token with a role and test its pair.",
    rawStyle:
      "the style sets {{property}} to {{value}}, a colour with no role that does not follow the theme. Use a colour token instead, such as var(--foreground) or a class like text-muted-foreground.",
    wrongFill:
      "{{text}} sits on {{fill}} on the same element. A foreground is tested only against its own fill, so this pair is measured nowhere. Use {{partner}} on this fill.",
    fieldEdge:
      "{{token}} edges this field with the divider colour, which is too faint for the only sign of where the field is. Use border-input for the edge of a field.",
    ringSelection:
      "{{token}} shows a selected state in the focus ring's colour, so the selected item looks as if it has focus. Keep ring for focus, and show the selection another way, such as bg-accent with a check mark or a word.",
    suggestBorderInput: "Use border-input instead of border-border.",
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const icons = new Set();

    /** @param {any} node */
    const skipped = (node) => {
      const name = elementName(node) ?? "";
      if (SKIP_ELEMENTS.has(name) || icons.has(name.split(".")[0]) || /Icon$/.test(name)) return true;
      return Boolean(findAncestorElement(node, (n) => n === "svg"));
    };

    /** @param {any} node */
    const isControl = (node) => {
      const name = elementName(node) ?? "";
      const role = attributeValue(getAttribute(node, "role"));
      return (
        CONTROLS.has(name) ||
        CONTROL_COMPONENTS.has(name.split(".").pop() ?? "") ||
        (typeof role === "string" && CONTROL_ROLES.has(role))
      );
    };

    /** @param {any} node */
    const isField = (node) => {
      const name = elementName(node) ?? "";
      if (attributeValue(getAttribute(node, "role")) === "combobox") return true;
      if (FIELDS.has(name)) return true;
      if (name !== "input") return false;
      const type = attributeValue(getAttribute(node, "type"));
      return !(typeof type === "string" && NOT_TEXT_INPUTS.has(type));
    };

    /** Raw palette and its mixes. @param {any} node @param {string[]} tokens @param {any} at */
    const checkPalette = (node, tokens, at) => {
      const control = isControl(node);
      let media;
      const parsed = tokens.map((t) => ({ token: t, ...parseToken(t) }));
      const raw = [];
      for (const p of parsed) {
        if (RAW_INK.test(p.utility)) {
          if (/-(white|black)(\/\S+)?$/.test(p.utility) && p.utility.startsWith("text-") && (media ??= overMedia(node)))
            continue;
          raw.push(p.token);
        } else if (RAW_FILL.test(p.utility)) {
          if (control || p.variants.some((v) => STATE_VARIANT.test(v))) raw.push(p.token);
          else if (p.variants.includes("dark")) {
            const rest = p.variants.filter((v) => v !== "dark").join(":");
            const fill = parsed.find(
              (q) =>
                !q.variants.includes("dark") &&
                q.variants.join(":") === rest &&
                TOKEN_FILLS.has(q.utility.replace(/^bg-/, "")) &&
                q.utility.startsWith("bg-"),
            );
            if (fill) context.report({ node: at, messageId: "darkMix", data: { dark: p.token, fill: fill.token } });
          }
        }
      }
      if (raw.length)
        context.report({
          node: at,
          messageId: "rawPalette",
          data: { classes: [...new Set(raw)].slice(0, 3).join(", ") },
        });
    };

    /** Foregrounds on another fill, among the tokens that are there for certain. @param {string[]} tokens @param {any} at */
    const checkPairs = (tokens, at) => {
      /** @type {Map<string, { text: string[], bg: string[] }>} */
      const byVariant = new Map();
      for (const token of tokens) {
        const { variants, utility } = parseToken(token);
        const kind =
          utility.startsWith("text-") && !TEXT_NOT_COLOUR.test(utility)
            ? "text"
            : utility.startsWith("bg-")
              ? "bg"
              : undefined;
        if (!kind) continue;
        const key = variants.join(":");
        if (!byVariant.has(key)) byVariant.set(key, { text: [], bg: [] });
        /** @type {any} */ (byVariant.get(key))[kind].push(token);
      }
      for (const { text, bg } of byVariant.values()) {
        // Two text colours or two fills under the same variants: which one wins depends on cn or the CSS order.
        if (text.length !== 1 || bg.length !== 1) continue;
        const ink = parseToken(text[0]).utility.match(/^text-(?:(.+)-)?foreground$/);
        const fill = parseToken(bg[0]).utility.match(/^bg-([a-z-]+)$/);
        if (!ink || !fill || !FILLS.has(fill[1])) continue;
        const x = ink[1] ?? "";
        const y = fill[1];
        if (x === y) continue;
        if (x === "" || x === "muted" ? !STRONG.has(y) : !FILLS.has(x)) continue;
        context.report({
          node: at,
          messageId: "wrongFill",
          data: { text: text[0], fill: bg[0], partner: `text-${y}-foreground` },
        });
      }
    };

    /**
     * Whether the element sits on a photo or picture: an element up to three
     * levels out holds an img, picture, video, svg or next/image, or a
     * background image. White or black text there has no token to pair with.
     * @param {any} node
     */
    const overMedia = (node) => {
      let el = node.parent;
      for (let level = 0; level < 3 && el; level++) {
        el = parentElement(el);
        if (!el) break;
        const tokens = readClassList(context, el.openingElement)?.certain ?? [];
        if (tokens.some((t) => /^bg-(\[url|cover$)/.test(parseToken(t).utility))) return true;
        const media = el.children.some(
          (c) => c.type === "JSXElement" && MEDIA.has(elementName(c.openingElement) ?? ""),
        );
        if (media) return true;
      }
      return false;
    };

    return {
      ImportDeclaration(node) {
        if (!ICON_SOURCES.test(String(node.source.value))) return;
        for (const s of node.specifiers) icons.add(s.local.name);
      },
      JSXOpeningElement(node) {
        if (skipped(node)) return;
        const at = getAttribute(node, "className");
        const list = readClassList(context, node);
        if (list) {
          // Presence checks read only what is there whatever the branches do.
          const tokens = list.certain;
          checkPalette(node, tokens, at);
          if (list.complete) checkPairs(tokens, at);

          for (const token of tokens) {
            const { variants, utility } = parseToken(token);
            if (
              /^border-border(\/\S+)?$/.test(utility) &&
              variants.every((v) => LAYOUT_VARIANTS.test(v)) &&
              isField(node)
            ) {
              const literal = plainClassLiteral(node);
              const replacement = token.replace("border-border", "border-input");
              context.report({
                node: at,
                messageId: "fieldEdge",
                data: { token },
                suggest: literal
                  ? [
                      {
                        messageId: "suggestBorderInput",
                        fix: (fixer) =>
                          fixer.replaceText(
                            literal,
                            sourceCode
                              .getText(literal)
                              .replace(
                                new RegExp(`(^|[\\s"'\`])${escape(token)}(?=[\\s"'\`]|$)`, "g"),
                                `$1${replacement}`,
                              ),
                          ),
                      },
                    ]
                  : [],
              });
            }
            if (
              /^(ring-ring|border-ring|outline-ring)(\/\S+)?$/.test(utility) &&
              variants.some((v) => SELECTION_VARIANT.test(v)) &&
              !variants.some((v) => v.includes("focus"))
            ) {
              context.report({ node: at, messageId: "ringSelection", data: { token } });
            }
          }
        }

        const style = getAttribute(node, "style");
        const object = style?.value?.type === "JSXExpressionContainer" ? unwrap(style.value.expression) : undefined;
        if (object?.type !== "ObjectExpression") return;
        const control = isControl(node);
        for (const p of object.properties) {
          if (p.type !== "Property" || p.computed) continue;
          const key = p.key.type === "Identifier" ? p.key.name : String(p.key.value);
          const isInk =
            key === "color" ||
            /^(border|borderTop|borderRight|borderBottom|borderLeft|borderInline|borderBlock|outline|caret|textDecoration|accent)Color$/.test(
              key,
            );
          const isFill = key === "backgroundColor" || key === "background";
          if (!isInk && !(isFill && control)) continue;
          const value = unwrap(p.value);
          if (value?.type !== "Literal" || typeof value.value !== "string" || !COLOUR_VALUE.test(value.value)) continue;
          context.report({ node: p, messageId: "rawStyle", data: { property: key, value: value.value } });
        }
      },
    };
  },
});
