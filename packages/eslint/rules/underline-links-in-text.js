/**
 * justified/underline-links-in-text, for VIS-003b (a rule): a link in
 * running text stands out from the words around it at rest by more than
 * colour, such as by an underline.
 *
 * Flags an `a` with `href`, or a router `Link` imported from `next/link`,
 * `react-router`, `react-router-dom` or `@tanstack/react-router`, when:
 *   - its nearest element is a paragraph or a description where text runs:
 *     `p`, `td`, `TableCell`, or shadcn's `FormDescription`,
 *     `FieldDescription`, `AlertDescription`, `DialogDescription`,
 *     `AlertDialogDescription`, `SheetDescription`, `DrawerDescription` or
 *     `CardDescription`;
 *   - that element holds words of its own beside the link;
 *   - no element around it underlines the links inside it: the `prose`
 *     class, `prose-a:underline`, or a cue at rest with a variant that
 *     reaches links, such as `[&_a]:underline` or `**:underline`;
 *   - its class list is known for certain (a string, or `cn()` and the like
 *     with only strings), and has no cue at rest beyond colour: no
 *     `underline`, `border-b` or font weight from `font-medium` up. A link
 *     with `no-underline`, or with `hover:underline` or `focus:underline`
 *     only, gets its own message.
 *
 * It also flags the `a` mapping given to a Markdown or MDX renderer (in a
 * `components` prop, an object named like `components`, or what
 * `useMDXComponents` returns) when the link it renders has a known class
 * list with no cue.
 *
 * Left alone:
 *   - A link with no `className`. Tailwind's base styles remove the
 *     underline, but a project stylesheet may add it back, which lint
 *     cannot see. The `flagUnstyled` option reports these too.
 *   - Class lists built from expressions, such as `buttonVariants()` or a
 *     condition, and links with `style`, `role` or spread props.
 *   - Links styled as buttons, which the rule's exception leaves out: in
 *     `<Button asChild>`, lists of links, menus and footers the nearest
 *     element is not running text, and a link whose own classes give it a
 *     fill or a full border with padding at the sides is drawn as a button.
 *   - `Button variant="link"`: whether it is underlined at rest depends on
 *     the installed version of the component (Justified's adapter
 *     underlines it), so it is not checked here.
 *   - Visited link colours, and the 3:1 lightness route, which need the
 *     rendered colours.
 */
import { defineRule } from "../lib/define-rule.js";
import { elementName, getAttribute, hasSpread, importedNames, parentElement, staticValue, unwrap } from "../lib/jsx.js";

/** Elements whose own words make a link inside them a link in running text. */
const TEXT_PARENTS = new Set([
  "p",
  "td",
  "TableCell",
  "FormDescription",
  "FieldDescription",
  "AlertDescription",
  "DialogDescription",
  "AlertDialogDescription",
  "SheetDescription",
  "DrawerDescription",
  "CardDescription",
]);
const ROUTERS = ["react-router", "react-router-dom", "@tanstack/react-router"];
/** Functions that join class names. */
const CLASS_JOINERS = new Set(["cn", "clsx", "cx", "classNames", "classnames", "twMerge", "twJoin"]);
/** Variants that apply only in a state, not at rest. */
const STATE_VARIANTS =
  /^(hover|focus|focus-visible|focus-within|active|visited|group-hover|group-focus|group-focus-visible|peer-hover|peer-focus)$/;
/** Utilities that set a link apart by more than colour. */
const CUE = /^(underline|border-b(-\S+)?|font-(medium|semibold|bold|extrabold|black|[5-9]00|\[[5-9]00\]))$/;

/** The words of a class string, as `{ variants, base }`. @param {string} classes */
function tokens(classes) {
  return classes
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const parts = token.split(":");
      const base = parts.pop()?.replace(/^!|!$/g, "") ?? "";
      return { variants: parts, base };
    });
}

/**
 * The class string an expression gives for certain, or `undefined`.
 * @param {any} node
 * @returns {string | undefined}
 */
function staticClasses(node) {
  const n = unwrap(node);
  const value = staticValue(n);
  if (typeof value === "string") return value;
  if (n?.type === "CallExpression" && n.callee.type === "Identifier" && CLASS_JOINERS.has(n.callee.name)) {
    const parts = n.arguments.map(staticClasses);
    return parts.every((p) => typeof p === "string") ? parts.join(" ") : undefined;
  }
  return undefined;
}

/**
 * Every class string an expression may give, for finding `prose` around a link.
 * @param {any} node
 * @returns {string}
 */
function anyClasses(node) {
  const n = unwrap(node);
  if (!n) return "";
  const value = staticValue(n);
  if (typeof value === "string") return value;
  if (n.type === "TemplateLiteral") return n.quasis.map((/** @type {any} */ q) => q.value.cooked).join(" ");
  if (n.type === "CallExpression") return n.arguments.map(anyClasses).join(" ");
  if (n.type === "ConditionalExpression") return `${anyClasses(n.consequent)} ${anyClasses(n.alternate)}`;
  if (n.type === "LogicalExpression") return anyClasses(n.right);
  return "";
}

/** The className attribute's expression or literal. @param {any} opening */
function classAttribute(opening) {
  return getAttribute(opening, "className") ?? getAttribute(opening, "class");
}

/** @param {any} attribute */
const attributeExpression = (attribute) =>
  attribute?.value?.type === "JSXExpressionContainer" ? attribute.value.expression : attribute?.value;

/**
 * What is missing from a known class list: a message id, or `undefined` when the link has a cue.
 * @param {string} classes
 */
function problem(classes) {
  const list = tokens(classes);
  const atRest = list.filter((t) => !t.variants.some((v) => STATE_VARIANTS.test(v)));
  if (atRest.some((t) => CUE.test(t.base))) return undefined;
  if (list.some((t) => t.base === "underline")) return "stateOnly";
  if (atRest.some((t) => t.base === "no-underline")) return "noUnderline";
  return "colourOnly";
}

/** An arbitrary or child variant that reaches links inside, such as `[&_a]`, `[&>a]` or `**`. */
const LINK_TARGET = /^(\*{1,2}|\[&[^\]]*?[_>~+]a(?![\w-])[^\]]*\])$/;
/** Pseudo-classes in an arbitrary variant that apply only in a state. */
const STATE_SELECTOR = /:(hover|focus|focus-visible|focus-within|active|visited)\b/;

/**
 * Whether an ancestor underlines the links inside it: the `prose` class,
 * `prose-a:underline`, or a cue such as `[&_a]:underline` at rest.
 * @param {any} element
 */
function cueFromParent(element) {
  for (let el = parentElement(element); el; el = parentElement(el)) {
    const classes = anyClasses(attributeExpression(classAttribute(el.openingElement)));
    for (const t of tokens(classes)) {
      if (t.base === "prose") return true;
      if (!CUE.test(t.base) || t.variants.some((v) => STATE_VARIANTS.test(v) || STATE_SELECTOR.test(v))) continue;
      if (t.variants.some((v) => v === "prose-a" || LINK_TARGET.test(v))) return true;
    }
  }
  return false;
}

/**
 * Whether a link's own classes draw it as a button at rest: a fill or a
 * full border, with padding on the sides. VIS-003b leaves such links out.
 * @param {string} classes
 */
function looksLikeButton(classes) {
  const atRest = tokens(classes).filter((t) => t.variants.length === 0).map((t) => t.base);
  const fill = atRest.some((b) => /^bg-/.test(b) && !/^bg-(transparent|none|inherit|clip-|origin-|fixed|local|scroll|no-repeat|repeat)/.test(b));
  const edge = atRest.some((b) => /^border(-\d+|-\[\S+\])?$/.test(b));
  const padding = atRest.some((b) => /^(px|p|ps|pe)-/.test(b));
  return (fill || edge) && padding;
}

/** Whether a parent element holds words of its own. @param {any} parent */
const hasOwnWords = (parent) =>
  parent.children.some((/** @type {any} */ c) => c.type === "JSXText" && /[\p{L}\p{N}]/u.test(c.value));

/** The JSX element a function returns, if it is plain to see. @param {any} fn */
function returnedElement(fn) {
  const f = unwrap(fn);
  if (f?.type !== "ArrowFunctionExpression" && f?.type !== "FunctionExpression") return undefined;
  if (f.body.type !== "BlockStatement") return unwrap(f.body)?.type === "JSXElement" ? unwrap(f.body) : undefined;
  const returns = f.body.body.filter((/** @type {any} */ s) => s.type === "ReturnStatement");
  if (returns.length !== 1) return undefined;
  const value = unwrap(returns[0].argument);
  return value?.type === "JSXElement" ? value : undefined;
}

/** Whether an object literal is a renderer's component mapping. @param {any} object */
function isMapping(object) {
  const parent = object.parent;
  if (parent?.type === "JSXExpressionContainer" && parent.parent?.type === "JSXAttribute")
    return parent.parent.name.name === "components";
  if (parent?.type === "VariableDeclarator" && parent.id.type === "Identifier") {
    const annotation = parent.id.typeAnnotation?.typeAnnotation;
    const typeName =
      annotation?.type === "TSTypeReference" && annotation.typeName.type === "Identifier"
        ? annotation.typeName.name
        : "";
    return /components/i.test(parent.id.name) || /Components$/.test(typeName);
  }
  for (let n = parent; n; n = n.parent) {
    if (n.type === "FunctionDeclaration" && n.id?.name === "useMDXComponents") return true;
    if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.id.name === "useMDXComponents") return true;
  }
  return false;
}

export default defineRule({
  id: "VIS-003b",
  level: "rule",
  verdict: "Requirement",
  description:
    "A link in running text that only its colour sets apart at rest: no underline, or one only on hover or focus.",
  schema: [
    {
      type: "object",
      properties: { flagUnstyled: { type: "boolean" } },
      additionalProperties: false,
    },
  ],
  messages: {
    colourOnly:
      "this link sits in running text, and nothing but its colour sets it apart from the words around it. Add underline, for example underline underline-offset-4, so people who do not see the colour difference can find it.",
    stateOnly:
      "this link in running text is underlined only on hover or focus, so it shows only to people who already found it. Underline it at rest, for example underline underline-offset-4.",
    noUnderline:
      "this link in running text has no-underline, so only its colour sets it apart from the words around it. Remove no-underline and add underline underline-offset-4.",
    mapping:
      "the a mapping for rendered Markdown or MDX gives every link in the content no underline at rest, so only colour sets links apart. Add underline to its classes, for example underline underline-offset-4.",
  },
  create(context) {
    const flagUnstyled = context.options[0]?.flagUnstyled ?? false;
    /** Local names of router Link components. */
    const links = new Set();

    /**
     * The problem with a link's own classes, or `undefined` if it has a cue or the classes are not known.
     * @param {any} opening
     */
    function linkProblem(opening) {
      if (hasSpread(opening) || getAttribute(opening, "style") || getAttribute(opening, "role")) return undefined;
      const attribute = classAttribute(opening);
      if (!attribute) return flagUnstyled ? "colourOnly" : undefined;
      const classes = staticClasses(attributeExpression(attribute));
      return classes === undefined ? undefined : problem(classes);
    }

    /** Whether an element is a link. @param {any} opening */
    function isLink(opening) {
      const name = elementName(opening);
      if (name === "a") return Boolean(getAttribute(opening, "href"));
      return Boolean(name && links.has(name));
    }

    return {
      ImportDeclaration(node) {
        for (const local of importedNames(node, "next/link", "default").named) links.add(local);
        if (String(node.source.value) === "next/link")
          for (const s of node.specifiers) if (s.type === "ImportDefaultSpecifier") links.add(s.local.name);
        for (const source of ROUTERS) for (const local of importedNames(node, source, "Link").named) links.add(local);
      },
      JSXOpeningElement(node) {
        if (!isLink(node)) return;
        const element = node.parent;
        const parent = parentElement(element);
        if (!parent || !TEXT_PARENTS.has(elementName(parent.openingElement) ?? "")) return;
        if (!hasOwnWords(parent)) return;
        if (cueFromParent(element)) return;
        const classes = staticClasses(attributeExpression(classAttribute(node)));
        if (classes !== undefined && looksLikeButton(classes)) return;
        const messageId = linkProblem(node);
        if (messageId) context.report({ node, messageId });
      },
      Property(node) {
        const key = node.key.type === "Identifier" ? node.key.name : node.key.value;
        if (node.computed || key !== "a" || node.parent.type !== "ObjectExpression") return;
        if (!isMapping(node.parent)) return;
        const element = returnedElement(node.value);
        if (!element) return;
        const opening = element.openingElement;
        const name = elementName(opening);
        if (name !== "a" && !(name && links.has(name))) return;
        // Props spread after className may replace it; before it, the classes stand.
        const attribute = classAttribute(opening);
        const spreadAfter = opening.attributes.some(
          (/** @type {any} */ a) => a.type === "JSXSpreadAttribute" && (!attribute || a.range[0] > attribute.range[0]),
        );
        if (spreadAfter && attribute) return;
        if (!attribute) {
          if (flagUnstyled) context.report({ node: opening, messageId: "mapping" });
          return;
        }
        if (getAttribute(opening, "style")) return;
        const classes = staticClasses(attributeExpression(attribute));
        if (classes !== undefined && problem(classes)) context.report({ node: opening, messageId: "mapping" });
      },
    };
  },
});
